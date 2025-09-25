import React from "react";
import { ElementType } from "scada-canvas-lib";

interface ScadaToolbarProps {
  onAddElement: (type: ElementType, position: { x: number; y: number }) => void;
  onClearSelection: () => void;
  onDeleteSelected: () => void;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onResetView: () => void;
  selectedCount: number;
}

const ScadaToolbar: React.FC<ScadaToolbarProps> = ({
  onAddElement,
  onClearSelection,
  onDeleteSelected,
  onZoomIn,
  onZoomOut,
  onResetView,
  selectedCount,
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
      }}
    >
      <div style={{ display: "flex", gap: "5px" }}>
        <button onClick={() => handleAddElement("pipe")}>Add Pipe</button>
        <button onClick={() => handleAddElement("pump")}>Add Pump</button>
        <button onClick={() => handleAddElement("valve")}>Add Valve</button>
      </div>

      <div style={{ width: "1px", height: "30px", backgroundColor: "#ccc" }} />

      <div style={{ display: "flex", gap: "5px" }}>
        <button onClick={onZoomIn}>Zoom In</button>
        <button onClick={onZoomOut}>Zoom Out</button>
        <button onClick={onResetView}>Reset View</button>
      </div>

      <div style={{ width: "1px", height: "30px", backgroundColor: "#ccc" }} />

      <div style={{ display: "flex", gap: "5px" }}>
        <button onClick={onClearSelection} disabled={selectedCount === 0}>
          Clear Selection
        </button>
        <button
          onClick={onDeleteSelected}
          disabled={selectedCount === 0}
          style={{ color: selectedCount > 0 ? "red" : undefined }}
        >
          Delete Selected ({selectedCount})
        </button>
      </div>
    </div>
  );
};

export default ScadaToolbar;
