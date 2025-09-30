import React, { useRef, useState, useCallback } from "react";
import ScadaCanvas, { ScadaCanvasRef } from "./ScadaCanvas";
import ScadaToolbar from "./ScadaToolbar";
import SvgElementLibrary from "./SvgElementLibrary";
import TextPropertiesPanel from "./TextPropertiesPanel";
import {
  ScadaElement,
  ElementType,
  ElementConfig,
  SvgElementDefinition,
  TextProperties,
} from "scada-canvas-lib";

interface ScadaEditorProps {
  width?: number;
  height?: number;
  onSave?: (elements: ScadaElement[]) => void;
  initialElements?: ElementConfig[];
}

const ScadaEditor: React.FC<ScadaEditorProps> = ({
  width = 1500,
  height = 600,
  onSave,
  initialElements = [],
}) => {
  const canvasRef = useRef<ScadaCanvasRef>(null);
  const [selectedCount, setSelectedCount] = useState(0);
  const [selectedElement, setSelectedElement] = useState<ScadaElement | null>(
    null
  );
  const [elements, setElements] = useState<ScadaElement[]>([]);
  const [zoom, setZoom] = useState(1);
  const [showElementLibrary, setShowElementLibrary] = useState(true);
  const [showPropertiesPanel, setShowPropertiesPanel] = useState(true);

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
              : type === "text"
                ? { width: 120, height: 30 }
                : { width: 40, height: 40 },
        // Add default properties for text elements
        properties:
          type === "text"
            ? {
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
              }
            : undefined,
      };

      canvasRef.current.addElement(config);
    },
    []
  );

  // Handle SVG element selection
  const handleSvgElementSelect = useCallback(
    (svgElement: SvgElementDefinition) => {
      if (!canvasRef.current) return;

      // Add SVG element to canvas at a default position
      const position = {
        x: 200 + Math.random() * 200,
        y: 150 + Math.random() * 200,
      };
      canvasRef.current.addElementFromSvg(
        svgElement.id,
        position,
        svgElement.defaultSize
      );
    },
    []
  );

  // Handle selection changes
  const handleSelectionChanged = useCallback((selectedIds: string[]) => {
    setSelectedCount(selectedIds.length);

    // Get the selected element for properties panel
    if (selectedIds.length === 1 && canvasRef.current) {
      const element = canvasRef.current.getElement(selectedIds[0]);
      setSelectedElement(element || null);
    } else {
      setSelectedElement(null);
    }
  }, []);

  // Handle text properties update
  const handleUpdateTextProperties = useCallback(
    (elementId: string, properties: Partial<TextProperties>) => {
      if (!canvasRef.current) return;

      const updates = {
        properties: properties,
      };

      canvasRef.current.updateElement(elementId, updates);
    },
    []
  );

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
        display: "flex",
        flexDirection: "column",
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
        onToggleElementLibrary={() =>
          setShowElementLibrary(!showElementLibrary)
        }
        showElementLibrary={showElementLibrary}
        onTogglePropertiesPanel={() =>
          setShowPropertiesPanel(!showPropertiesPanel)
        }
        showPropertiesPanel={showPropertiesPanel}
      />

      <div style={{ display: "flex", flex: 1 }}>
        {/* Element Library Sidebar */}
        {showElementLibrary && (
          <div
            style={{
              width: "250px",
              borderRight: "1px solid #ddd",
              backgroundColor: "#f9f9f9",
              padding: "12px",
              overflowY: "auto",
            }}
          >
            <SvgElementLibrary onElementSelect={handleSvgElementSelect} />
          </div>
        )}

        {/* Canvas Area */}
        <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
          <ScadaCanvas
            ref={canvasRef}
            width={width - (!showPropertiesPanel ? 280 : 0)}
            height={height}
            gridEnabled={true}
            gridSize={20}
            snapToGrid={true}
            onElementAdded={handleElementAdded}
            onElementRemoved={handleElementRemoved}
            onSelectionChanged={handleSelectionChanged}
            onElementUpdated={handleElementUpdated}
          />
        </div>

        {/* Properties Panel */}
        {/* {showPropertiesPanel && ( */}
        <div
          style={{
            width: "280px",
            borderLeft: "1px solid #ddd",
            backgroundColor: "#f9f9f9",
            overflowY: "auto",
          }}
        >
          <TextPropertiesPanel
            selectedElement={selectedElement}
            onUpdateElement={handleUpdateTextProperties}
          />
        </div>
        {/* )} */}
      </div>

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
