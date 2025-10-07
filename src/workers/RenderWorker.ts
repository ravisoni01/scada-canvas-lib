import { ScadaElement, ViewportState } from "../core/types";

// Web Worker for handling heavy rendering calculations
export class RenderWorker {
  private worker: Worker | null = null;

  constructor() {
    this.initializeWorker();
  }

  private initializeWorker() {
    const workerCode = `
      self.onmessage = function(e) {
        const { type, data } = e.data;
        
        switch(type) {
          case 'PROCESS_ELEMENTS':
            const processedElements = processElementsForRendering(data.elements, data.viewport);
            self.postMessage({
              type: 'ELEMENTS_PROCESSED',
              data: processedElements
            });
            break;
            
          case 'CALCULATE_VISIBILITY':
            const visibleElements = calculateVisibleElements(data.elements, data.viewport);
            self.postMessage({
              type: 'VISIBILITY_CALCULATED',
              data: visibleElements
            });
            break;
        }
      };
      
      function processElementsForRendering(elements, viewport) {
        return elements.map(element => ({
          ...element,
          screenPosition: worldToScreen(element.position, viewport),
          isVisible: isElementVisible(element, viewport),
          lodLevel: calculateLOD(element, viewport)
        }));
      }
      
      function calculateVisibleElements(elements, viewport) {
        return elements.filter(element => isElementVisible(element, viewport));
      }
      
      function worldToScreen(position, viewport) {
        return {
          x: (position.x + viewport.pan.x) * viewport.zoom,
          y: (position.y + viewport.pan.y) * viewport.zoom
        };
      }
      
      function isElementVisible(element, viewport) {
        const screenPos = worldToScreen(element.position, viewport);
        const scaledSize = {
          width: element.size.width * viewport.zoom,
          height: element.size.height * viewport.zoom
        };
        
        return !(
          screenPos.x + scaledSize.width < 0 ||
          screenPos.y + scaledSize.height < 0 ||
          screenPos.x > viewport.bounds.width ||
          screenPos.y > viewport.bounds.height
        );
      }
      
      function calculateLOD(element, viewport) {
        const scale = viewport.zoom;
        if (scale < 0.25) return 'minimal';
        if (scale < 0.5) return 'low';
        if (scale < 1.5) return 'medium';
        return 'high';
      }
    `;

    const blob = new Blob([workerCode], { type: "application/javascript" });
    this.worker = new Worker(URL.createObjectURL(blob));
  }

  processElements(
    elements: ScadaElement[],
    viewport: ViewportState
  ): Promise<any[]> {
    return new Promise((resolve) => {
      if (!this.worker) {
        resolve([]);
        return;
      }

      const handleMessage = (e: MessageEvent) => {
        if (e.data.type === "ELEMENTS_PROCESSED") {
          this.worker!.removeEventListener("message", handleMessage);
          resolve(e.data.data);
        }
      };

      this.worker.addEventListener("message", handleMessage);
      this.worker.postMessage({
        type: "PROCESS_ELEMENTS",
        data: { elements, viewport },
      });
    });
  }

  calculateVisibility(
    elements: ScadaElement[],
    viewport: ViewportState
  ): Promise<string[]> {
    return new Promise((resolve) => {
      if (!this.worker) {
        resolve([]);
        return;
      }

      const handleMessage = (e: MessageEvent) => {
        if (e.data.type === "VISIBILITY_CALCULATED") {
          this.worker!.removeEventListener("message", handleMessage);
          resolve(e.data.data.map((el: any) => el.id));
        }
      };

      this.worker.addEventListener("message", handleMessage);
      this.worker.postMessage({
        type: "CALCULATE_VISIBILITY",
        data: { elements, viewport },
      });
    });
  }

  destroy() {
    if (this.worker) {
      this.worker.terminate();
      this.worker = null;
    }
  }
}
