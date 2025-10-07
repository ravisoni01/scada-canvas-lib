import { ScadaElement, ViewportState } from "../core/types";

export class LODManager {
  static getLODLevel(
    element: ScadaElement,
    viewport: ViewportState
  ): "minimal" | "low" | "medium" | "high" {
    const scale = viewport.zoom;
    const elementSize =
      Math.max(element.size.width, element.size.height) * scale;

    if (elementSize < 10) return "minimal";
    if (elementSize < 30) return "low";
    if (elementSize < 100) return "medium";
    return "high";
  }

  static shouldRenderElement(
    element: ScadaElement,
    viewport: ViewportState
  ): boolean {
    const lodLevel = this.getLODLevel(element, viewport);
    return lodLevel !== "minimal";
  }

  static getSimplifiedElement(
    element: ScadaElement,
    lodLevel: string
  ): Partial<ScadaElement> {
    switch (lodLevel) {
      case "minimal":
        return { ...element, properties: {} }; // No details
      case "low":
        return { ...element, properties: { color: element.properties?.color } }; // Basic color only
      case "medium":
        return { ...element }; // Standard rendering
      case "high":
      default:
        return element; // Full detail
    }
  }
}
