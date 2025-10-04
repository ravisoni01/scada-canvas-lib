import { SVG_ELEMENTS, SvgElementDefinition } from "../assets/svgElements";
import { EventEmitter } from "../core/EventEmitter";
import {
  CanvasConfig,
  CanvasState,
  ElementConfig,
  GridSettings,
  Point,
  ScadaElement,
  Size,
  ViewportState,
} from "../core/types";
import { ElementFactory } from "../elements/ElementFactory";
import { ElementRegistry } from "../elements/ElementRegistry";
import { InteractionManager } from "../interactions/InteractionManager";
import { DualViewManager } from "./DualViewManager";

export class CanvasManager extends EventEmitter {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private state: CanvasState;
  private animationFrameId: number | null = null;
  private interactionManager: InteractionManager;
  private dualViewManager: DualViewManager | null = null;

  // SVG caching
  private svgCache: Map<string, HTMLImageElement> = new Map();
  private svgLoadPromises: Map<string, Promise<HTMLImageElement>> = new Map();

  // Mouse/touch state
  private isCanvasDragging = false;
  private lastMousePos: Point = { x: 0, y: 0 };
  private mouseDownPos: Point = { x: 0, y: 0 };
  private dragThreshold = 3; // Reduced from 5 to 3 pixels for canvas panning

  constructor(config: CanvasConfig) {
    super();

    // Create or get canvas element
    this.canvas = this.createCanvas(config);
    this.ctx = this.canvas.getContext("2d")!;

    // Initialize interaction manager with settings
    this.interactionManager = new InteractionManager(config.interaction);
    this.setupInteractionEvents();

    // Apply interaction settings
    if (config.interaction?.canvasDragThreshold !== undefined) {
      this.dragThreshold = config.interaction.canvasDragThreshold;
    }

    // Initialize state
    this.state = {
      elements: new Map(),
      selection: [],
      viewport: {
        zoom: config.viewport?.zoom || 1,
        pan: config.viewport?.pan || { x: 0, y: 0 },
        bounds: {
          x: 0,
          y: 0,
          width: this.canvas.width,
          height: this.canvas.height,
        },
      },
      grid: {
        enabled: config.grid?.enabled || true,
        size: config.grid?.size || 20,
        snapToGrid: config.grid?.snapToGrid || false,
        visible: config.grid?.visible || true,
      },
    };

    // Initialize dual-view manager
    if (config.dualViewEnabled) {
      this.dualViewManager = new DualViewManager(this);
    }

    this.setupEventListeners();
    this.startRenderLoop();
  }

  private createCanvas(config: CanvasConfig): HTMLCanvasElement {
    let canvas: HTMLCanvasElement;

    if (config.container) {
      // Create canvas and append to container
      canvas = document.createElement("canvas");
      canvas.width = config.width || 800;
      canvas.height = config.height || 600;
      canvas.style.display = "block";
      config.container.appendChild(canvas);
    } else {
      throw new Error("Container element is required");
    }

    return canvas;
  }

  private setupInteractionEvents(): void {
    this.interactionManager.on("selection-changed", (data) => {
      this.state.selection = data.selectedElements;
      this.emit("selection-changed", data);
    });

    this.interactionManager.on("drag-start", (data) => {
      this.emit("element-drag-start", data);
    });

    this.interactionManager.on("drag-update", (data) => {
      // Element position is already updated by InteractionManager
      // Just emit the event for external listeners
      this.emit("element-drag-update", {
        elementId: data.elementId,
        position: data.position,
      });
    });

    this.interactionManager.on("drag-end", (data) => {
      this.emit("element-drag-end", data);
    });

    this.interactionManager.on("elementSelected", (element) => {
      this.emit("elementSelected", element);
    });

    this.interactionManager.on("elementDeselected", () => {
      this.emit("elementDeselected");
    });

    this.interactionManager.on("resizeStart", (data) => {
      this.emit("resizeStart", data);
    });

    this.interactionManager.on("resizeUpdate", (data) => {
      this.emit("resizeUpdate", data);
    });

    this.interactionManager.on("resizeEnd", (data) => {
      this.emit("resizeEnd", data);
    });
  }

