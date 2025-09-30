import React from "react";
import { ElementType } from "scada-canvas-lib";

interface ScadaToolbarProps {
  onAddElement: (type: ElementType, position: { x: number; y: number }) => void;
  onClearSelection: () => void;
  onDeleteSelected: () => void;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onResetView: () => void;
  onToggleElementLibrary: () => void;
  onTogglePropertiesPanel: () => void;
  selectedCount: number;
  showElementLibrary: boolean;
  showPropertiesPanel: boolean;
}

const ScadaToolbar: React.FC<ScadaToolbarProps> = ({
  onAddElement,
  onClearSelection,
  onDeleteSelected,
  onZoomIn,
  onZoomOut,
  onResetView,
  onToggleElementLibrary,
  onTogglePropertiesPanel,
  selectedCount,
  showElementLibrary,
  showPropertiesPanel,
}) => {
  const handleAddElement = (type: ElementType) => {
    // Add element at center of canvas
    onAddElement(type, { x: 400, y: 300 });
  };

  return (
    <div
      style={{
        padding: "10px",
        borderBottom: "1px solid #ccc",
        display: "flex",
        gap: "10px",
        alignItems: "center",
        flexWrap: "wrap",
        backgroundColor: "#f8f9fa",
      }}
    >
      {/* Panel Toggles */}
      <div style={{ display: "flex", gap: "5px" }}>
        <button
          onClick={onToggleElementLibrary}
          style={{
            padding: "8px 12px",
            backgroundColor: showElementLibrary ? "#007bff" : "#6c757d",
            color: "white",
            border: "none",
            borderRadius: "4px",
            cursor: "pointer",
            fontSize: "14px",
          }}
        >
          📚 {showElementLibrary ? "Hide" : "Show"} Library
        </button>

        <button
          onClick={onTogglePropertiesPanel}
          style={{
            padding: "8px 12px",
            backgroundColor: showPropertiesPanel ? "#007bff" : "#6c757d",
            color: "white",
            border: "none",
            borderRadius: "4px",
            cursor: "pointer",
            fontSize: "14px",
          }}
        >
          ⚙️ {showPropertiesPanel ? "Hide" : "Show"} Properties
        </button>
      </div>

      <div style={{ width: "1px", height: "30px", backgroundColor: "#ccc" }} />

      {/* Basic Elements */}
      <div style={{ display: "flex", gap: "5px" }}>
        <button onClick={() => handleAddElement("pipe")}>Add Pipe</button>
        <button onClick={() => handleAddElement("pump")}>Add Pump</button>
        <button onClick={() => handleAddElement("valve")}>Add Valve</button>
        <button onClick={() => handleAddElement("text")}>Add Text</button>
      </div>

      <div style={{ width: "1px", height: "30px", backgroundColor: "#ccc" }} />

      {/* View Controls */}
      <div style={{ display: "flex", gap: "5px" }}>
        <button onClick={onZoomIn}>🔍+ Zoom In</button>
        <button onClick={onZoomOut}>🔍- Zoom Out</button>
        <button onClick={onResetView}>🎯 Reset View</button>
      </div>

      <div style={{ width: "1px", height: "30px", backgroundColor: "#ccc" }} />

      {/* Selection Controls */}
      <div style={{ display: "flex", gap: "5px" }}>
        <button onClick={onClearSelection}>Clear Selection</button>
        <button
          onClick={onDeleteSelected}
          // disabled={selectedCount === 0}
          style={{
            // color: selectedCount > 0 ? "red" : undefined,
            color: "red",
            backgroundColor: "#fff5f5",
          }}
        >
          🗑️ Delete Selected ({selectedCount})
        </button>
      </div>
    </div>
  );
};

export default ScadaToolbar;
