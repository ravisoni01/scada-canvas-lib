import { ElementType } from "../elements/ElementFactory";

/**
 * Basic geometric types
 */
export interface Point {
  x: number;
  y: number;
}

export interface Size {
  width: number;
  height: number;
}

export interface Rectangle {
  x: number;
  y: number;
  width: number;
  height: number;
}

/**
 * Core SCADA element interface
 */
export interface ScadaElement {
  id: string;
  type: string;
  position: Point;
  size: Size;
  properties: Record<string, any>;
  connections: string[];
  zIndex: number;
  visible: boolean;
  locked: boolean;
}

/**
 * Canvas state management
 */
export interface CanvasState {
  elements: Map<string, ScadaElement>;
  selection: string[];
  viewport: ViewportState;
  grid: GridSettings;
}

export interface ViewportState {
  zoom: number;
  pan: Point;
  bounds: Rectangle;
}

export interface GridSettings {
  enabled: boolean;
  visible: boolean;
  size: number;
  snapToGrid: boolean;
  snapTolerance?: number; // New: Tolerance for snapping (0.1 to 1.0)
  precisionMode?: boolean; // New: Enable high-precision positioning
}

/**
 * Interaction settings for drag and drop behavior
 */
export interface InteractionSettings {
  elementDragThreshold?: number; // Pixels to move before starting element drag (default: 2)
  canvasDragThreshold?: number; // Pixels to move before starting canvas pan (default: 3)
}

/**
 * Event system types
 */
export interface CanvasEvent {
  type: string;
  timestamp: number;
  data: any;
}

export interface ElementEvent extends CanvasEvent {
  elementId: string;
}

/**
 * Configuration types
 */
export interface CanvasConfig {
  container: HTMLElement;
  width?: number;
  height?: number;
  backgroundColor?: string;
  grid?: Partial<GridSettings>;
  viewport?: Partial<ViewportState>;
  interaction?: InteractionSettings;
}

/**
 * Element creation configuration
 */
export interface ElementConfig {
  type: ElementType;
  position: Point;
  size?: Size;
  properties?: Record<string, any>;
}
