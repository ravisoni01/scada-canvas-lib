import { EventEmitter } from "../core/EventEmitter";
import { ScadaElement, Point, Size } from "../core/types";

export interface PropertyChange {
  elementId: string;
  property: string;
  oldValue: any;
  newValue: any;
  timestamp: number;
}

export interface PropertyValidation {
  isValid: boolean;
  errors: string[];
}

export class PropertyManager extends EventEmitter {
  private elements: Map<string, ScadaElement> = new Map();
  private history: PropertyChange[] = [];
  private maxHistorySize = 100;

  public registerElement(element: ScadaElement): void {
    this.elements.set(element.id, element);
    this.emit("elementRegistered", element);
  }

  public unregisterElement(elementId: string): void {
    const element = this.elements.get(elementId);
    if (element) {
      this.elements.delete(elementId);
      this.emit("elementUnregistered", element);
    }
  }

  public updateProperty(
    elementId: string,
    property: string,
    value: any
  ): boolean {
    const element = this.elements.get(elementId);
    if (!element) return false;

    const validation = this.validateProperty(element, property, value);
    if (!validation.isValid) {
      this.emit("validationError", {
        elementId,
        property,
        errors: validation.errors,
      });
      return false;
    }

    const oldValue = this.getNestedProperty(element, property);
    this.setNestedProperty(element, property, value);

    const change: PropertyChange = {
      elementId,
      property,
      oldValue,
      newValue: value,
      timestamp: Date.now(),
    };

    this.addToHistory(change);
    this.emit("propertyChanged", change);
    return true;
  }

  public updatePosition(elementId: string, position: Point): boolean {
    return this.updateProperty(elementId, "position", position);
  }

  public updateSize(elementId: string, size: Size): boolean {
    const element = this.elements.get(elementId);
    if (!element) return false;

    // Apply size constraints based on element type
    const constrainedSize = this.applySizeConstraints(element, size);
    return this.updateProperty(elementId, "size", constrainedSize);
  }

  public getProperty(elementId: string, property: string): any {
    const element = this.elements.get(elementId);
    if (!element) return undefined;
    return this.getNestedProperty(element, property);
  }

  public getAllProperties(elementId: string): any {
    return this.elements.get(elementId);
  }

  public validateProperty(
    element: ScadaElement,
    property: string,
    value: any
  ): PropertyValidation {
    const errors: string[] = [];

    // Size validation
    if (property === "size") {
      if (value.width <= 0) errors.push("Width must be greater than 0");
      if (value.height <= 0) errors.push("Height must be greater than 0");

      // Element-specific constraints
      const constraints = this.getSizeConstraints(element);
      if (value.width < constraints.minWidth) {
        errors.push(`Width must be at least ${constraints.minWidth}px`);
      }
      if (value.height < constraints.minHeight) {
        errors.push(`Height must be at least ${constraints.minHeight}px`);
      }
      if (constraints.maxWidth && value.width > constraints.maxWidth) {
        errors.push(`Width cannot exceed ${constraints.maxWidth}px`);
      }
      if (constraints.maxHeight && value.height > constraints.maxHeight) {
        errors.push(`Height cannot exceed ${constraints.maxHeight}px`);
      }
    }

    // Position validation
    if (property === "position") {
      if (typeof value.x !== "number" || typeof value.y !== "number") {
        errors.push("Position must have numeric x and y values");
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  private getSizeConstraints(element: ScadaElement) {
    const defaults = {
      minWidth: 10,
      minHeight: 10,
      maxWidth: undefined,
      maxHeight: undefined,
    };

    switch (element.type) {
      case "pipe":
        return {
          ...defaults,
          minWidth: 20,
          minHeight: 5,
        };
      case "pump":
        return {
          ...defaults,
          minWidth: 30,
          minHeight: 30,
        };
      case "valve":
        return {
          ...defaults,
          minWidth: 20,
          minHeight: 20,
        };
      default:
        return defaults;
    }
  }

  private applySizeConstraints(element: ScadaElement, size: Size): Size {
    const constraints = this.getSizeConstraints(element);

    return {
      width: Math.max(
        constraints.minWidth,
        constraints.maxWidth
          ? Math.min(size.width, constraints.maxWidth)
          : size.width
      ),
      height: Math.max(
        constraints.minHeight,
        constraints.maxHeight
          ? Math.min(size.height, constraints.maxHeight)
          : size.height
      ),
    };
  }

  private getNestedProperty(obj: any, path: string): any {
    return path.split(".").reduce((current, key) => current?.[key], obj);
  }

  private setNestedProperty(obj: any, path: string, value: any): void {
    const keys = path.split(".");
    const lastKey = keys.pop()!;
    const target = keys.reduce((current, key) => {
      if (!current[key]) current[key] = {};
      return current[key];
    }, obj);
    target[lastKey] = value;
  }

  private addToHistory(change: PropertyChange): void {
    this.history.push(change);
    if (this.history.length > this.maxHistorySize) {
      this.history.shift();
    }
  }

  public getHistory(elementId?: string): PropertyChange[] {
    if (elementId) {
      return this.history.filter((change) => change.elementId === elementId);
    }
    return [...this.history];
  }

  public undo(): boolean {
    const lastChange = this.history.pop();
    if (!lastChange) return false;

    this.setNestedProperty(
      this.elements.get(lastChange.elementId),
      lastChange.property,
      lastChange.oldValue
    );

    this.emit("propertyChanged", {
      ...lastChange,
      newValue: lastChange.oldValue,
      oldValue: lastChange.newValue,
    });

    return true;
  }
}