  private setupEventListeners(): void {
    // Mouse events
    this.canvas.addEventListener("mousedown", this.handleMouseDown.bind(this));
    this.canvas.addEventListener("mousemove", this.handleMouseMove.bind(this));
    this.canvas.addEventListener("mouseup", this.handleMouseUp.bind(this));
    this.canvas.addEventListener("wheel", this.handleWheel.bind(this));

    // Touch events for mobile support
    this.canvas.addEventListener(
      "touchstart",
      this.handleTouchStart.bind(this)
    );
    this.canvas.addEventListener("touchmove", this.handleTouchMove.bind(this));
    this.canvas.addEventListener("touchend", this.handleTouchEnd.bind(this));

    // Prevent context menu
    this.canvas.addEventListener("contextmenu", (e) => e.preventDefault());

    // Keyboard events for multi-select
    document.addEventListener("keydown", this.handleKeyDown.bind(this));
    document.addEventListener("keyup", this.handleKeyUp.bind(this));
  }

  private screenToCanvas(screenPoint: Point): Point {
    const rect = this.canvas.getBoundingClientRect();
    return {
      x:
        (screenPoint.x - rect.left - this.state.viewport.pan.x) /
        this.state.viewport.zoom,
      y:
        (screenPoint.y - rect.top - this.state.viewport.pan.y) /
        this.state.viewport.zoom,
    };
  }

  private handleMouseDown(event: MouseEvent): void {
    const screenPos = { x: event.clientX, y: event.clientY };
    const canvasPos = this.screenToCanvas(screenPos);

    this.mouseDownPos = canvasPos;
    this.lastMousePos = screenPos;

    // Update interaction manager with current elements
    this.interactionManager.setElements(this.state.elements);

    // Let interaction manager handle the mouse down
    this.interactionManager.handleMouseDown(
      canvasPos,
      Array.from(this.state.elements.values())
    );

    // Check if we're starting a canvas drag (only if no element interaction AND not resizing)
    const hitResult = this.interactionManager.hitTest(canvasPos);
    if (
      !hitResult.element &&
      !this.interactionManager.isDragging() &&
      !this.interactionManager.isPotentialDrag() &&
      !this.interactionManager.isResizing() // Add this check
    ) {
      this.isCanvasDragging = true;
      this.canvas.style.cursor = "grabbing";
    }
  }

  private handleMouseMove(event: MouseEvent): void {
    const screenPos = { x: event.clientX, y: event.clientY };
    const canvasPos = this.screenToCanvas(screenPos);

    // Update interaction manager with current elements
    this.interactionManager.setElements(this.state.elements);

    // Let interaction manager handle mouse move
    this.interactionManager.handleMouseMove(canvasPos);

    if (this.interactionManager.isDragging()) {
      // Element is being dragged - pass grid settings for precise snapping
      this.interactionManager.updateDrag(canvasPos, this.state.grid);
    } else if (this.isCanvasDragging && !this.interactionManager.isResizing()) {
      // Add resize check here
      // Panning the canvas
      const deltaX = screenPos.x - this.lastMousePos.x;
      const deltaY = screenPos.y - this.lastMousePos.y;

      // Check if we've moved enough to start panning
      const distance = Math.sqrt(
        Math.pow(screenPos.x - this.lastMousePos.x, 2) +
          Math.pow(screenPos.y - this.lastMousePos.y, 2)
      );

      if (distance > this.dragThreshold) {
        this.state.viewport.pan.x += deltaX;
        this.state.viewport.pan.y += deltaY;
        this.emit("viewport-changed", { viewport: this.state.viewport });
      }
    } else {
      // Just hovering - update cursor
      const hitResult = this.interactionManager.hitTest(canvasPos);
      this.canvas.style.cursor = hitResult.element ? "pointer" : "default";
    }

    this.lastMousePos = screenPos;
  }

  // Enhanced coordinate conversion with better precision
  // private screenToCanvas(screenPoint: Point): Point {
  //   const rect = this.canvas.getBoundingClientRect();

  //   // Use more precise calculation to avoid floating-point errors
  //   const x = (screenPoint.x - rect.left - this.state.viewport.pan.x) / this.state.viewport.zoom;
  //   const y = (screenPoint.y - rect.top - this.state.viewport.pan.y) / this.state.viewport.zoom;

  //   return {
  //     x: Math.round(x * 1000) / 1000, // Round to 3 decimal places for precision
  //     y: Math.round(y * 1000) / 1000,
  //   };
  // }

  // Remove the duplicate snap-to-grid logic from setupInteractionEvents
  // private setupInteractionEvents(): void {
  //   this.interactionManager.on("selection-changed", (data) => {
  //     this.state.selection = data.selectedElements;
  //     this.emit("selection-changed", data);
  //   });

  //   this.interactionManager.on("drag-start", (data) => {
  //     this.emit("element-drag-start", data);
  //   });

