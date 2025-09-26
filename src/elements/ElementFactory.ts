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

export interface TextProperties {
  text?: string;
  fontSize?: number;
  fontFamily?: string;
  fontWeight?: "normal" | "bold" | "lighter" | "bolder";
  fontStyle?: "normal" | "italic" | "oblique";
  color?: string;
  backgroundColor?: string;
  borderColor?: string;
  borderWidth?: number;
  textAlign?: "left" | "center" | "right";
  verticalAlign?: "top" | "middle" | "bottom";
  padding?: number;
  editable?: boolean;
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

export class TextElement {
  public readonly id: string;
  public readonly type = "text";
  public position: Point;
  public size: Size;
  public properties: TextProperties;
  public connections: string[] = [];
  public zIndex: number = 0;
  public visible: boolean = true;
  public locked: boolean = false;

  constructor(
    position: Point,
    size: Size = { width: 120, height: 30 },
    properties: TextProperties = {}
  ) {
    this.id = generateId();
    this.position = { ...position };
    this.size = { ...size };
    this.properties = {
      text: "Text",
      fontSize: 14,
      fontFamily: "Arial, sans-serif",
      fontWeight: "normal",
      fontStyle: "normal",
      color: "#000000",
      backgroundColor: "transparent",
      borderColor: "#cccccc",
      borderWidth: 1,
      textAlign: "left",
      verticalAlign: "middle",
      padding: 4,
      editable: true,
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

    // Draw background if specified
    if (props.backgroundColor && props.backgroundColor !== "transparent") {
      ctx.fillStyle = props.backgroundColor;
      ctx.fillRect(x, y, width, height);
    }

    // Draw border
    if (props.borderWidth && props.borderWidth > 0) {
      ctx.strokeStyle = props.borderColor!;
      ctx.lineWidth = props.borderWidth;
      ctx.strokeRect(x, y, width, height);
    }

    // Set up text properties
    const fontSize = props.fontSize!;
    const fontFamily = props.fontFamily!;
    const fontWeight = props.fontWeight!;
    const fontStyle = props.fontStyle!;
    
    ctx.font = `${fontStyle} ${fontWeight} ${fontSize}px ${fontFamily}`;
    ctx.fillStyle = props.color!;
    ctx.textBaseline = "top";

    // Calculate text position based on alignment
    const padding = props.padding!;
    const textX = this.getTextX(x, width, padding, props.textAlign!);
    const textY = this.getTextY(y, height, padding, fontSize, props.verticalAlign!);

    // Handle text wrapping and rendering
    const text = props.text || "";
    const maxWidth = width - (padding * 2);
    
    if (maxWidth > 0) {
      this.renderWrappedText(ctx, text, textX, textY, maxWidth, fontSize);
    }

    ctx.restore();
  }

  private getTextX(x: number, width: number, padding: number, align: string): number {
    switch (align) {
      case "center":
        return x + width / 2;
      case "right":
        return x + width - padding;
      default: // "left"
        return x + padding;
    }
  }

  private getTextY(x: number, height: number, padding: number, fontSize: number, vAlign: string): number {
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
    ctx: CanvasRenderingContext2D,
    text: string,
    x: number,
    y: number,
    maxWidth: number,
    lineHeight: number
  ): void {
    const words = text.split(' ');
    let line = '';
    let currentY = y;

    for (let i = 0; i < words.length; i++) {
      const testLine = line + words[i] + ' ';
      const metrics = ctx.measureText(testLine);
      const testWidth = metrics.width;

      if (testWidth > maxWidth && i > 0) {
        // Draw the current line
        this.drawTextLine(ctx, line.trim(), x, currentY);
        line = words[i] + ' ';
        currentY += lineHeight + 2; // Add small line spacing
      } else {
        line = testLine;
      }
    }

    // Draw the last line
    if (line.trim()) {
      this.drawTextLine(ctx, line.trim(), x, currentY);
    }
  }

  private drawTextLine(ctx: CanvasRenderingContext2D, text: string, x: number, y: number): void {
    const align = this.properties.textAlign!;
    
    if (align === "center") {
      ctx.textAlign = "center";
    } else if (align === "right") {
      ctx.textAlign = "right";
    } else {
      ctx.textAlign = "left";
    }
    
    ctx.fillText(text, x, y);
  }

  public updatePosition(position: Point): void {
    this.position = { ...position };
  }

  public updateSize(size: Size): void {
    this.size = { ...size };
  }

  public updateProperties(properties: Partial<TextProperties>): void {
    this.properties = { ...this.properties, ...properties };
  }

  public clone(): TextElement {
    return new TextElement(this.position, this.size, { ...this.properties });
  }
}

export type ElementType = "pipe" | "pump" | "valve" | "text";
export type ElementInstance = PipeElement | PumpElement | ValveElement | TextElement;

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
      case "text":
        return new TextElement(position, size, properties);
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
      case "text":
        return { width: 120, height: 30 };
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
      case "text":
        return {
          minWidth: 20,
          minHeight: 15,
          aspectRatio: undefined,
          lockAspectRatio: false,
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
