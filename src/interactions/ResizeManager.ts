import { EventEmitter } from "../core/EventEmitter";
import { Point, Size, ScadaElement } from "../core/types";

export type ResizeHandle = "nw" | "n" | "ne" | "w" | "e" | "sw" | "s" | "se";

export interface ResizeState {
  isResizing: boolean;
  element: ScadaElement | null;
  handle: ResizeHandle | null;
  startPosition: Point;
  startSize: Size;
  startMousePos: Point;
}

export interface ResizeConstraints {
  minWidth: number;
  minHeight: number;
  maxWidth?: number;
  maxHeight?: number;
  aspectRatio?: number;
  lockAspectRatio?: boolean;
  gridSnap?: number;
}

export class ResizeManager extends EventEmitter {
  private state: ResizeState = {
    isResizing: false,
    element: null,
    handle: null,
    startPosition: { x: 0, y: 0 },
    startSize: { width: 0, height: 0 },
    startMousePos: { x: 0, y: 0 },
  };

  private handleSize = 8;
  private handleOffset = 4;

  public startResize(
    element: ScadaElement,
    handle: ResizeHandle,
    mousePos: Point
  ): void {
    this.state = {
      isResizing: true,
      element,
      handle,
      startPosition: { ...element.position },
      startSize: { ...element.size },
      startMousePos: { ...mousePos },
    };

    this.emit("resizeStart", { element, handle });
  }

  public updateResize(
    mousePos: Point,
    constraints: ResizeConstraints,
    shiftKey: boolean = false
  ): void {
    if (!this.state.isResizing || !this.state.element) return;

    const deltaX = mousePos.x - this.state.startMousePos.x;
    const deltaY = mousePos.y - this.state.startMousePos.y;

    let newSize = { ...this.state.startSize };
    let newPosition = { ...this.state.startPosition };

    // Calculate new size based on handle
    switch (this.state.handle) {
      case "nw":
        newSize.width = this.state.startSize.width - deltaX;
        newSize.height = this.state.startSize.height - deltaY;
        newPosition.x = this.state.startPosition.x + deltaX;
        newPosition.y = this.state.startPosition.y + deltaY;
        break;
      case "n":
        newSize.height = this.state.startSize.height - deltaY;
        newPosition.y = this.state.startPosition.y + deltaY;
        break;
      case "ne":
        newSize.width = this.state.startSize.width + deltaX;
        newSize.height = this.state.startSize.height - deltaY;
        newPosition.y = this.state.startPosition.y + deltaY;
        break;
      case "w":
        newSize.width = this.state.startSize.width - deltaX;
        newPosition.x = this.state.startPosition.x + deltaX;
        break;
      case "e":
        newSize.width = this.state.startSize.width + deltaX;
        break;
      case "sw":
        newSize.width = this.state.startSize.width - deltaX;
        newSize.height = this.state.startSize.height + deltaY;
        newPosition.x = this.state.startPosition.x + deltaX;
        break;
      case "s":
        newSize.height = this.state.startSize.height + deltaY;
        break;
      case "se":
        newSize.width = this.state.startSize.width + deltaX;
        newSize.height = this.state.startSize.height + deltaY;
        break;
    }

    // Apply constraints
    newSize = this.applyConstraints(newSize, constraints, shiftKey);

    // Adjust position if size was constrained and we're resizing from top/left
    if (this.state.handle?.includes("w")) {
      newPosition.x =
        this.state.startPosition.x +
        (this.state.startSize.width - newSize.width);
    }
    if (this.state.handle?.includes("n")) {
      newPosition.y =
        this.state.startPosition.y +
        (this.state.startSize.height - newSize.height);
    }

    // Apply grid snapping if enabled
    if (constraints.gridSnap) {
      newSize = this.snapToGrid(newSize, constraints.gridSnap) as Size;
      newPosition = this.snapToGrid(newPosition, constraints.gridSnap) as Point;
    }

    // Update element
    this.state.element.size = newSize;
    this.state.element.position = newPosition;

    this.emit("resizeUpdate", {
      element: this.state.element,
      size: newSize,
      position: newPosition,
    });
  }

  public endResize(): void {
    if (!this.state.isResizing || !this.state.element) return;

    const element = this.state.element;
    this.state = {
      isResizing: false,
      element: null,
      handle: null,
      startPosition: { x: 0, y: 0 },
      startSize: { width: 0, height: 0 },
      startMousePos: { x: 0, y: 0 },
    };

    this.emit("resizeEnd", { element });
  }