  //   this.interactionManager.on("drag-update", (data) => {
  //     // Element position is already updated by InteractionManager
  //     // Just emit the event for external listeners
  //     this.emit("element-drag-update", {
  //       elementId: data.elementId,
  //       position: data.position,
  //     });
  //   });

  //   this.interactionManager.on("drag-end", (data) => {
  //     this.emit("element-drag-end", data);
  //   });

  //   this.interactionManager.on("elementSelected", (element) => {
  //     this.emit("elementSelected", element);
  //   });

  //   this.interactionManager.on("elementDeselected", () => {
  //     this.emit("elementDeselected");
  //   });

  //   this.interactionManager.on("resizeStart", (data) => {
  //     this.emit("resizeStart", data);
  //   });

  //   this.interactionManager.on("resizeUpdate", (data) => {
  //     this.emit("resizeUpdate", data);
  //   });

  //   this.interactionManager.on("resizeEnd", (data) => {
  //     this.emit("resizeEnd", data);
  //   });
  // }

  private handleMouseUp(event: MouseEvent): void {
    const screenPos = { x: event.clientX, y: event.clientY };
    const canvasPos = this.screenToCanvas(screenPos);

    // Let interaction manager handle mouse up
    this.interactionManager.handleMouseUp(canvasPos);

    this.isCanvasDragging = false;
    this.canvas.style.cursor = "default";
  }

  private handleWheel(event: WheelEvent): void {
    event.preventDefault();

    const zoomFactor = event.deltaY > 0 ? 0.9 : 1.1;
    const newZoom = Math.max(
      0.1,
      Math.min(5, this.state.viewport.zoom * zoomFactor)
    );

    this.state.viewport.zoom = newZoom;
    this.emit("viewport-changed", { viewport: this.state.viewport });
  }

  // Touch event handlers for mobile support
  private handleTouchStart(event: TouchEvent): void {
    event.preventDefault();
    if (event.touches.length === 1) {
      const touch = event.touches[0];
      this.handleMouseDown({
        clientX: touch.clientX,
        clientY: touch.clientY,
        ctrlKey: false,
        metaKey: false,
      } as MouseEvent);
    }
  }

  private handleTouchMove(event: TouchEvent): void {
    event.preventDefault();
    if (event.touches.length === 1) {
      const touch = event.touches[0];
      this.handleMouseMove({
        clientX: touch.clientX,
        clientY: touch.clientY,
      } as MouseEvent);
    }
  }

  private handleTouchEnd(event: TouchEvent): void {
    event.preventDefault();
    this.handleMouseUp({} as MouseEvent);
  }

  private handleKeyDown(event: KeyboardEvent): void {
    // Let interaction manager handle key down
    this.interactionManager.handleKeyDown(event.key);

    // Delete selected elements
    if (event.key === "Delete" || event.key === "Backspace") {
      const selectedElements = this.interactionManager.getSelectedElements();
      selectedElements.forEach((id) => this.removeElement(id));
    }

    // Select all elements
    if ((event.ctrlKey || event.metaKey) && event.key === "a") {
      event.preventDefault();
      this.selectAllElements();
    }
  }

  private handleKeyUp(event: KeyboardEvent): void {
    // Let interaction manager handle key up
    this.interactionManager.handleKeyUp(event.key);
  }

  private startRenderLoop(): void {
    const render = () => {
      this.render();
      this.animationFrameId = requestAnimationFrame(render);
    };
    render();
  }

  private render(): void {
    // Clear canvas
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    // Save context state
    this.ctx.save();

    // Apply viewport transformations
    this.ctx.translate(this.state.viewport.pan.x, this.state.viewport.pan.y);
    this.ctx.scale(this.state.viewport.zoom, this.state.viewport.zoom);

    // Draw grid if enabled
    if (this.state.grid.enabled && this.state.grid.visible) {
      this.drawGrid();
    }

    // Draw elements
    this.drawElements();

    // Draw selection indicators
    this.drawSelectionIndicators();

    // Restore context state
    this.ctx.restore();
  }

  private drawGrid(): void {
    const { size } = this.state.grid;
    const { zoom, pan } = this.state.viewport;

    this.ctx.strokeStyle = "#e0e0e0";
    this.ctx.lineWidth = 1 / zoom;

    const startX = Math.floor(-pan.x / zoom / size) * size;
    const startY = Math.floor(-pan.y / zoom / size) * size;
    const endX = startX + this.canvas.width / zoom + size;
    const endY = startY + this.canvas.height / zoom + size;

    this.ctx.beginPath();

    // Vertical lines
    for (let x = startX; x <= endX; x += size) {
      this.ctx.moveTo(x, startY);
      this.ctx.lineTo(x, endY);
    }

    // Horizontal lines
    for (let y = startY; y <= endY; y += size) {
      this.ctx.moveTo(startX, y);
      this.ctx.lineTo(endX, y);
    }

    this.ctx.stroke();
  }

