import React from "react";
import { ScadaElement, TextProperties } from "scada-canvas-lib";

interface TextPropertiesPanelProps {
  selectedElement: ScadaElement | null;
  onUpdateElement: (elementId: string, properties: Partial<TextProperties>) => void;
}

const TextPropertiesPanel: React.FC<TextPropertiesPanelProps> = ({
  selectedElement,
  onUpdateElement,
}) => {
  if (!selectedElement || selectedElement.type !== "text") {
    return (
      <div style={{ padding: "16px", color: "#666" }}>
        Select a text element to edit properties
      </div>
    );
  }

  const props = selectedElement.properties as TextProperties;

  const handlePropertyChange = (property: keyof TextProperties, value: any) => {
    onUpdateElement(selectedElement.id, { [property]: value });
  };

  const handleFontSizeChange = (value: string) => {
    const fontSize = parseInt(value);
    if (!isNaN(fontSize) && fontSize >= 8 && fontSize <= 72) {
      handlePropertyChange("fontSize", fontSize);
    }
  };

  return (
    <div style={{ padding: "16px" }}>
      <h3 style={{ margin: "0 0 16px 0", fontSize: "16px", fontWeight: "bold" }}>
        Text Properties
      </h3>

      {/* Text Content */}
      <div style={{ marginBottom: "12px" }}>
        <label style={{ display: "block", marginBottom: "4px", fontSize: "14px", fontWeight: "500" }}>
          Text Content
        </label>
        <textarea
          value={props.text || ""}
          onChange={(e) => handlePropertyChange("text", e.target.value)}
          style={{
            width: "100%",
            minHeight: "60px",
            padding: "8px",
            border: "1px solid #ddd",
            borderRadius: "4px",
            fontSize: "14px",
            resize: "vertical",
          }}
        />
      </div>

      {/* Font Size */}
      <div style={{ marginBottom: "12px" }}>
        <label style={{ display: "block", marginBottom: "4px", fontSize: "14px", fontWeight: "500" }}>
          Font Size
        </label>
        <input
          type="number"
          value={props.fontSize || 14}
          min="8"
          max="72"
          onInput={(e) => handleFontSizeChange((e.target as HTMLInputElement).value)}
          style={{
            width: "100%",
            padding: "8px",
            border: "1px solid #ddd",
            borderRadius: "4px",
            fontSize: "14px",
          }}
        />
      </div>

      {/* Font Weight */}
      <div style={{ marginBottom: "12px" }}>
        <label style={{ display: "block", marginBottom: "4px", fontSize: "14px", fontWeight: "500" }}>
          Font Weight
        </label>
        <select
          value={props.fontWeight || "normal"}
          onChange={(e) => handlePropertyChange("fontWeight", e.target.value)}
          style={{
            width: "100%",
            padding: "8px",
            border: "1px solid #ddd",
            borderRadius: "4px",
            fontSize: "14px",
          }}
        >
          <option value="normal">Normal</option>
          <option value="bold">Bold</option>
          <option value="lighter">Lighter</option>
          <option value="bolder">Bolder</option>
        </select>
      </div>

      {/* Text Align */}
      <div style={{ marginBottom: "12px" }}>
        <label style={{ display: "block", marginBottom: "4px", fontSize: "14px", fontWeight: "500" }}>
          Text Align
        </label>
        <select
          value={props.textAlign || "left"}
          onChange={(e) => handlePropertyChange("textAlign", e.target.value)}
          style={{
            width: "100%",
            padding: "8px",
            border: "1px solid #ddd",
            borderRadius: "4px",
            fontSize: "14px",
          }}
        >
          <option value="left">Left</option>
          <option value="center">Center</option>
          <option value="right">Right</option>
        </select>
      </div>

      {/* Vertical Align */}
      <div style={{ marginBottom: "12px" }}>
        <label style={{ display: "block", marginBottom: "4px", fontSize: "14px", fontWeight: "500" }}>
          Vertical Align
        </label>
        <select
          value={props.verticalAlign || "middle"}
          onChange={(e) => handlePropertyChange("verticalAlign", e.target.value)}
          style={{
            width: "100%",
            padding: "8px",
            border: "1px solid #ddd",
            borderRadius: "4px",
            fontSize: "14px",
          }}
        >
          <option value="top">Top</option>
          <option value="middle">Middle</option>
          <option value="bottom">Bottom</option>
        </select>
      </div>

      {/* Text Color */}
      <div style={{ marginBottom: "12px" }}>
        <label style={{ display: "block", marginBottom: "4px", fontSize: "14px", fontWeight: "500" }}>
          Text Color
        </label>
        <input
          type="color"
          value={props.color || "#000000"}
          onChange={(e) => handlePropertyChange("color", e.target.value)}
          style={{
            width: "100%",
            height: "40px",
            padding: "4px",
            border: "1px solid #ddd",
            borderRadius: "4px",
            cursor: "pointer",
          }}
        />
      </div>

      {/* Background Color */}
      <div style={{ marginBottom: "12px" }}>
        <label style={{ display: "block", marginBottom: "4px", fontSize: "14px", fontWeight: "500" }}>
          Background Color
        </label>
        <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
          <input
            type="color"
            value={props.backgroundColor === "transparent" ? "#ffffff" : (props.backgroundColor || "#ffffff")}
            onChange={(e) => handlePropertyChange("backgroundColor", e.target.value)}
            style={{
              width: "60px",
              height: "40px",
              padding: "4px",
              border: "1px solid #ddd",
              borderRadius: "4px",
              cursor: "pointer",
            }}
          />
          <button
            onClick={() => handlePropertyChange("backgroundColor", "transparent")}
            style={{
              padding: "8px 12px",
              border: "1px solid #ddd",
              borderRadius: "4px",
              backgroundColor: props.backgroundColor === "transparent" ? "#e3f2fd" : "#fff",
              cursor: "pointer",
              fontSize: "12px",
            }}
          >
            Transparent
          </button>
        </div>
      </div>

      {/* Border Width */}
      <div style={{ marginBottom: "12px" }}>
        <label style={{ display: "block", marginBottom: "4px", fontSize: "14px", fontWeight: "500" }}>
          Border Width
        </label>
        <input
          type="number"
          value={props.borderWidth || 0}
          min="0"
          max="10"
          onChange={(e) => handlePropertyChange("borderWidth", parseInt(e.target.value) || 0)}
          style={{
            width: "100%",
            padding: "8px",
            border: "1px solid #ddd",
            borderRadius: "4px",
            fontSize: "14px",
          }}
        />
      </div>

      {/* Border Color */}
      {(props.borderWidth || 0) > 0 && (
        <div style={{ marginBottom: "12px" }}>
          <label style={{ display: "block", marginBottom: "4px", fontSize: "14px", fontWeight: "500" }}>
            Border Color
          </label>
          <input
            type="color"
            value={props.borderColor || "#cccccc"}
            onChange={(e) => handlePropertyChange("borderColor", e.target.value)}
            style={{
              width: "100%",
              height: "40px",
              padding: "4px",
              border: "1px solid #ddd",
              borderRadius: "4px",
              cursor: "pointer",
            }}
          />
        </div>
      )}
    </div>
  );
};

export default TextPropertiesPanel;