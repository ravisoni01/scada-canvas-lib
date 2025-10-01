import { CanvasManager } from "./CanvasManager";
import { ScadaElement, Point, Size } from "../core/types";
import { EventEmitter } from "../core/EventEmitter";

export interface SvgOverlayElement {
  id: string;
  svgElement: SVGElement;
  container: HTMLDivElement;
  isAnimated: boolean;
}

export class DualViewManager extends EventEmitter {
  private canvasManager: CanvasManager;
  private svgContainer!: HTMLDivElement; // Use definite assignment assertion
  private svgOverlays: Map<string, SvgOverlayElement> = new Map();
  private animatedElements: Set<string> = new Set();

  constructor(canvasManager: CanvasManager) {
    super();
    this.canvasManager = canvasManager;
    this.createSvgOverlayContainer();
    this.setupEventListeners();
  }

  private createSvgOverlayContainer(): void {
    const canvasContainer = this.canvasManager.getCanvas().parentElement;
    if (!canvasContainer) return;

    // Create SVG overlay container
    this.svgContainer = document.createElement("div");
    this.svgContainer.style.cssText = `
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      pointer-events: none;
      z-index: 10;
      overflow: hidden;
    `;

    canvasContainer.appendChild(this.svgContainer);
  }

  private setupEventListeners(): void {
    // Listen for canvas element changes
    this.canvasManager.on("element-added", (data) => {
      this.handleElementAdded(data.element);
    });

    this.canvasManager.on("element-updated", (data) => {
      this.handleElementUpdated(data.element);
    });

    this.canvasManager.on("element-removed", (data) => {
      this.handleElementRemoved(data.elementId);
    });

    this.canvasManager.on("viewport-changed", (data) => {
      this.updateAllOverlayPositions();
    });
  }

  private async handleElementAdded(element: ScadaElement): Promise<void> {
    if (!element.properties?.svgPath) return;

    const isAnimated = await this.checkIfElementIsAnimated(element);

    if (isAnimated) {
      await this.createSvgOverlay(element);
      this.animatedElements.add(element.id);

      // Hide element from canvas rendering
      this.canvasManager.updateElement(element.id, {
        ...element,
        properties: {
          ...element.properties,
          renderOnCanvas: false, // Custom flag to skip canvas rendering
        },
      });
    }
  }

  private handleElementUpdated(element: ScadaElement): void {
    const overlay = this.svgOverlays.get(element.id);
    if (overlay) {
      this.updateOverlayPosition(element, overlay);
    }
  }

  private handleElementRemoved(elementId: string): void {
    this.removeSvgOverlay(elementId);
    this.animatedElements.delete(elementId);
  }

  private async checkIfElementIsAnimated(
    element: ScadaElement
  ): Promise<boolean> {
    try {
      const response = await fetch(element.properties.svgPath);
      const svgContent = await response.text();

      // Check for animation elements or CSS animations
      const hasAnimations =
        svgContent.includes("<animate") ||
        svgContent.includes("<animateTransform") ||
        svgContent.includes("<animateMotion") ||
        svgContent.includes("animation:") ||
        svgContent.includes("@keyframes") ||
        // Check for specific animated elements like fans
        (element.id === "circular-fan" && svgContent.includes("rotate"));

      return hasAnimations;
    } catch (error) {
      console.warn(`Failed to check animation for ${element.id}:`, error);
      return false;
    }
  }

