import { EventEmitter } from "../core/EventEmitter";

export interface AssetLoadResult {
  success: boolean;
  asset?: HTMLImageElement;
  error?: string;
}

export class AssetManager extends EventEmitter {
  private cache: Map<string, HTMLImageElement> = new Map();
  private loadPromises: Map<string, Promise<AssetLoadResult>> = new Map();
  private baseUrl: string;

  constructor(baseUrl: string = "") {
    super();
    this.baseUrl = baseUrl;
  }

  public async loadAsset(path: string): Promise<AssetLoadResult> {
    const fullPath = this.resolveAssetPath(path);
    
    // Check cache first
    if (this.cache.has(fullPath)) {
      return {
        success: true,
        asset: this.cache.get(fullPath)!
      };
    }

    // Check if already loading
    if (this.loadPromises.has(fullPath)) {
      return this.loadPromises.get(fullPath)!;
    }

    // Create loading promise
    const loadPromise = this.createLoadPromise(fullPath);
    this.loadPromises.set(fullPath, loadPromise);

    return loadPromise;
  }

  private createLoadPromise(fullPath: string): Promise<AssetLoadResult> {
    return new Promise((resolve) => {
      const img = new Image();
      
      img.onload = () => {
        this.cache.set(fullPath, img);
        this.loadPromises.delete(fullPath);
        this.emit("asset-loaded", { path: fullPath, success: true });
        resolve({ success: true, asset: img });
      };

      img.onerror = () => {
        this.loadPromises.delete(fullPath);
        const error = `Failed to load asset: ${fullPath}`;
        this.emit("asset-error", { path: fullPath, error });
        resolve({ success: false, error });
      };

      img.src = fullPath;
    });
  }

  private resolveAssetPath(path: string): string {
    if (path.startsWith('http://') || path.startsWith('https://') || path.startsWith('/')) {
      return path;
    }
    return `${this.baseUrl}/${path}`.replace(/\/+/g, '/');
  }

  public preloadAssets(paths: string[]): Promise<AssetLoadResult[]> {
    const loadPromises = paths.map(path => this.loadAsset(path));
    return Promise.all(loadPromises);
  }

  public getCachedAsset(path: string): HTMLImageElement | undefined {
    const fullPath = this.resolveAssetPath(path);
    return this.cache.get(fullPath);
  }

  public clearCache(): void {
    this.cache.clear();
    this.loadPromises.clear();
    this.emit("cache-cleared");
  }

  public setBaseUrl(baseUrl: string): void {
    this.baseUrl = baseUrl;
  }

  public getLoadedAssets(): string[] {
    return Array.from(this.cache.keys());
  }
}