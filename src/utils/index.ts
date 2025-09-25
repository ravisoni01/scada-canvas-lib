import { Point, Rectangle } from "../core/types";

/**
 * Generate unique ID
 */
export function generateId(): string {
  return Math.random().toString(36).substr(2, 9);
}

/**
 * Calculate distance between two points
 */
export function distance(p1: Point, p2: Point): number {
  const dx = p2.x - p1.x;
  const dy = p2.y - p1.y;
  return Math.sqrt(dx * dx + dy * dy);
}

/**
 * Check if point is inside rectangle
 */
export function pointInRect(point: Point, rect: Rectangle): boolean {
  return (
    point.x >= rect.x &&
    point.x <= rect.x + rect.width &&
    point.y >= rect.y &&
    point.y <= rect.y + rect.height
  );
}

/**
 * Clamp value between min and max
 */
export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

/**
 * Convert screen coordinates to canvas coordinates
 */
export function screenToCanvas(
  screenPoint: Point,
  canvasRect: DOMRect,
  zoom: number,
  pan: Point
): Point {
  return {
    x: (screenPoint.x - canvasRect.left - pan.x) / zoom,
    y: (screenPoint.y - canvasRect.top - pan.y) / zoom,
  };
}

/**
 * Convert canvas coordinates to screen coordinates
 */
export function canvasToScreen(
  canvasPoint: Point,
  canvasRect: DOMRect,
  zoom: number,
  pan: Point
): Point {
  return {
    x: canvasPoint.x * zoom + pan.x + canvasRect.left,
    y: canvasPoint.y * zoom + pan.y + canvasRect.top,
  };
}

/**
 * Enhanced screen to canvas conversion with better precision
 */
export function screenToCanvasPrecise(
  screenPoint: Point,
  canvasRect: DOMRect,
  zoom: number,
  pan: Point
): Point {
  const x = (screenPoint.x - canvasRect.left - pan.x) / zoom;
  const y = (screenPoint.y - canvasRect.top - pan.y) / zoom;

  return {
    x: Math.round(x * 1000) / 1000, // 3 decimal precision
    y: Math.round(y * 1000) / 1000,
  };
}

/**
 * Precise grid snapping with configurable tolerance
 */
export function snapToGridPrecise(
  point: Point,
  gridSize: number,
  tolerance: number = 0.3
): Point {
  const snappedX = Math.round(point.x / gridSize) * gridSize;
  const snappedY = Math.round(point.y / gridSize) * gridSize;

  const deltaX = Math.abs(point.x - snappedX);
  const deltaY = Math.abs(point.y - snappedY);

  const snapThreshold = gridSize * tolerance;

  return {
    x: deltaX <= snapThreshold ? snappedX : Math.round(point.x * 100) / 100,
    y: deltaY <= snapThreshold ? snappedX : Math.round(point.y * 100) / 100,
  };
}