  private async createSvgOverlay(element: ScadaElement): Promise<void> {
    try {
      const response = await fetch(element.properties.svgPath);
      const svgContent = await response.text();

      // Create container for the SVG
      const container = document.createElement("div");
      container.style.cssText = `
        position: absolute;
        pointer-events: auto;
        transform-origin: top left;
      `;

      // Parse and insert SVG
      container.innerHTML = svgContent;
      const svgElement = container.querySelector("svg") as SVGElement;

      if (svgElement) {
        // Configure SVG element
        svgElement.style.cssText = `
          width: 100%;
          height: 100%;
          display: block;
        `;

        // Set up click forwarding to canvas interaction manager
        container.addEventListener("click", (event) => {
          event.stopPropagation();
          // Convert screen coordinates to canvas coordinates
          const rect = this.canvasManager.getCanvas().getBoundingClientRect();
          const canvasPoint = {
            x: event.clientX - rect.left,
            y: event.clientY - rect.top,
          };

          // Select the element using the interaction manager
          this.canvasManager
            .getInteractionManager()
            .selectElement(element.id, event.ctrlKey || event.metaKey);

          // Emit element click event
          this.canvasManager.emit("element-clicked", {
            elementId: element.id,
            element: element,
            position: canvasPoint,
            originalEvent: event,
          });
        });

        // Store overlay information
        const overlay: SvgOverlayElement = {
          id: element.id,
          svgElement,
          container,
          isAnimated: true,
        };

        this.svgOverlays.set(element.id, overlay);
        this.svgContainer.appendChild(container);

        // Position the overlay
        this.updateOverlayPosition(element, overlay);
      }
    } catch (error) {
      console.error(`Failed to create SVG overlay for ${element.id}:`, error);
    }
  }

  private updateOverlayPosition(
    element: ScadaElement,
    overlay: SvgOverlayElement
  ): void {
    const viewport = this.canvasManager.getViewport();
    const canvas = this.canvasManager.getCanvas();

    // Calculate position with viewport transformations
    // Apply transformations in the same order as canvas: translate first, then scale
    const x = element.position.x * viewport.zoom + viewport.pan.x;
    const y = element.position.y * viewport.zoom + viewport.pan.y;
    const width = element.size.width * viewport.zoom;
    const height = element.size.height * viewport.zoom;

    // Check if element is within canvas boundaries
    const isWithinBounds = this.isElementWithinCanvasBounds(
      x,
      y,
      width,
      height,
      canvas
    );

    // Determine visibility: element must be visible AND within bounds
    const shouldBeVisible = element.visible && isWithinBounds;

    overlay.container.style.cssText = `
      position: absolute;
      left: ${x}px;
      top: ${y}px;
      width: ${width}px;
      height: ${height}px;
      pointer-events: auto;
      transform-origin: top left;
      z-index: ${element.zIndex || 1};
      visibility: ${shouldBeVisible ? "visible" : "hidden"};
    `;
  }

  private isElementWithinCanvasBounds(
    x: number,
    y: number,
    width: number,
    height: number,
    canvas: HTMLCanvasElement
  ): boolean {
    // Use the actual displayed canvas dimensions, not the internal canvas resolution
    const canvasRect = canvas.getBoundingClientRect();
    const canvasWidth = canvasRect.width;
    const canvasHeight = canvasRect.height;

    // Check if element is completely outside canvas boundaries
    // Left side: element's right edge is before canvas left edge
    if (x + width < 0) return false;

    // // Right side: element's left edge is after canvas right edge
    if (x > canvasWidth) return false;

    // // Top side: element's bottom edge is before canvas top edge
    if (y + height < 0) return false;

    // // Bottom side: element's top edge is after canvas bottom edge
    if (y > canvasHeight) return false;

    // Element is at least partially within canvas bounds
    return true;
  }

  private updateAllOverlayPositions(): void {
    this.svgOverlays.forEach((overlay, elementId) => {
      const element = this.canvasManager.getElement(elementId);
      if (element) {
        this.updateOverlayPosition(element, overlay);
      }
    });
  }

  private removeSvgOverlay(elementId: string): void {
    const overlay = this.svgOverlays.get(elementId);
    if (overlay) {
      overlay.container.remove();
      this.svgOverlays.delete(elementId);
    }
  }

  public isElementAnimated(elementId: string): boolean {
    return this.animatedElements.has(elementId);
  }

  public getAnimatedElements(): string[] {
    return Array.from(this.animatedElements);
  }

  public destroy(): void {
    this.svgOverlays.forEach((overlay) => {
      overlay.container.remove();
    });
    this.svgOverlays.clear();
    this.animatedElements.clear();

    if (this.svgContainer) {
      this.svgContainer.remove();
    }
  }
}
