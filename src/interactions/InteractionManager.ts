import { EventEmitter } from "../core/EventEmitter";
import { ScadaElement, Point, Size, InteractionSettings } from "../core/types";
import {
  ResizeManager,
  ResizeHandle,
  ResizeConstraints,
} from "./ResizeManager";
import { ElementFactory } from "../elements/ElementFactory";

export interface InteractionState {
  mode: "pan" | "select" | "drag";
  selectedElements: string[];
  draggedElement: string | null;
  dragOffset: Point;
  isMultiSelect: boolean;
  // New: Track potential drag state
  potentialDragElement: string | null;
  dragStartPoint: Point | null;
}

export interface HitTestResult {
  element: ScadaElement | null;
  point: Point;
}

export class InteractionManager extends EventEmitter {
  private state: InteractionState;
  private elements: Map<string, ScadaElement>;
  private resizeManager: ResizeManager;
  private settings: InteractionSettings;

  constructor(settings: InteractionSettings = {}) {
    super();
    this.state = {
      mode: "select",
      selectedElements: [],
      draggedElement: null,
      dragOffset: { x: 0, y: 0 },
      isMultiSelect: false,
      // New: Initialize potential drag state
      potentialDragElement: null,
      dragStartPoint: null,
    };
    this.elements = new Map();
    this.resizeManager = new ResizeManager();
    this.settings = {
      elementDragThreshold: settings.elementDragThreshold || 2,
      canvasDragThreshold: settings.canvasDragThreshold || 3,
    };
    this.setupResizeEvents();
  }

  private setupResizeEvents(): void {
    this.resizeManager.on("resizeStart", (data) => {
      this.emit("resizeStart", data);
    });

    this.resizeManager.on("resizeUpdate", (data) => {
      this.emit("resizeUpdate", data);
    });

    this.resizeManager.on("resizeEnd", (data) => {
      this.emit("resizeEnd", data);
    });
  }

  public setElements(elements: Map<string, ScadaElement>): void {
    this.elements = elements;
  }

  public setMode(mode: "pan" | "select" | "drag"): void {
    this.state.mode = mode;
    this.emit("mode-changed", { mode });
  }

  public getMode(): string {
    return this.state.mode;
  }

  public hitTest(point: Point): HitTestResult {
    // Convert screen coordinates to canvas coordinates
    const canvasPoint = { ...point };

    // Test elements in reverse z-order (top to bottom)
    const sortedElements = Array.from(this.elements.values()).sort(
      (a, b) => b.zIndex - a.zIndex
    );

    for (const element of sortedElements) {
      if (!element.visible || element.locked) continue;

      const bounds = {
        left: element.position.x,
        top: element.position.y,
        right: element.position.x + element.size.width,
        bottom: element.position.y + element.size.height,
      };

      if (
        canvasPoint.x >= bounds.left &&
        canvasPoint.x <= bounds.right &&
        canvasPoint.y >= bounds.top &&
        canvasPoint.y <= bounds.bottom
      ) {
        return { element, point: canvasPoint };
      }
    }

    return { element: null, point: canvasPoint };
  }

  public selectElement(
    elementId: string | ScadaElement,
    multiSelect: boolean = false
  ): void {
    const id = typeof elementId === "string" ? elementId : elementId.id;
    const element =
      typeof elementId === "string" ? this.elements.get(id) : elementId;

    if (!element) {
      console.warn(`Element with id ${id} not found in InteractionManager`);
      return;
    }

    if (!multiSelect) {
      this.state.selectedElements = [id];

      // Emit events for compatibility
      this.emit("elementSelected", element);
      this.emit("selection-changed", {
        selectedElements: [...this.state.selectedElements],
      });
    } else {
      const index = this.state.selectedElements.indexOf(id);
      if (index === -1) {
        this.state.selectedElements.push(id);
      } else {
        this.state.selectedElements.splice(index, 1);
      }

      this.emit("selection-changed", {
        selectedElements: [...this.state.selectedElements],
      });
    }
  }

