import { ScadaElement, Point, Size } from "../core/types";
import { generateId } from "../utils";

export interface PipeProperties {
  color?: string;
  borderColor?: string;
  borderWidth?: number;
  flowDirection?: "horizontal" | "vertical";
  flowRate?: number;
  pressure?: number;
  temperature?: number;
  material?: string;
  diameter?: number;
}

export class PipeElement {
  public readonly id: string;
  public readonly type = "pipe";
  public position: Point;
  public size: Size;
  public properties: PipeProperties;
  public connections: string[] = [];
  public zIndex: number = 0;
  public visible: boolean = true;
  public locked: boolean = false;
  public scale: number = 1.0;

  constructor(
    position: Point,
    size: Size = { width: 100, height: 20 },
    properties: PipeProperties = {}
  ) {
    this.id = generateId();
    this.position = { ...position };
    this.size = { ...size };
    this.properties = {
      color: "#4CAF50",
      borderColor: "#2E7D32",
      borderWidth: 2,
      flowDirection: "horizontal",
      flowRate: 0,
      pressure: 0,
      temperature: 20,
      material: "steel",
      diameter: 100,
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

  public updatePosition(position: Point): void {
    this.position = { ...position };
  }

  public updateSize(size: Size): void {
    this.size = { ...size };
  }

  public updateProperties(properties: Partial<PipeProperties>): void {
    this.properties = { ...this.properties, ...properties };
  }

  public setFlowRate(rate: number): void {
    this.properties.flowRate = rate;
  }

  public setPressure(pressure: number): void {
    this.properties.pressure = pressure;
  }

  public setTemperature(temperature: number): void {
    this.properties.temperature = temperature;
  }

  public addConnection(elementId: string): void {
    if (!this.connections.includes(elementId)) {
      this.connections.push(elementId);
    }
  }

  public removeConnection(elementId: string): void {
    const index = this.connections.indexOf(elementId);
    if (index > -1) {
      this.connections.splice(index, 1);
    }
  }

  public clone(): PipeElement {
    const cloned = new PipeElement(
      { ...this.position },
      { ...this.size },
      { ...this.properties }
    );
    cloned.connections = [...this.connections];
    cloned.zIndex = this.zIndex;
    cloned.visible = this.visible;
    cloned.locked = this.locked;
    return cloned;
  }
}