  private drawElements(): void {
    // Sort elements by zIndex
    const sortedElements = Array.from(this.state.elements.values()).sort(
      (a, b) => a.zIndex - b.zIndex
    );

    for (const element of sortedElements) {
      if (element.visible) {
        this.drawElement(element);
      }
    }
  }

  // Add this method to replace the current drawElement method
  private drawElement(element: ScadaElement): void {
    this.ctx.save();

    // Move to element position
    this.ctx.translate(element.position.x, element.position.y);

    // Check if element has custom SVG path from library
    if (element.properties?.svgPath) {
      this.drawSvgElement(element);
    } else {
      // Fallback to type-based drawing
      switch (element.type) {
        case "pipe":
          this.drawPipe(element);
          break;
        case "pump":
          this.drawPump(element);
          break;
        case "valve":
          this.drawValve(element);
          break;
        case "text":
          this.drawText(element);
          break;
        default:
          this.drawDefaultElement(element);
      }
    }

    this.ctx.restore();
  }

  // Add this new method for drawing SVG library elements
  private drawSvgElement(element: ScadaElement): void {
    // Skip rendering if element is handled by SVG overlay
    if (element.properties?.renderOnCanvas === false) {
      return;
    }

    const { size } = element;
    const { width, height } = size;
    const svgPath = element.properties.svgPath;

    if (!svgPath) {
      this.drawDefaultElement(element);
      return;
    }

    // Try to get cached SVG
    const cachedSvg = this.svgCache.get(svgPath);

    if (cachedSvg) {
      // Draw the SVG image scaled to the element dimensions
      this.ctx.drawImage(cachedSvg, 0, 0, width, height);

      // Apply any additional styling or effects
      this.applySvgElementEffects(element);
    } else {
      // SVG not loaded yet, draw fallback and load SVG
      this.drawSvgFallback(element);

      // Load SVG asynchronously
      this.loadSVG(svgPath)
        .then(() => {
          // Re-render when SVG is loaded
          this.render();
        })
        .catch((error) => {
          console.warn(`Failed to load SVG: ${svgPath}`, error);
        });
    }
  }

