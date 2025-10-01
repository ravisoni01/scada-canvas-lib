// Core types and interfaces
export * from "./core/types";

// Event system
export { EventEmitter } from "./core/EventEmitter";

// Canvas management
export { CanvasManager } from "./canvas/CanvasManager";
export { DualViewManager } from "./canvas/DualViewManager";

// Interactions
export { InteractionManager } from "./interactions/InteractionManager";
export type {
  InteractionState,
  HitTestResult,
} from "./interactions/InteractionManager";

// Resize system
export { ResizeManager } from "./interactions/ResizeManager";
export type {
  ResizeHandle,
  ResizeState,
  ResizeConstraints,
} from "./interactions/ResizeManager";

// Property management
export { PropertyManager } from "./properties/PropertyManager";
export type {
  PropertyChange,
  PropertyValidation,
} from "./properties/PropertyManager";

// Elements
export { PipeElement } from "./elements/PipeElement";
export type { PipeProperties } from "./elements/PipeElement";

export {
  ElementFactory,
  PumpElement,
  ValveElement,
  TextElement,
} from "./elements/ElementFactory";
export type {
  ElementType,
  ElementInstance,
  PumpProperties,
  ValveProperties,
  TextProperties,
} from "./elements/ElementFactory";

// Utilities
export * from "./utils";

// Version
export const VERSION = "0.1.0";

// Add these exports after the existing ones

// Element Library System
export { ElementLibrary } from "./library/ElementLibrary";
export type {
  ElementLibraryConfig,
  ElementLibraryState,
} from "./library/ElementLibrary";

export { AssetManager } from "./library/AssetManager";
export type { AssetLoadResult } from "./library/AssetManager";

export { ElementRegistry } from "./elements/ElementRegistry";

// SVG Assets
export * from "./assets/svgElements";
