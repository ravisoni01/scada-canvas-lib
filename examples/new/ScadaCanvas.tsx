import { forwardRef, useEffect, useImperativeHandle, useRef } from "react";
import { CanvasManager, ElementConfig, ScadaElement } from "scada-canvas-lib";

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
  removeElement: (id: string) => boolean;
  selectElement: (id: string) => void;
  clearSelection: () => void;
  getSelectedElements: () => string[];
  getAllElements: () => ScadaElement[];
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
      });

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
      removeElement: (id: string) => {
        return canvasManagerRef.current?.removeElement(id) || false;
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
