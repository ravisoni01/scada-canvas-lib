import { ElementFactory, ElementType } from "./ElementFactory";
import { SvgElementDefinition, getSvgElementById } from "../assets/svgElements";
import { ScadaElement, Point, Size } from "../core/types";

// export interface ExtendedElementType extends ElementType {
//   // Add new element types here as we expand
// }

export class ElementRegistry {
  private static svgElementMap: Map<string, SvgElementDefinition> = new Map();

  public static registerSvgElement(definition: SvgElementDefinition): void {
    this.svgElementMap.set(definition.id, definition);
  }

  public static createElementFromSvg(
    svgElementId: string,
    position: Point,
    size?: Size
  ): ScadaElement | null {
    const svgDefinition = getSvgElementById(svgElementId);
    if (!svgDefinition) {
      console.warn(`SVG element definition not found: ${svgElementId}`);
      return null;
    }

    // Map SVG element to SCADA element type
    const elementType = this.mapSvgToElementType(svgElementId);
    const elementSize = size || svgDefinition.defaultSize;
    const properties = {
      ...svgDefinition.properties,
      svgPath: svgDefinition.svgPath,
    };

    try {
      const element = ElementFactory.createElement(
        elementType,
        position,
        elementSize,
        properties
      );
      return element.toScadaElement();
    } catch (error) {
      console.error(
        `Failed to create element from SVG: ${svgElementId}`,
        error
      );
      return null;
    }
  }

  private static mapSvgToElementType(svgElementId: string): ElementType {
    // Map SVG element IDs to existing element types
    if (svgElementId.includes("pipe")) {
      return "pipe";
    } else if (svgElementId.includes("pump")) {
      return "pump";
    } else if (svgElementId.includes("valve")) {
      return "valve";
    }

    // Default to pipe for now
    return "pipe";
  }

  public static getSvgDefinition(
    svgElementId: string
  ): SvgElementDefinition | undefined {
    return getSvgElementById(svgElementId);
  }

  public static getAllSvgElements(): SvgElementDefinition[] {
    return Array.from(this.svgElementMap.values());
  }
}
