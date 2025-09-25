import ScadaEditor from "@/components/scada/new/ScadaEditor";
import SvgElementLibrary from "@/components/scada/new/SvgElementLibrary";
import React from "react";
import { ScadaElement } from "scada-canvas-lib";

function ScadaPage() {
  const handleSave = (elements: ScadaElement[]) => {
    console.log("Saving elements:", elements);
    // Save to your backend, localStorage, etc.
    localStorage.setItem("scada-elements", JSON.stringify(elements));
  };

  const loadInitialElements = () => {
    const saved = localStorage.getItem("scada-elements");
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error("Failed to load saved elements:", e);
      }
    }
    return [];
  };

  return (
    <div style={{ padding: "20px" }}>
      <h1>SCADA System Designer</h1>

      <ScadaEditor
        width={1000}
        height={700}
        onSave={handleSave}
        initialElements={loadInitialElements()}
      />
    </div>
  );
}

export default ScadaPage;
