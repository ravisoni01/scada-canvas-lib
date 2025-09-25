import { EventEmitter } from "../core/EventEmitter";
import { SvgElementDefinition, SVG_ELEMENTS, getSvgElementsByCategory, searchSvgElements, getAllCategories, SvgCategory } from "../assets/svgElements";

export interface ElementLibraryConfig {
  searchEnabled?: boolean;
  categoryFilter?: boolean;
  gridView?: boolean;
}

export interface ElementLibraryState {
  selectedCategory: SvgCategory | "all";
  searchQuery: string;
  viewMode: "grid" | "list";
  filteredElements: SvgElementDefinition[];
}

export class ElementLibrary extends EventEmitter {
  private state: ElementLibraryState;
  private config: ElementLibraryConfig;

  constructor(config: ElementLibraryConfig = {}) {
    super();
    
    this.config = {
      searchEnabled: true,
      categoryFilter: true,
      gridView: true,
      ...config
    };

    this.state = {
      selectedCategory: "all",
      searchQuery: "",
      viewMode: "grid",
      filteredElements: SVG_ELEMENTS
    };
  }

  public getElements(): SvgElementDefinition[] {
    return this.state.filteredElements;
  }

  public getAllElements(): SvgElementDefinition[] {
    return SVG_ELEMENTS;
  }

  public getCategories(): SvgCategory[] {
    return getAllCategories();
  }

  public setCategory(category: SvgCategory | "all"): void {
    this.state.selectedCategory = category;
    this.updateFilteredElements();
    this.emit("category-changed", { category });
  }

  public setSearchQuery(query: string): void {
    this.state.searchQuery = query;
    this.updateFilteredElements();
    this.emit("search-changed", { query });
  }

  public setViewMode(mode: "grid" | "list"): void {
    this.state.viewMode = mode;
    this.emit("view-mode-changed", { mode });
  }

  public getState(): ElementLibraryState {
    return { ...this.state };
  }

  private updateFilteredElements(): void {
    let elements = SVG_ELEMENTS;

    // Apply category filter
    if (this.state.selectedCategory !== "all") {
      elements = getSvgElementsByCategory(this.state.selectedCategory);
    }

    // Apply search filter
    if (this.state.searchQuery.trim()) {
      elements = searchSvgElements(this.state.searchQuery).filter(element => 
        this.state.selectedCategory === "all" || element.category === this.state.selectedCategory
      );
    }

    this.state.filteredElements = elements;
    this.emit("elements-filtered", { elements });
  }

  public selectElement(elementId: string): void {
    const element = SVG_ELEMENTS.find(el => el.id === elementId);
    if (element) {
      this.emit("element-selected", { element });
    }
  }

  public getElementById(id: string): SvgElementDefinition | undefined {
    return SVG_ELEMENTS.find(element => element.id === id);
  }
}