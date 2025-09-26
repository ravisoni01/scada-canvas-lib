import React, { useState, useEffect } from "react";
import {
  SVG_ELEMENTS,
  SVG_CATEGORIES,
  SvgElementDefinition,
  SvgCategory,
  getSvgElementsByCategory,
  searchSvgElements,
} from "scada-canvas-lib";

interface SvgElementLibraryProps {
  onElementSelect: (element: SvgElementDefinition) => void;
  className?: string;
}

const SvgElementLibrary: React.FC<SvgElementLibraryProps> = ({
  onElementSelect,
  className = "",
}) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<SvgCategory | "all">(
    "all"
  );
  const [filteredElements, setFilteredElements] =
    useState<SvgElementDefinition[]>(SVG_ELEMENTS);

  useEffect(() => {
    let elements = SVG_ELEMENTS;

    // Filter by category first
    if (selectedCategory !== "all") {
      elements = getSvgElementsByCategory(selectedCategory);
    }

    // Then filter by search query
    if (searchQuery.trim()) {
      elements = searchSvgElements(searchQuery);
      if (selectedCategory !== "all") {
        elements = elements.filter((el) => el.category === selectedCategory);
      }
    }

    setFilteredElements(elements);
  }, [searchQuery, selectedCategory]);

  const handleElementClick = (element: SvgElementDefinition) => {
    console.log("element", element);
    onElementSelect(element);
  };

  const categories = Object.values(SVG_CATEGORIES);

  return (
    <div className={`svg-element-library ${className}`}>
      <div className="library-header">
        <h3>Element Library</h3>

        {/* Search Input */}
        <input
          type="text"
          placeholder="Search elements..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="search-input"
          style={{
            width: "100%",
            padding: "8px",
            marginBottom: "8px",
            border: "1px solid #ddd",
            borderRadius: "4px",
            fontSize: "14px",
          }}
        />

        {/* Category Filter */}
        <select
          value={selectedCategory}
          onChange={(e) =>
            setSelectedCategory(e.target.value as SvgCategory | "all")
          }
          className="category-select"
          style={{
            width: "100%",
            padding: "8px",
            marginBottom: "12px",
            border: "1px solid #ddd",
            borderRadius: "4px",
            fontSize: "14px",
          }}
        >
          <option value="all">All Categories</option>
          {categories.map((category) => (
            <option key={category} value={category}>
              {category}
            </option>
          ))}
        </select>
      </div>

      {/* Element Grid */}
      <div
        className="element-grid"
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(100px, 1fr))",
          gap: "8px",
          maxHeight: "400px",
          overflowY: "auto",
        }}
      >
        {filteredElements.map((element) => (
          <div
            key={`${element.id}-${element.category}`}
            className="element-card"
            onClick={() => handleElementClick(element)}
            title={element.description}
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              padding: "8px",
              border: "1px solid #e0e0e0",
              borderRadius: "4px",
              cursor: "pointer",
              transition: "all 0.2s",
              backgroundColor: "white",
              minHeight: "80px",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = "#007bff";
              e.currentTarget.style.boxShadow = "0 2px 4px rgba(0,123,255,0.1)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = "#e0e0e0";
              e.currentTarget.style.boxShadow = "none";
            }}
          >
            <div
              className="element-preview"
              style={{
                width: "50px",
                height: "50px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                marginBottom: "4px",
              }}
            >
              <img
                src={element.svgPath}
                alt={element.name}
                style={{
                  maxWidth: "100%",
                  maxHeight: "100%",
                  objectFit: "contain",
                }}
                onError={(e) => {
                  // Fallback for broken images
                  const target = e.currentTarget as HTMLImageElement;
                  target.style.display = "none";
                  const parent = target.parentElement;
                  if (parent && !parent.querySelector(".fallback-icon")) {
                    const fallback = document.createElement("div");
                    fallback.className = "fallback-icon";
                    fallback.style.cssText = `
                      width: 40px;
                      height: 40px;
                      background: #f0f0f0;
                      border: 1px solid #ddd;
                      border-radius: 4px;
                      display: flex;
                      align-items: center;
                      justify-content: center;
                      font-size: 12px;
                      color: #666;
                    `;
                    fallback.textContent = "📦";
                    parent.appendChild(fallback);
                  }
                }}
              />
            </div>
            <div className="element-info" style={{ textAlign: "center" }}>
              <div
                className="element-name"
                style={{
                  fontSize: "11px",
                  fontWeight: "500",
                  color: "#333",
                  marginBottom: "2px",
                  lineHeight: "1.2",
                }}
              >
                {element.name}
              </div>
              <div
                className="element-category"
                style={{
                  fontSize: "9px",
                  color: "#666",
                  lineHeight: "1.1",
                }}
              >
                {element.category}
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredElements.length === 0 && (
        <div
          className="no-results"
          style={{
            textAlign: "center",
            color: "#666",
            padding: "20px",
            fontStyle: "italic",
          }}
        >
          No elements found matching your criteria.
        </div>
      )}

      <div
        className="library-footer"
        style={{
          marginTop: "12px",
          padding: "8px",
          backgroundColor: "#f8f9fa",
          borderRadius: "4px",
          fontSize: "12px",
          color: "#666",
          textAlign: "center",
        }}
      >
        {filteredElements.length} element
        {filteredElements.length !== 1 ? "s" : ""} available
      </div>
    </div>
  );
};

export default SvgElementLibrary;
