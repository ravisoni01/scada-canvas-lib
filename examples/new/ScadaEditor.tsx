import React, { useRef, useState, useCallback } from "react";
import ScadaCanvas, { ScadaCanvasRef } from "./ScadaCanvas";
import ScadaToolbar from "./ScadaToolbar";
import { ScadaElement, ElementType, ElementConfig } from "scada-canvas-lib";
import SvgElementLibrary from "./SvgElementLibrary";

interface ScadaEditorProps {
  width?: number;
  height?: number;
  onSave?: (elements: ScadaElement[]) => void;
  initialElements?: ElementConfig[];
}

const ScadaEditor: React.FC<ScadaEditorProps> = ({
  width = 800,
  height = 600,
  onSave,
  initialElements = [],
}) => {
  const canvasRef = useRef<ScadaCanvasRef>(null);
  const [selectedCount, setSelectedCount] = useState(0);
  const [elements, setElements] = useState<ScadaElement[]>([]);
  const [zoom, setZoom] = useState(1);

  // Handle element addition
  const handleAddElement = useCallback(
    (type: ElementType, position: { x: number; y: number }) => {
      if (!canvasRef.current) return;

      const config: ElementConfig = {
        type,
        position,
        size:
          type === "pipe"
            ? { width: 100, height: 20 }
            : type === "pump"
              ? { width: 60, height: 60 }
              : { width: 40, height: 40 },
      };

      canvasRef.current.addElement(config);
    },
    []
  );

  // Handle selection changes
  const handleSelectionChanged = useCallback((selectedIds: string[]) => {
    setSelectedCount(selectedIds.length);
  }, []);

  // Handle element updates
  const handleElementAdded = useCallback((element: ScadaElement) => {
    setElements((prev) => [...prev, element]);
  }, []);

  const handleElementRemoved = useCallback((elementId: string) => {
    setElements((prev) => prev.filter((el) => el.id !== elementId));
  }, []);

  const handleElementUpdated = useCallback((element: ScadaElement) => {
    setElements((prev) =>
      prev.map((el) => (el.id === element.id ? element : el))
    );
  }, []);

  // Toolbar actions
  const handleClearSelection = useCallback(() => {
    canvasRef.current?.clearSelection();
  }, []);

  const handleDeleteSelected = useCallback(() => {
    const selectedIds = canvasRef.current?.getSelectedElements() || [];
    selectedIds.forEach((id) => {
      canvasRef.current?.removeElement(id);
    });
  }, []);

  const handleZoomIn = useCallback(() => {
    const newZoom = Math.min(zoom * 1.2, 3);
    setZoom(newZoom);
    canvasRef.current?.setZoom(newZoom);
  }, [zoom]);

  const handleZoomOut = useCallback(() => {
    const newZoom = Math.max(zoom / 1.2, 0.1);
    setZoom(newZoom);
    canvasRef.current?.setZoom(newZoom);
  }, [zoom]);

  const handleResetView = useCallback(() => {
    setZoom(1);
    canvasRef.current?.resetView();
  }, []);

  const handleSave = useCallback(() => {
    const allElements = canvasRef.current?.getAllElements() || [];
    onSave?.(allElements);
  }, [onSave]);

  // Load initial elements
  React.useEffect(() => {
    if (initialElements.length > 0 && canvasRef.current) {
      initialElements.forEach((config) => {
        canvasRef.current?.addElement(config);
      });
    }
  }, [initialElements]);

  return (
    <div
      style={{
        border: "1px solid #ddd",
        borderRadius: "8px",
        overflow: "hidden",
      }}
    >
      <ScadaToolbar
        onAddElement={handleAddElement}
        onClearSelection={handleClearSelection}
        onDeleteSelected={handleDeleteSelected}
        onZoomIn={handleZoomIn}
        onZoomOut={handleZoomOut}
        onResetView={handleResetView}
        selectedCount={selectedCount}
      />

      <ScadaCanvas
        ref={canvasRef}
        width={width}
        height={height}
        gridEnabled={true}
        gridSize={20}
        snapToGrid={true}
        onElementAdded={handleElementAdded}
        onElementRemoved={handleElementRemoved}
        onSelectionChanged={handleSelectionChanged}
        onElementUpdated={handleElementUpdated}
      />

      <div
        style={{
          padding: "10px",
          borderTop: "1px solid #ccc",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          backgroundColor: "#f9f9f9",
        }}
      >
        <div>
          Elements: {elements.length} | Selected: {selectedCount} | Zoom:{" "}
          {Math.round(zoom * 100)}%
        </div>
        {onSave && (
          <button onClick={handleSave} style={{ padding: "5px 15px" }}>
            Save
          </button>
        )}
      </div>
    </div>
  );
};

export default ScadaEditor;
