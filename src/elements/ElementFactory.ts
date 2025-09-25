import { ScadaElement, Point, Size } from "../core/types";
import { PipeElement, PipeProperties } from "./PipeElement";
import { generateId } from "../utils";

export interface PumpProperties {
  color?: string;
  borderColor?: string;
  borderWidth?: number;
  flowRate?: number;
  pressure?: number;
  power?: number;
  efficiency?: number;
  status?: "running" | "stopped" | "maintenance";
}

export interface ValveProperties {
  color?: string;
  borderColor?: string;
  borderWidth?: number;
  position?: number; // 0-100 percentage
  type?: "ball" | "gate" | "butterfly" | "check";
  status?: "open" | "closed" | "partial";
}

export class PumpElement {
  public readonly id: string;
  public readonly type = "pump";
  public position: Point;
  public size: Size;
  public properties: PumpProperties;
  public connections: string[] = [];
  public zIndex: number = 0;
  public visible: boolean = true;
  public locked: boolean = false;

  constructor(
    position: Point,
    size: Size = { width: 60, height: 60 },
    properties: PumpProperties = {}
  ) {
    this.id = generateId();
    this.position = { ...position };
    this.size = { ...size };
    this.properties = {
      color: "#FF9800",
      borderColor: "#F57C00",
      borderWidth: 2,
      flowRate: 0,
      pressure: 0,
      power: 0,
      efficiency: 85,
      status: "stopped",
      ...properties,
    };
  }

  public toScadaElement(): ScadaElement {
    return {
      id: this.id,
      type: this.type,
      position: this.position,
      size: this.size,
      properties: this.properties,
      connections: this.connections,
      zIndex: this.zIndex,
      visible: this.visible,
      locked: this.locked,
    };
  }

  public render(ctx: CanvasRenderingContext2D): void {
    const { x, y } = this.position;
    const { width, height } = this.size;
    const props = this.properties;

    ctx.save();

    // Draw pump body (circle)
    const centerX = x + width / 2;
    const centerY = y + height / 2;
    const radius = Math.min(width, height) / 2 - props.borderWidth!;

    ctx.fillStyle = props.color!;
    ctx.strokeStyle = props.borderColor!;
    ctx.lineWidth = props.borderWidth!;

    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Draw impeller (rotating indicator)
    ctx.strokeStyle = props.borderColor!;
    ctx.lineWidth = 2;
    const impellerRadius = radius * 0.6;

    for (let i = 0; i < 6; i++) {
      const angle = (i * Math.PI) / 3;
      ctx.beginPath();
      ctx.moveTo(centerX, centerY);
      ctx.lineTo(
        centerX + Math.cos(angle) * impellerRadius,
        centerY + Math.sin(angle) * impellerRadius
      );
      ctx.stroke();
    }

    // Status indicator
    const statusColor =
      props.status === "running"
        ? "#4CAF50"
        : props.status === "maintenance"
          ? "#FF5722"
          : "#757575";
    ctx.fillStyle = statusColor;
    ctx.beginPath();
    ctx.arc(centerX + radius * 0.7, centerY - radius * 0.7, 4, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  }

  public updatePosition(position: Point): void {
    this.position = { ...position };
  }

  public updateSize(size: Size): void {
    // Maintain circular aspect ratio
    const minDimension = Math.min(size.width, size.height);
    this.size = { width: minDimension, height: minDimension };
  }

  public updateProperties(properties: Partial<PumpProperties>): void {
    this.properties = { ...this.properties, ...properties };
  }

  public clone(): PumpElement {
    return new PumpElement(this.position, this.size, { ...this.properties });
  }
}

export class ValveElement {
  public readonly id: string;
  public readonly type = "valve";
  public position: Point;
  public size: Size;
  public properties: ValveProperties;
  public connections: string[] = [];
  public zIndex: number = 0;
  public visible: boolean = true;
  public locked: boolean = false;

  constructor(
    position: Point,
    size: Size = { width: 40, height: 40 },
    properties: ValveProperties = {}
  ) {
    this.id = generateId();
    this.position = { ...position };
    this.size = { ...size };
    this.properties = {
      color: "#9C27B0",
      borderColor: "#7B1FA2",
      borderWidth: 2,
      position: 0,
      type: "ball",
      status: "closed",
      ...properties,
    };
  }

  public toScadaElement(): ScadaElement {
    return {
      id: this.id,
      type: this.type,
      position: this.position,
      size: this.size,
      properties: this.properties,
      connections: this.connections,
      zIndex: this.zIndex,
      visible: this.visible,
      locked: this.locked,
    };
  }

  public render(ctx: CanvasRenderingContext2D): void {
    const { x, y } = this.position;
    const { width, height } = this.size;
    const props = this.properties;

    ctx.save();

    const centerX = x + width / 2;
    const centerY = y + height / 2;

    // Draw valve body
    ctx.fillStyle = props.color!;
    ctx.strokeStyle = props.borderColor!;
    ctx.lineWidth = props.borderWidth!;

    if (props.type === "ball") {
      // Ball valve - diamond shape
      ctx.beginPath();
      ctx.moveTo(centerX, y);
      ctx.lineTo(x + width, centerY);
      ctx.lineTo(centerX, y + height);
      ctx.lineTo(x, centerY);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // Ball indicator
      const ballRadius = Math.min(width, height) * 0.2;
      ctx.fillStyle = props.status === "open" ? "#4CAF50" : "#F44336";
      ctx.beginPath();
      ctx.arc(centerX, centerY, ballRadius, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.restore();
  }

  public updatePosition(position: Point): void {
    this.position = { ...position };
  }

  public updateSize(size: Size): void {
    this.size = { ...size };
  }

  public updateProperties(properties: Partial<ValveProperties>): void {
    this.properties = { ...this.properties, ...properties };
  }

  public clone(): ValveElement {
    return new ValveElement(this.position, this.size, { ...this.properties });
  }
}

export type ElementType = "pipe" | "pump" | "valve";
export type ElementInstance = PipeElement | PumpElement | ValveElement;

export class ElementFactory {
  public static createElement(
    type: ElementType,
    position: Point,
    size?: Size,
    properties?: any
  ): ElementInstance {
    switch (type) {
      case "pipe":
        return new PipeElement(position, size, properties);
      case "pump":
        return new PumpElement(position, size, properties);
      case "valve":
        return new ValveElement(position, size, properties);
      default:
        throw new Error(`Unknown element type: ${type}`);
    }
  }

  public static getDefaultSize(type: ElementType): Size {
    switch (type) {
      case "pipe":
        return { width: 100, height: 20 };
      case "pump":
        return { width: 60, height: 60 };
      case "valve":
        return { width: 40, height: 40 };
      default:
        return { width: 50, height: 50 };
    }
  }

  public static getResizeConstraints(type: ElementType) {
    switch (type) {
      case "pipe":
        return {
          minWidth: 20,
          minHeight: 5,
          aspectRatio: undefined,
          lockAspectRatio: false,
        };
      case "pump":
        return {
          minWidth: 30,
          minHeight: 30,
          aspectRatio: 1,
          lockAspectRatio: true,
        };
      case "valve":
        return {
          minWidth: 20,
          minHeight: 20,
          aspectRatio: 1,
          lockAspectRatio: true,
        };
      default:
        return {
          minWidth: 10,
          minHeight: 10,
          aspectRatio: undefined,
          lockAspectRatio: false,
        };
    }
  }
}
