import { ScadaElement, ViewportState } from "../core/types";

export class OffscreenRenderer {
  private worker: Worker | null = null;
  private offscreenCanvas: OffscreenCanvas | null = null;

  constructor(width: number, height: number) {
    this.initializeOffscreenRenderer(width, height);
  }

  private initializeOffscreenRenderer(width: number, height: number) {
    if ("OffscreenCanvas" in window) {
      this.offscreenCanvas = new OffscreenCanvas(width, height);

      const workerCode = `
        let canvas, ctx;
        
        self.onmessage = function(e) {
          const { type, data } = e.data;
          
          switch(type) {
            case 'INIT_CANVAS':
              canvas = data.canvas;
              ctx = canvas.getContext('2d');
              self.postMessage({ type: 'CANVAS_READY' });
              break;
              
            case 'RENDER_ELEMENTS':
              renderElements(data.elements, data.viewport);
              break;
              
            case 'RENDER_BACKGROUND':
              renderBackground(data.viewport, data.gridSettings);
              break;
          }
        };
        
        function renderElements(elements, viewport) {
          if (!ctx) return;
          
          ctx.clearRect(0, 0, canvas.width, canvas.height);
          
          elements.forEach(element => {
            ctx.save();
            
            const screenPos = {
              x: (element.position.x + viewport.pan.x) * viewport.zoom,
              y: (element.position.y + viewport.pan.y) * viewport.zoom
            };
            
            ctx.translate(screenPos.x, screenPos.y);
            ctx.scale(viewport.zoom, viewport.zoom);
            
            // Simple element rendering
            ctx.fillStyle = element.properties?.color || '#cccccc';
            ctx.fillRect(0, 0, element.size.width, element.size.height);
            
            ctx.restore();
          });
          
          // Transfer the rendered frame back to main thread
          const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
          self.postMessage({
            type: 'FRAME_RENDERED',
            data: imageData
          }, [imageData.data.buffer]);
        }
        
        function renderBackground(viewport, gridSettings) {
          if (!ctx || !gridSettings.visible) return;
          
          ctx.strokeStyle = '#e0e0e0';
          ctx.lineWidth = 1;
          
          const gridSize = gridSettings.size * viewport.zoom;
          const offsetX = viewport.pan.x % gridSize;
          const offsetY = viewport.pan.y % gridSize;
          
          for (let x = offsetX; x < canvas.width; x += gridSize) {
            ctx.beginPath();
            ctx.moveTo(x, 0);
            ctx.lineTo(x, canvas.height);
            ctx.stroke();
          }
          
          for (let y = offsetY; y < canvas.height; y += gridSize) {
            ctx.beginPath();
            ctx.moveTo(0, y);
            ctx.lineTo(canvas.width, y);
            ctx.stroke();
          }
        }
      `;

      const blob = new Blob([workerCode], { type: "application/javascript" });
      this.worker = new Worker(URL.createObjectURL(blob));

      this.worker.postMessage(
        {
          type: "INIT_CANVAS",
          data: { canvas: this.offscreenCanvas },
        },
        [this.offscreenCanvas]
      );
    }
  }

  renderElements(
    elements: ScadaElement[],
    viewport: ViewportState
  ): Promise<ImageData> {
    return new Promise((resolve) => {
      if (!this.worker) {
        resolve(new ImageData(1, 1));
        return;
      }

      const handleMessage = (e: MessageEvent) => {
        if (e.data.type === "FRAME_RENDERED") {
          this.worker!.removeEventListener("message", handleMessage);
          resolve(e.data.data);
        }
      };

      this.worker.addEventListener("message", handleMessage);
      this.worker.postMessage({
        type: "RENDER_ELEMENTS",
        data: { elements, viewport },
      });
    });
  }
}