  public getResizeHandles(
    element: ScadaElement
  ): Array<{ handle: ResizeHandle; bounds: DOMRect }> {
    const handles: Array<{ handle: ResizeHandle; bounds: DOMRect }> = [];
    const { position, size } = element;

    const handlePositions = {
      nw: {
        x: position.x - this.handleOffset,
        y: position.y - this.handleOffset,
      },
      n: {
        x: position.x + size.width / 2 - this.handleSize / 2,
        y: position.y - this.handleOffset,
      },
      ne: {
        x: position.x + size.width - this.handleOffset,
        y: position.y - this.handleOffset,
      },
      w: {
        x: position.x - this.handleOffset,
        y: position.y + size.height / 2 - this.handleSize / 2,
      },
      e: {
        x: position.x + size.width - this.handleOffset,
        y: position.y + size.height / 2 - this.handleSize / 2,
      },
      sw: {
        x: position.x - this.handleOffset,
        y: position.y + size.height - this.handleOffset,
      },
      s: {
        x: position.x + size.width / 2 - this.handleSize / 2,
        y: position.y + size.height - this.handleOffset,
      },
      se: {
        x: position.x + size.width - this.handleOffset,
        y: position.y + size.height - this.handleOffset,
      },
    };

    for (const [handle, pos] of Object.entries(handlePositions)) {
      handles.push({
        handle: handle as ResizeHandle,
        bounds: new DOMRect(pos.x, pos.y, this.handleSize, this.handleSize),
      });
    }

    return handles;
  }

  public hitTestHandle(
    point: Point,
    element: ScadaElement
  ): ResizeHandle | null {
    const handles = this.getResizeHandles(element);

    for (const { handle, bounds } of handles) {
      if (
        point.x >= bounds.x &&
        point.x <= bounds.x + bounds.width &&
        point.y >= bounds.y &&
        point.y <= bounds.y + bounds.height
      ) {
        return handle;
      }
    }

    return null;
  }

  public renderHandles(
    ctx: CanvasRenderingContext2D,
    element: ScadaElement
  ): void {
    const handles = this.getResizeHandles(element);

    ctx.save();
    ctx.fillStyle = "#2196F3";
    ctx.strokeStyle = "#1976D2";
    ctx.lineWidth = 1;

    for (const { bounds } of handles) {
      ctx.fillRect(bounds.x, bounds.y, bounds.width, bounds.height);
      ctx.strokeRect(bounds.x, bounds.y, bounds.width, bounds.height);
    }

    ctx.restore();
  }

  private applyConstraints(
    size: Size,
    constraints: ResizeConstraints,
    maintainAspectRatio: boolean
  ): Size {
    let { width, height } = size;

    // Apply min/max constraints
    width = Math.max(constraints.minWidth, width);
    height = Math.max(constraints.minHeight, height);

    if (constraints.maxWidth) {
      width = Math.min(constraints.maxWidth, width);
    }
    if (constraints.maxHeight) {
      height = Math.min(constraints.maxHeight, height);
    }

    // Apply aspect ratio if needed
    if (maintainAspectRatio || constraints.lockAspectRatio) {
      const aspectRatio =
        constraints.aspectRatio ||
        this.state.startSize.width / this.state.startSize.height;

      // Determine which dimension to constrain based on the handle
      if (
        this.state.handle?.includes("e") ||
        this.state.handle?.includes("w")
      ) {
        height = width / aspectRatio;
      } else {
        width = height * aspectRatio;
      }

      // Re-apply constraints after aspect ratio adjustment
      width = Math.max(
        constraints.minWidth,
        Math.min(constraints.maxWidth || Infinity, width)
      );
      height = Math.max(
        constraints.minHeight,
        Math.min(constraints.maxHeight || Infinity, height)
      );
    }

    return { width, height };
  }

  private snapToGrid(value: Point | Size, gridSize: number): Point | Size {
    if ("x" in value) {
      return {
        x: Math.round(value.x / gridSize) * gridSize,
        y: Math.round(value.y / gridSize) * gridSize,
      };
    } else {
      return {
        width: Math.round(value.width / gridSize) * gridSize,
        height: Math.round(value.height / gridSize) * gridSize,
      };
    }
  }

  public isResizing(): boolean {
    return this.state.isResizing;
  }

  public getResizeCursor(handle: ResizeHandle): string {
    const cursors = {
      nw: "nw-resize",
      n: "n-resize",
      ne: "ne-resize",
      w: "w-resize",
      e: "e-resize",
      sw: "sw-resize",
      s: "s-resize",
      se: "se-resize",
    };
    return cursors[handle];
  }
}