  public clearSelection(): void {
    if (this.state.selectedElements.length > 0) {
      this.emit("elementDeselected");
    }
    this.state.selectedElements = [];
    this.emit("selection-changed", { selectedElements: [] });
  }

  public deselectElement(): void {
    this.clearSelection();
  }

  public getSelectedElements(): string[] {
    return [...this.state.selectedElements];
  }

  public getSelectedElement(): ScadaElement | null {
    if (this.state.selectedElements.length === 0) return null;
    return this.elements.get(this.state.selectedElements[0]) || null;
  }

  public isSelected(elementId: string): boolean {
    return this.state.selectedElements.includes(elementId);
  }

  public startDrag(elementId: string, startPoint: Point): void {
    const element = this.elements.get(elementId);
    if (!element || element.locked) return;

    this.state.draggedElement = elementId;

    // Enhanced offset calculation for better precision
    this.state.dragOffset = {
      x: startPoint.x - element.position.x,
      y: startPoint.y - element.position.y,
    };

    this.emit("drag-start", { elementId, startPoint });
  }

  public updateDrag(
    currentPoint: Point,
    gridSettings?: { enabled: boolean; size: number; snapToGrid: boolean }
  ): void {
    if (!this.state.draggedElement) return;

    const element = this.elements.get(this.state.draggedElement);
    if (!element) return;

    // Calculate raw new position
    let newPosition = {
      x: currentPoint.x - this.state.dragOffset.x,
      y: currentPoint.y - this.state.dragOffset.y,
    };

    // Apply enhanced grid snapping with better precision
    if (gridSettings?.snapToGrid && gridSettings?.enabled) {
      newPosition = this.snapToGridPrecise(newPosition, gridSettings.size);
    }

    // Round to prevent floating-point precision issues
    newPosition = {
      x: Math.round(newPosition.x * 100) / 100,
      y: Math.round(newPosition.y * 100) / 100,
    };

    element.position = newPosition;
    this.emit("drag-update", {
      elementId: this.state.draggedElement,
      position: newPosition,
    });
  }

  public endDrag(): void {
    if (this.state.draggedElement) {
      this.emit("drag-end", { elementId: this.state.draggedElement });
      this.state.draggedElement = null;
      this.state.dragOffset = { x: 0, y: 0 };
    }
  }

  public isDragging(): boolean {
    return this.state.draggedElement !== null;
  }

  public getDraggedElement(): string | null {
    return this.state.draggedElement;
  }

  public handleMouseDown(point: Point, elements: ScadaElement[]): void {
    // Check for resize handle first
    if (this.state.selectedElements.length > 0) {
      const selectedElement = this.elements.get(this.state.selectedElements[0]);
      if (selectedElement) {
        const handle = this.resizeManager.hitTestHandle(point, selectedElement);
        if (handle) {
          const constraints = ElementFactory.getResizeConstraints(
            selectedElement.type as any
          );
          this.resizeManager.startResize(selectedElement, handle, point);
          this.state.mode = "drag";
          return;
        }
      }
    }

    // Hit test for element selection
    const hitResult = this.hitTest(point);
    if (hitResult.element) {
      this.selectElement(hitResult.element.id);
      // Instead of immediately starting drag, set up potential drag
      this.state.potentialDragElement = hitResult.element.id;
      this.state.dragStartPoint = { ...point };
    } else {
      this.clearSelection();
      this.state.potentialDragElement = null;
      this.state.dragStartPoint = null;
    }
  }

  public handleMouseMove(point: Point): void {
    if (this.state.mode === "drag" && this.resizeManager.isResizing()) {
      const selectedElement = this.elements.get(this.state.selectedElements[0]);
      if (selectedElement) {
        const constraints = ElementFactory.getResizeConstraints(
          selectedElement.type as any
        );
        this.resizeManager.updateResize(
          point,
          constraints,
          this.state.isMultiSelect
        );
      }
      return;
    }

    // Check if we should start dragging an element
    if (this.state.potentialDragElement && this.state.dragStartPoint) {
      const distance = Math.sqrt(
        Math.pow(point.x - this.state.dragStartPoint.x, 2) +
          Math.pow(point.y - this.state.dragStartPoint.y, 2)
      );

      if (distance > this.settings.elementDragThreshold!) {
        // Start the actual drag
        this.startDrag(
          this.state.potentialDragElement,
          this.state.dragStartPoint
        );
        this.state.potentialDragElement = null;
        this.state.dragStartPoint = null;
      }
    }

    // Update cursor based on what's under the mouse
    const cursor = this.getCursor(point);
    this.emit("cursor-change", { cursor });
  }

