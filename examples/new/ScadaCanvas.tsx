import { forwardRef, useEffect, useImperativeHandle, useRef } from "react";
import {
  CanvasConfig,
  CanvasManager,
  ElementConfig,
  ScadaElement,
} from "scada-canvas-lib";

export interface ScadaCanvasProps {
  width?: number;
  height?: number;
  backgroundColor?: string;
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
  addElementFromSvg: (
    svgElementId: string,
    position: { x: number; y: number },
    size?: { width: number; height: number }
  ) => string | null;
  removeElement: (id: string) => boolean;
  updateElement: (id: string, updates: Partial<ScadaElement>) => boolean;
  selectElement: (id: string) => void;
  clearSelection: () => void;
  getSelectedElements: () => string[];
  getAllElements: () => ScadaElement[];
  getElement: (id: string) => ScadaElement | undefined;
  setZoom: (zoom: number) => void;
  resetView: () => void;
}

const ScadaCanvas = forwardRef<ScadaCanvasRef, ScadaCanvasProps>(
  (
    {
      width = 800,
      height = 600,
      backgroundColor = "#f5f5f5",
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

    useEffect(() => {
      if (!containerRef.current) return;

      // Initialize Canvas Manager
      const canvasManager = new CanvasManager({
        container: containerRef.current,
        width,
        height,
        backgroundColor,
        grid: {
          enabled: gridEnabled,
          size: gridSize,
          snapToGrid,
          visible: gridEnabled,
        },
        interaction: {
          elementDragThreshold: 1, // Very sensitive - start drag after 1px movement
          canvasDragThreshold: 2, // Start canvas pan after 2px movement
        },
      } as CanvasConfig);

      canvasManagerRef.current = canvasManager;

      // Set up event listeners
      const handleElementAdded = (event: any) => {
        onElementAdded?.(event.element);
      };

      const handleElementRemoved = (event: any) => {
        onElementRemoved?.(event.elementId);
      };

      const handleSelectionChanged = (event: any) => {
        onSelectionChanged?.(event.selectedIds || []);
      };

      const handleElementUpdated = (event: any) => {
        onElementUpdated?.(event.element);
      };

      canvasManager.on("element-added", handleElementAdded);
      canvasManager.on("element-removed", handleElementRemoved);
      canvasManager.on("selection-changed", handleSelectionChanged);
      canvasManager.on("element-updated", handleElementUpdated);

      // Cleanup
      return () => {
        canvasManager.off("element-added", handleElementAdded);
        canvasManager.off("element-removed", handleElementRemoved);
        canvasManager.off("selection-changed", handleSelectionChanged);
        canvasManager.off("element-updated", handleElementUpdated);
        canvasManager.destroy();
      };
    }, [width, height, backgroundColor, gridEnabled, gridSize, snapToGrid]);

    // Expose methods through ref
    useImperativeHandle(ref, () => ({
      addElement: (config: ElementConfig) => {
        return canvasManagerRef.current?.addElement(config) || "";
      },
      addElementFromSvg: (
        svgElementId: string,
        position: { x: number; y: number },
        size?: { width: number; height: number }
      ) => {
        return (
          canvasManagerRef.current?.addElementFromSvg(
            svgElementId,
            position,
            size
          ) || null
        );
      },
      removeElement: (id: string) => {
        return canvasManagerRef.current?.removeElement(id) || false;
      },
      updateElement: (id: string, updates: Partial<ScadaElement>) => {
        return canvasManagerRef.current?.updateElement(id, updates) || false;
      },
      selectElement: (id: string) => {
        canvasManagerRef.current?.selectElement(id);
      },
      clearSelection: () => {
        canvasManagerRef.current?.clearSelection();
      },
      getSelectedElements: () => {
        return canvasManagerRef.current?.getSelectedElements() || [];
      },
      getAllElements: () => {
        return canvasManagerRef.current?.getAllElements() || [];
      },
      getElement: (id: string) => {
        return canvasManagerRef.current?.getElement(id);
      },
      setZoom: (zoom: number) => {
        canvasManagerRef.current?.setZoom(zoom);
      },
      resetView: () => {
        canvasManagerRef.current?.setZoom(1);
        canvasManagerRef.current?.setPan({ x: 0, y: 0 });
      },
    }));

    return (
      <div
        ref={containerRef}
        style={{
          width: `${width}px`,
          height: `${height}px`,
          border: "1px solid #ccc",
          borderRadius: "4px",
          overflow: "hidden",
        }}
      />
    );
  }
);

ScadaCanvas.displayName = "ScadaCanvas";

export default ScadaCanvas;
