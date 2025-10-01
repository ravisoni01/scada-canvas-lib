import React, { useRef, useEffect } from 'react';
import ScadaCanvas, { ScadaCanvasRef } from '../ScadaCanvas';

const AnimatedElementDemo: React.FC = () => {
  const canvasRef = useRef<ScadaCanvasRef>(null);

  useEffect(() => {
    // Add some animated elements when component mounts
    if (canvasRef.current) {
      // Add a circular fan (animated)
      canvasRef.current.addElementFromSvg('circular-fan', { x: 100, y: 100 }, { width: 80, height: 80 });
      
      // Add a regular pump (non-animated)
      canvasRef.current.addElementFromSvg('centrifugal-pump', { x: 250, y: 100 }, { width: 80, height: 80 });
      
      // Add another fan
      canvasRef.current.addElementFromSvg('circular-fan', { x: 400, y: 100 }, { width: 60, height: 60 });
    }
  }, []);

  const handleElementAdded = (element: any) => {
    const isAnimated = canvasRef.current?.isElementAnimated(element.id);
    console.log(`Element ${element.id} added. Animated: ${isAnimated}`);
  };

  return (
    <div style={{ padding: '20px' }}>
      <h2>Dual-View Animation Demo</h2>
      <p>
        This demo shows animated SVG elements (fans) rendered in a separate SVG overlay,
        while static elements (pumps) are rendered on the canvas.
      </p>
      
      <ScadaCanvas
        ref={canvasRef}
        width={800}
        height={400}
        gridEnabled={true}
        gridSize={20}
        snapToGrid={true}
        onElementAdded={handleElementAdded}
      />
      
      <div style={{ marginTop: '10px', fontSize: '14px', color: '#666' }}>
        <p>• Circular fans should be animated and rendered as SVG overlays</p>
        <p>• Pumps should be static and rendered on the canvas</p>
        <p>• All elements should be selectable and draggable</p>
      </div>
    </div>
  );
};

export default AnimatedElementDemo;