  public handleMouseUp(point: Point): void {
    if (this.state.mode === "drag" && this.resizeManager.isResizing()) {
      this.resizeManager.endResize();
      this.state.mode = "select";
      return;
    }

    // Clear potential drag state if we haven't started dragging
    this.state.potentialDragElement = null;
    this.state.dragStartPoint = null;

    this.endDrag();
  }

  // New method to check if we're in a potential drag state
  public isPotentialDrag(): boolean {
    return this.state.potentialDragElement !== null;
  }

  // New method to get drag threshold settings
  public getDragThreshold(): number {
    return this.settings.elementDragThreshold || 2;
  }

  public handleKeyDown(key: string): void {
    switch (key) {
      case "Shift":
        this.state.isMultiSelect = true;
        break;
      case "Escape":
        this.clearSelection();
        break;
    }
  }

  public handleKeyUp(key: string): void {
    switch (key) {
      case "Shift":
        this.state.isMultiSelect = false;
        break;
    }
  }

  public renderSelection(ctx: CanvasRenderingContext2D): void {
    if (this.state.selectedElements.length === 0) return;

    const selectedElement = this.elements.get(this.state.selectedElements[0]);
    if (!selectedElement) return;

    // Draw selection outline
    ctx.save();
    ctx.strokeStyle = "#2196F3";
    ctx.lineWidth = 2;
    ctx.setLineDash([5, 5]);

    const { x, y } = selectedElement.position;
    const { width, height } = selectedElement.size;

    ctx.strokeRect(x - 2, y - 2, width + 4, height + 4);

    // Draw resize handles
    this.resizeManager.renderHandles(ctx, selectedElement);

    ctx.restore();
  }

  public getCursor(point: Point): string {
    if (
      this.state.selectedElements.length > 0 &&
      this.elements.get(this.state.selectedElements[0])
    ) {
      const handle = this.resizeManager.hitTestHandle(
        point,
        this.elements.get(this.state.selectedElements[0])!
      );
      if (handle) {
        return this.resizeManager.getResizeCursor(handle);
      }
    }

    const hitResult = this.hitTest(point);
    return hitResult.element ? "pointer" : "default";
  }

  // Additional methods for HTML compatibility
  public deleteSelectedElements(): void {
    const selectedIds = [...this.state.selectedElements];
    selectedIds.forEach((id) => {
      this.elements.delete(id);
    });
    this.clearSelection();
    this.emit("elements-deleted", { elementIds: selectedIds });
  }

  public selectAll(): void {
    const allIds = Array.from(this.elements.keys());
    this.state.selectedElements = [...allIds];
    this.emit("selection-changed", {
      selectedElements: [...this.state.selectedElements],
    });
  }

  public getInteractionMode(): string {
    return this.state.mode;
  }

  public setInteractionMode(mode: "pan" | "select" | "drag"): void {
    this.setMode(mode);
  }
  private snapToGridPrecise(point: Point, gridSize: number): Point {
    // Enhanced snapping with better precision and reduced spacing
    const tolerance = gridSize * 0.3; // 30% tolerance for snapping

    const snappedX = Math.round(point.x / gridSize) * gridSize;
    const snappedY = Math.round(point.y / gridSize) * gridSize;

    // Only snap if within tolerance, otherwise use precise positioning
    const deltaX = Math.abs(point.x - snappedX);
    const deltaY = Math.abs(point.y - snappedY);

    return {
      x: deltaX <= tolerance ? snappedX : point.x,
      y: deltaY <= tolerance ? snappedY : point.y,
    };
  }
}