  // Add fallback drawing for when SVG is loading
  private drawSvgFallback(element: ScadaElement): void {
    const { width, height } = element.size;
    const category = element.properties?.category || "unknown";

    // Different fallback styles based on category
    switch (category) {
      case "Pipes":
        this.ctx.fillStyle = element.properties?.fillColor || "#4A90E2";
        this.ctx.strokeStyle = element.properties?.strokeColor || "#2E5C8A";
        this.ctx.lineWidth = 2;
        this.ctx.fillRect(0, 0, width, height);
        this.ctx.strokeRect(0, 0, width, height);
        break;

      case "Pumps":
        const centerX = width / 2;
        const centerY = height / 2;
        const radius = Math.min(width, height) / 2 - 2;

        this.ctx.fillStyle = element.properties?.color || "#2196F3";
        this.ctx.beginPath();
        this.ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI);
        this.ctx.fill();
        break;

      case "Valves":
        this.ctx.fillStyle = element.properties?.color || "#FF9800";
        this.ctx.beginPath();
        this.ctx.moveTo(width / 2, 0);
        this.ctx.lineTo(width, height / 2);
        this.ctx.lineTo(width / 2, height);
        this.ctx.lineTo(0, height / 2);
        this.ctx.closePath();
        this.ctx.fill();
        break;

      default:
        this.drawDefaultElement(element);
    }
  }

  // Add visual effects for SVG elements
  private applySvgElementEffects(element: ScadaElement): void {
    const { width, height } = element.size;

    // Apply opacity if specified
    if (element.properties?.opacity !== undefined) {
      this.ctx.globalAlpha = element.properties.opacity;
    }

    // Apply rotation if specified
    if (element.properties?.rotation) {
      const centerX = width / 2;
      const centerY = height / 2;
      this.ctx.translate(centerX, centerY);
      this.ctx.rotate((element.properties.rotation * Math.PI) / 180);
      this.ctx.translate(-centerX, -centerY);
    }

    // Apply color tinting if specified
    if (element.properties?.tintColor) {
      this.ctx.globalCompositeOperation = "multiply";
      this.ctx.fillStyle = element.properties.tintColor;
      this.ctx.fillRect(0, 0, width, height);
      this.ctx.globalCompositeOperation = "source-over";
    }

    // Apply status indicators (for pumps, valves, etc.)
    // if (element.properties?.status) {
    //   this.drawStatusIndicator(element);
    // }
  }

  // Add status indicators for interactive elements
  private drawStatusIndicator(element: ScadaElement): void {
    const { width, height } = element.size;
    const status = element.properties.status;

    // Draw status indicator in top-right corner
    const indicatorSize = Math.min(width, height) * 0.2;
    const x = width - indicatorSize - 2;
    const y = 2;

    this.ctx.save();

    switch (status) {
      case "running":
      case "open":
        this.ctx.fillStyle = "#4CAF50"; // Green
        break;
      case "stopped":
      case "closed":
        this.ctx.fillStyle = "#F44336"; // Red
        break;
      case "maintenance":
      case "partial":
        this.ctx.fillStyle = "#FF9800"; // Orange
        break;
      default:
        this.ctx.fillStyle = "#9E9E9E"; // Gray
    }

    this.ctx.beginPath();
    this.ctx.arc(
      x + indicatorSize / 2,
      y + indicatorSize / 2,
      indicatorSize / 2,
      0,
      2 * Math.PI
    );
    this.ctx.fill();

    this.ctx.restore();
  }

  /**
   * Load an SVG file and cache it as an Image element
   */
  private async loadSVG(svgPath: string): Promise<HTMLImageElement> {
    // Check if already cached
    if (this.svgCache.has(svgPath)) {
      return this.svgCache.get(svgPath)!;
    }

    // Check if already loading
    if (this.svgLoadPromises.has(svgPath)) {
      return this.svgLoadPromises.get(svgPath)!;
    }

    // Create loading promise
    const loadPromise = new Promise<HTMLImageElement>((resolve, reject) => {
      const img = new Image();

      img.onload = () => {
        this.svgCache.set(svgPath, img);
        this.svgLoadPromises.delete(svgPath);
        resolve(img);
      };

      img.onerror = () => {
        this.svgLoadPromises.delete(svgPath);
        reject(new Error(`Failed to load SVG: ${svgPath}`));
      };

      img.src = svgPath;
    });

    this.svgLoadPromises.set(svgPath, loadPromise);
    return loadPromise;
  }

  private drawPipe(element: ScadaElement): void {
    const { size } = element;
    const { width, height } = size;
    const svgPath =
      "https://s3.ap-south-1.amazonaws.com/app.sandbox.growloc.farm/scada/horizontal-pipe.svg";

    // Try to get cached SVG
    const cachedSvg = this.svgCache.get(svgPath);

    if (cachedSvg) {
      // Draw the SVG image scaled to the pipe dimensions
      // Note: Drawing at (0, 0) because context is already translated to element position
      this.ctx.drawImage(cachedSvg, 0, 0, width, height);
    } else {
      // SVG not loaded yet, draw fallback rectangle and load SVG
      this.ctx.fillStyle = element.properties?.fillColor || "#4A90E2";
      this.ctx.strokeStyle = element.properties?.strokeColor || "#2E5C8A";
      this.ctx.lineWidth = element.properties?.strokeWidth || 2;

      // Draw at (0, 0) because context is already translated to element position
      this.ctx.fillRect(0, 0, width, height);
      this.ctx.strokeRect(0, 0, width, height);

      // Load SVG asynchronously
      this.loadSVG(svgPath)
        .then(() => {
          // Re-render when SVG is loaded
          this.render();
        })
        .catch((error) => {
          console.warn(
            "Failed to load pipe SVG, using fallback rendering:",
            error
          );
        });
    }
  }

  private drawPump(element: ScadaElement): void {
    const { width, height } = element.size;
    const color = element.properties.color || "#2196F3";
    const borderColor = element.properties.borderColor || "#1976D2";

    // Draw pump as circle
    const centerX = width / 2;
    const centerY = height / 2;
    const radius = Math.min(width, height) / 2 - 2;

    this.ctx.fillStyle = color;
    this.ctx.beginPath();
    this.ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI);
    this.ctx.fill();

    this.ctx.strokeStyle = borderColor;
    this.ctx.lineWidth = 2;
    this.ctx.stroke();

    // Draw pump symbol (triangle)
    this.ctx.fillStyle = "#ffffff";
    this.ctx.beginPath();
    this.ctx.moveTo(centerX - radius / 3, centerY + radius / 3);
    this.ctx.lineTo(centerX + radius / 3, centerY);
    this.ctx.lineTo(centerX - radius / 3, centerY - radius / 3);
    this.ctx.closePath();
    this.ctx.fill();
  }

  private drawValve(element: ScadaElement): void {
    const { width, height } = element.size;
    const color = element.properties.color || "#FF9800";
    const borderColor = element.properties.borderColor || "#F57C00";

    // Draw valve as diamond
    const centerX = width / 2;
    const centerY = height / 2;

    this.ctx.fillStyle = color;
    this.ctx.beginPath();
    this.ctx.moveTo(centerX, 0);
    this.ctx.lineTo(width, centerY);
    this.ctx.lineTo(centerX, height);
    this.ctx.lineTo(0, centerY);
    this.ctx.closePath();
    this.ctx.fill();

    this.ctx.strokeStyle = borderColor;
    this.ctx.lineWidth = 2;
    this.ctx.stroke();
  }

  private drawDefaultElement(element: ScadaElement): void {
    const { width, height } = element.size;

    // Default gray rectangle
    this.ctx.fillStyle = "#cccccc";
    this.ctx.fillRect(0, 0, width, height);

    this.ctx.strokeStyle = "#999999";
    this.ctx.lineWidth = 1;
    this.ctx.strokeRect(0, 0, width, height);
  }

  private drawSelectionIndicators(): void {
    const selectedElements = this.interactionManager.getSelectedElements();

    for (const elementId of selectedElements) {
      const element = this.state.elements.get(elementId);
      if (!element || !element.visible) continue;

      this.ctx.save();
      this.ctx.translate(element.position.x, element.position.y);

      // Draw selection border
      this.ctx.strokeStyle = "#2196F3";
      this.ctx.lineWidth = 2 / this.state.viewport.zoom;
      this.ctx.setLineDash([
        5 / this.state.viewport.zoom,
        5 / this.state.viewport.zoom,
      ]);
      this.ctx.strokeRect(
        -2,
        -2,
        element.size.width + 4,
        element.size.height + 4
      );

      // Draw resize handles
      this.drawResizeHandles(element);

      this.ctx.restore();
    }
  }

  private drawResizeHandles(element: ScadaElement): void {
    const handleSize = 8 / this.state.viewport.zoom;
    const { width, height } = element.size;

    this.ctx.fillStyle = "#2196F3";
    this.ctx.strokeStyle = "#ffffff";
    this.ctx.lineWidth = 1 / this.state.viewport.zoom;
    this.ctx.setLineDash([]);

    // Corner handles
    const handles = [
      { x: -handleSize / 2, y: -handleSize / 2 }, // Top-left
      { x: width - handleSize / 2, y: -handleSize / 2 }, // Top-right
      { x: width - handleSize / 2, y: height - handleSize / 2 }, // Bottom-right
      { x: -handleSize / 2, y: height - handleSize / 2 }, // Bottom-left
    ];

    for (const handle of handles) {
      this.ctx.fillRect(handle.x, handle.y, handleSize, handleSize);
      this.ctx.strokeRect(handle.x, handle.y, handleSize, handleSize);
    }
  }

  // Public API methods
  public addElement(
    config: ElementConfig & { useAnimatedPath?: boolean }
  ): string {
    // Validate element type
    const validTypes = ["pipe", "pump", "valve", "text"];
    if (!validTypes.includes(config.type)) {
      throw new Error(`Invalid element type: ${config.type}`);
    }

    const useAnimatedPath = config.useAnimatedPath || false;

    if (config.properties?.svgPath && useAnimatedPath) {
      // Determine the appropriate SVG path based on animation preference
      const svgPath = this.determineSvgPath(config.properties, useAnimatedPath);

      // Update properties with the selected path and animation flag
      config.properties = {
        ...config.properties,
        svgPath: svgPath,
        isAnimated: useAnimatedPath,
      };
    }

    // Use ElementFactory to create element with proper defaults
    const factoryElement = ElementFactory.createElement(
      config.type,
      config.position,
      config.size,
      config.properties
    );

    // Convert to ScadaElement format
    const element: ScadaElement = {
      id: factoryElement.id,
      type: factoryElement.type,
      position: factoryElement.position,
      size: factoryElement.size,
      properties: factoryElement.properties,
      connections: factoryElement.connections,
      zIndex: this.state.elements.size,
      visible: factoryElement.visible,
      locked: factoryElement.locked,
    };

    this.state.elements.set(element.id, element);

    // Update interaction manager
    this.interactionManager.setElements(this.state.elements);

    this.emit("element-added", { element });
    return element.id;
  }

  private determineSvgPath(
    properties: Record<string, any>,
    useAnimatedPath: boolean
  ): string {
    // If animated path is requested and available, use it
    if (useAnimatedPath && properties.animatedSvgPath) {
      return properties.animatedSvgPath;
    }

    // Otherwise, use the standard SVG path
    return properties.svgPath;
  }

  public removeElement(id: string): boolean {
    const element = this.state.elements.get(id);
    if (!element) return false;

    this.state.elements.delete(id);

    // Remove from selection if selected
    const selectedIndex = this.state.selection.indexOf(id);
    if (selectedIndex > -1) {
      this.state.selection.splice(selectedIndex, 1);
      this.interactionManager.clearSelection();
    }

    this.emit("element-removed", { elementId: id });
    return true;
  }

  public updateElement(id: string, updates: Partial<ScadaElement>): boolean {
    const element = this.state.elements.get(id);
    if (!element) return false;

    Object.assign(element, updates);
    this.emit("element-updated", { element });
    return true;
  }

  public selectElement(id: string, multiSelect: boolean = false): void {
    this.interactionManager.selectElement(id, multiSelect);
  }

  public selectAllElements(): void {
    const allIds = Array.from(this.state.elements.keys());
    allIds.forEach((id) => this.interactionManager.selectElement(id, true));
  }

  public clearSelection(): void {
    this.interactionManager.clearSelection();
  }

  public getSelectedElements(): string[] {
    return this.interactionManager.getSelectedElements();
  }

  public getElement(id: string): ScadaElement | undefined {
    return this.state.elements.get(id);
  }

  public getAllElements(): ScadaElement[] {
    return Array.from(this.state.elements.values());
  }

  public getElementsMap(): Map<string, ScadaElement> {
    return this.state.elements;
  }

  public setZoom(zoom: number): void {
    this.state.viewport.zoom = Math.max(0.1, Math.min(5, zoom));
    this.emit("viewport-changed", { viewport: this.state.viewport });
  }

  public setPan(pan: Point): void {
    this.state.viewport.pan = { ...pan };
    this.emit("viewport-changed", { viewport: this.state.viewport });
  }

  public getViewport(): ViewportState {
    return { ...this.state.viewport };
  }

  public getGridSettings(): GridSettings {
    return { ...this.state.grid };
  }

  public setGridSettings(settings: Partial<GridSettings>): void {
    Object.assign(this.state.grid, settings);
    this.emit("grid-changed", { grid: this.state.grid });
  }

  public getCanvas(): HTMLCanvasElement {
    return this.canvas;
  }

  public getInteractionManager(): InteractionManager {
    return this.interactionManager;
  }

  // public getDualViewManager(): DualViewManager {
  //   return this.dualViewManager;
  // }

  public destroy(): void {
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
    }

    // Remove event listeners
    this.canvas.removeEventListener("mousedown", this.handleMouseDown);
    this.canvas.removeEventListener("mousemove", this.handleMouseMove);
    this.canvas.removeEventListener("mouseup", this.handleMouseUp);
    this.canvas.removeEventListener("wheel", this.handleWheel);
    this.canvas.removeEventListener("touchstart", this.handleTouchStart);
    this.canvas.removeEventListener("touchmove", this.handleTouchMove);
    this.canvas.removeEventListener("touchend", this.handleTouchEnd);

    document.removeEventListener("keydown", this.handleKeyDown);
    document.removeEventListener("keyup", this.handleKeyUp);

    // if (this.dualViewManager) {
    //   this.dualViewManager.destroy();
    // }

    this.removeAllListeners();
    this.interactionManager.removeAllListeners();
  }

  // Add this method to the CanvasManager class after line 650

  /**
   * Add element from SVG library
   */
  public addElementFromSvg(
    svgElementId: string,
    position: Point,
    size?: Size
  ): string | null {
    const element = ElementRegistry.createElementFromSvg(
      svgElementId,
      position,
      size
    );
    if (!element) {
      return null;
    }

    // Fix: Assign proper zIndex to ensure correct layering
    element.zIndex = this.state.elements.size;

    this.state.elements.set(element.id, element);
    this.emit("element-added", { element });
    return element.id;
  }

  /**
   * Get available SVG elements
   */
  public getAvailableSvgElements(): SvgElementDefinition[] {
    return SVG_ELEMENTS;
  }

  private drawText(element: ScadaElement): void {
    const { width, height } = element.size;
    const props = element.properties;

    // Draw background if specified
    if (props.backgroundColor && props.backgroundColor !== "transparent") {
      this.ctx.fillStyle = props.backgroundColor;
      this.ctx.fillRect(0, 0, width, height);
    }

    // Draw border
    if (props.borderWidth && props.borderWidth > 0) {
      this.ctx.strokeStyle = props.borderColor || "#cccccc";
      this.ctx.lineWidth = props.borderWidth;
      this.ctx.strokeRect(0, 0, width, height);
    }

    // Set up text properties
    const fontSize = props.fontSize || 14;
    const fontFamily = props.fontFamily || "Arial, sans-serif";
    const fontWeight = props.fontWeight || "normal";
    const fontStyle = props.fontStyle || "normal";

    this.ctx.font = `${fontStyle} ${fontWeight} ${fontSize}px ${fontFamily}`;
    this.ctx.fillStyle = props.color || "#000000";
    this.ctx.textBaseline = "top";

    // Calculate text position based on alignment
    const padding = props.padding || 4;
    const textAlign = props.textAlign || "left";
    const verticalAlign = props.verticalAlign || "middle";

    const textX = this.getTextX(0, width, padding, textAlign);
    const textY = this.getTextY(0, height, padding, fontSize, verticalAlign);

    // Handle text wrapping and rendering
    const text = props.text || "";
    const maxWidth = width - padding * 2;

    if (maxWidth > 0) {
      this.renderWrappedText(text, textX, textY, maxWidth, fontSize, textAlign);
    }
  }

  private getTextX(
    x: number,
    width: number,
    padding: number,
    align: string
  ): number {
    switch (align) {
      case "center":
        return x + width / 2;
      case "right":
        return x + width - padding;
      default: // "left"
        return x + padding;
    }
  }

  private getTextY(
    x: number,
    height: number,
    padding: number,
    fontSize: number,
    vAlign: string
  ): number {
    switch (vAlign) {
      case "middle":
        return x + (height - fontSize) / 2;
      case "bottom":
        return x + height - fontSize - padding;
      default: // "top"
        return x + padding;
    }
  }

  private renderWrappedText(
    text: string,
    x: number,
    y: number,
    maxWidth: number,
    lineHeight: number,
    textAlign: string
  ): void {
    const words = text.split(" ");
    let line = "";
    let currentY = y;

    for (let i = 0; i < words.length; i++) {
      const testLine = line + words[i] + " ";
      const metrics = this.ctx.measureText(testLine);
      const testWidth = metrics.width;

      if (testWidth > maxWidth && i > 0) {
        // Draw the current line
        this.drawTextLine(line.trim(), x, currentY, textAlign);
        line = words[i] + " ";
        currentY += lineHeight + 2; // Add small line spacing
      } else {
        line = testLine;
      }
    }

    // Draw the last line
    if (line.trim()) {
      this.drawTextLine(line.trim(), x, currentY, textAlign);
    }
  }

  private drawTextLine(
    text: string,
    x: number,
    y: number,
    align: string
  ): void {
    if (align === "center") {
      this.ctx.textAlign = "center";
    } else if (align === "right") {
      this.ctx.textAlign = "right";
    } else {
      this.ctx.textAlign = "left";
    }

    this.ctx.fillText(text, x, y);
  }

  public bringToFront(elementId: string): boolean {
    const element = this.state.elements.get(elementId);
    if (!element) return false;

    // Find the highest zIndex
    const maxZIndex = Math.max(
      ...Array.from(this.state.elements.values()).map((el) => el.zIndex)
    );

    // Set this element's zIndex to be higher than all others
    element.zIndex = maxZIndex + 1;

    this.emit("element-updated", { element });
    return true;
  }

  public sendToBack(elementId: string): boolean {
    const element = this.state.elements.get(elementId);
    if (!element) return false;

    // Find the lowest zIndex
    const minZIndex = Math.min(
      ...Array.from(this.state.elements.values()).map((el) => el.zIndex)
    );

    // Set this element's zIndex to be lower than all others
    element.zIndex = minZIndex - 1;

    this.emit("element-updated", { element });
    return true;
  }

  // Add method to check if element is animated
  // public isElementAnimated(elementId: string): boolean {
  //   return this.dualViewManager.isElementAnimated(elementId);
  // }
}
