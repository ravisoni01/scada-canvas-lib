import React, {
  useRef,
  useEffect,
  useImperativeHandle,
  forwardRef,
  useCallback,
} from "react";
import {
  CanvasManager,
  ScadaElement,
  ElementConfig,
  Point,
  Size,
  SvgElementDefinition,
} from "scada-canvas-lib";
import { useDualView } from "./hooks/useDualView";

export interface ScadaCanvasProps {
  width: number;
  height: number;
  gridEnabled?: boolean;
  gridSize?: number;
  snapToGrid?: boolean;
  onElementAdded?: (element: ScadaElement) => void;
  onElementRemoved?: (elementId: string) => void;
  onSelectionChanged?: (selectedIds: string[]) => void;
  onElementUpdated?: (element: ScadaElement) => void;
}

export interface ScadaCanvasRef {
  addElement: (config: ElementConfig) => string;
  removeElement: (id: string) => boolean;
  updateElement: (id: string, updates: Partial<ScadaElement>) => boolean;
  selectElement: (id: string, multiSelect?: boolean) => void;
  clearSelection: () => void;
  getSelectedElements: () => string[];
  getElement: (id: string) => ScadaElement | undefined;
  getAllElements: () => ScadaElement[];
  setZoom: (zoom: number) => void;
  resetView: () => void;
  addElementFromSvg: (
    svgElementId: string,
    position: Point,
    size?: Size
  ) => string | null;
  getAvailableSvgElements: () => SvgElementDefinition[];
  isElementAnimated: (elementId: string) => boolean;
}

const ScadaCanvas = forwardRef<ScadaCanvasRef, ScadaCanvasProps>(
  (
    {
      width,
      height,
      gridEnabled = true,
      gridSize = 20,
      snapToGrid = false,
      onElementAdded,
      onElementRemoved,
      onSelectionChanged,
      onElementUpdated,
    },
    ref
  ) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const canvasManagerRef = useRef<CanvasManager | null>(null);
    
    // Use the dual-view hook
    const { isElementAnimated } = useDualView(canvasManagerRef.current);

    // Initialize canvas manager
    useEffect(() => {
      if (containerRef.current && !canvasManagerRef.current) {
        canvasManagerRef.current = new CanvasManager({
          container: containerRef.current,
          width,
          height,
          grid: {
            enabled: gridEnabled,
            size: gridSize,
            snapToGrid,
            visible: gridEnabled,
          },
        });

        // Set up event listeners
        const manager = canvasManagerRef.current;

        if (onElementAdded) {
          manager.on("element-added", (data) => onElementAdded(data.element));
        }

        if (onElementRemoved) {
          manager.on("element-removed", (data) =>
            onElementRemoved(data.elementId)
          );
        }

        if (onSelectionChanged) {
          manager.on("selection-changed", (data) =>
            onSelectionChanged(data.selectedElements)
          );
        }

        if (onElementUpdated) {
          manager.on("element-updated", (data) =>
            onElementUpdated(data.element)
          );
        }
      }

      return () => {
        if (canvasManagerRef.current) {
          canvasManagerRef.current.destroy();
          canvasManagerRef.current = null;
        }
      };
    }, []);

    // Update canvas size when props change
    useEffect(() => {
      if (canvasManagerRef.current) {
        const canvas = canvasManagerRef.current.getCanvas();
        canvas.width = width;
        canvas.height = height;
        canvas.style.width = `${width}px`;
        canvas.style.height = `${height}px`;
      }
    }, [width, height]);

    // Expose methods through ref
    useImperativeHandle(ref, () => ({
      addElement: (config: ElementConfig) => {
        return canvasManagerRef.current?.addElement(config) || "";
      },
      removeElement: (id: string) => {
        return canvasManagerRef.current?.removeElement(id) || false;
      },
      updateElement: (id: string, updates: Partial<ScadaElement>) => {
        return canvasManagerRef.current?.updateElement(id, updates) || false;
      },
      selectElement: (id: string, multiSelect = false) => {
        canvasManagerRef.current?.selectElement(id, multiSelect);
      },
      clearSelection: () => {
        canvasManagerRef.current?.clearSelection();
      },
      getSelectedElements: () => {
        return canvasManagerRef.current?.getSelectedElements() || [];
      },
      getElement: (id: string) => {
        return canvasManagerRef.current?.getElement(id);
      },
      getAllElements: () => {
        return canvasManagerRef.current?.getAllElements() || [];
      },
      setZoom: (zoom: number) => {
        canvasManagerRef.current?.setZoom(zoom);
      },
      resetView: () => {
        canvasManagerRef.current?.setZoom(1);
        canvasManagerRef.current?.setPan({ x: 0, y: 0 });
      },
      addElementFromSvg: (
        svgElementId: string,
        position: Point,
        size?: Size
      ) => {
        return (
          canvasManagerRef.current?.addElementFromSvg(
            svgElementId,
            position,
            size
          ) || null
        );
      },
      getAvailableSvgElements: () => {
        return canvasManagerRef.current?.getAvailableSvgElements() || [];
      },
      isElementAnimated: (elementId: string) => {
        return canvasManagerRef.current?.isElementAnimated(elementId) || false;
      },
    }));

    return (
      <div
        ref={containerRef}
        style={{
          position: "relative",
          width: `${width}px`,
          height: `${height}px`,
          border: "1px solid #ccc",
          overflow: "hidden",
        }}
      />
    );
  }
);

ScadaCanvas.displayName = "ScadaCanvas";

export default ScadaCanvas;
