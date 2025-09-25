# SCADA Canvas Library

A cross-platform library for creating interactive SCADA (Supervisory Control and Data Acquisition) diagrams with drag-and-drop functionality.

## Features

- 🎯 Drag and drop SCADA elements
- 🔧 Interactive element properties
- 🎨 Customizable animations
- 📱 Cross-platform (Web & React Native)
- ⚡ High performance canvas rendering
- 🔌 Extensible element library

## Installation

```bash
npm install scada-canvas-lib
```

## Quick Start

```typescript
import { ScadaCanvas } from "scada-canvas-lib";

const canvas = new ScadaCanvas({
  container: document.getElementById("canvas-container")!,
});

// Add elements
canvas.addElement("pipe", { x: 100, y: 100 });
canvas.addElement("valve", { x: 200, y: 100 });
```

## Development

```bash
# Install dependencies
npm install

# Start development
npm run dev

# Run tests
npm test

# Build
npm run build
```

## License

MIT
