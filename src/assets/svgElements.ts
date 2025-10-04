import { Size } from "../core/types";

export interface SvgElementDefinition {
  id: string;
  name: string;
  category: string;
  description: string;
  svgPath: string;
  defaultSize: Size;
  tags: string[];
  properties?: Record<string, any>;
}

export const SVG_CATEGORIES = {
  PIPES: "Pipes",
  PUMPS: "Pumps",
  VALVES: "Valves",
  TANKS: "Tanks",
  INSTRUMENTS: "Instruments",
  ELECTRICAL: "Electrical",
  SAFETY: "Safety",
  CONTAINERS: "Containers",
} as const;

export type SvgCategory = (typeof SVG_CATEGORIES)[keyof typeof SVG_CATEGORIES];

export const SVG_ELEMENTS: SvgElementDefinition[] = [
  // Pipes
  {
    id: "bottom-right-elbow-pipe",
    name: "Bottom Right Elbow Pipe",
    category: SVG_CATEGORIES.PIPES,
    description: "Bottom right elbow pipe for fluid transport",
    svgPath:
      "https://s3.ap-south-1.amazonaws.com/app.sandbox.growloc.farm/scada/bottom-right-elbow-pipe.svg",
    defaultSize: { width: 70, height: 70 },
    tags: ["pipe", "horizontal", "fluid", "transport"],
    properties: {
      diameter: 10,
      material: "steel",
      pressure: 0,
    },
  },
  {
    id: "bottom-tee-pipe",
    name: "Bottom Tee Pipe",
    category: SVG_CATEGORIES.PIPES,
    description: "Bottom tee pipe for fluid transport",
    svgPath:
      "https://s3.ap-south-1.amazonaws.com/app.sandbox.growloc.farm/scada/bottom-tee-pipe.svg",
    defaultSize: { width: 70, height: 70 },
    tags: ["pipe", "horizontal", "fluid", "transport"],
    properties: {
      diameter: 10,
      material: "steel",
      pressure: 0,
    },
  },
  {
    id: "long-horizontal-pipe",
    name: "Long Horizontal Pipe",
    category: SVG_CATEGORIES.PIPES,
    description: "Long horizontal pipe for fluid transport",
    svgPath:
      "https://s3.ap-south-1.amazonaws.com/app.sandbox.growloc.farm/scada/extra-long-horizontal-pipe.svg",
    defaultSize: { width: 280, height: 70 },
    tags: ["pipe", "horizontal", "fluid", "transport"],
    properties: {
      diameter: 10,
      material: "steel",
      pressure: 0,
      animatedSvgPath:
        "https://s3.ap-south-1.amazonaws.com/app.sandbox.growloc.farm/scada/extra-long-horizontal-pipe-animated.svg",
    },
  },
  {
    id: "long-vertical-pipe",
    name: "Long Vertical Pipe",
    category: SVG_CATEGORIES.PIPES,
    description: "Long vertical pipe for fluid transport",
    svgPath:
      "https://s3.ap-south-1.amazonaws.com/app.sandbox.growloc.farm/scada/extra-long-vertical-pipe.svg",
    defaultSize: { width: 70, height: 280 },
    tags: ["pipe", "vertical", "fluid", "transport"],
    properties: {
      diameter: 10,
      material: "steel",
      pressure: 0,
      animatedSvgPath:
        "https://s3.ap-south-1.amazonaws.com/app.sandbox.growloc.farm/scada/extra-long-vertical-pipe-animated.svg",
    },
  },
  {
    id: "horizontal-pipe",
    name: "Horizontal Pipe",
    category: SVG_CATEGORIES.PIPES,
    description: "Standard horizontal pipe for fluid transport",
    svgPath:
      "https://s3.ap-south-1.amazonaws.com/app.sandbox.growloc.farm/scada/horizontal-pipe.svg",
    defaultSize: { width: 70, height: 70 },
    tags: ["pipe", "horizontal", "fluid", "transport"],
    properties: {
      diameter: 10,
      material: "steel",
      pressure: 0,
    },
  },
  {
    id: "left-bottom-elbow-pipe",
    name: "Left Bottom Elbow Pipe",
    category: SVG_CATEGORIES.PIPES,
    description: "Left bottom elbow pipe for fluid transport",
    svgPath:
      "https://s3.ap-south-1.amazonaws.com/app.sandbox.growloc.farm/scada/left-bottom-elbow-pipe.svg",
    defaultSize: { width: 70, height: 70 },
    tags: ["pipe", "horizontal", "fluid", "transport"],
    properties: {
      diameter: 10,
      material: "steel",
      pressure: 0,
    },
  },
  {
    id: "left-tee-pipe",
    name: "Left Tee Pipe",
    category: SVG_CATEGORIES.PIPES,
    description: "Left tee pipe for fluid transport",
    svgPath:
      "https://s3.ap-south-1.amazonaws.com/app.sandbox.growloc.farm/scada/left-tee-pipe.svg",
    defaultSize: { width: 70, height: 70 },
    tags: ["pipe", "horizontal", "fluid", "transport"],
    properties: {
      diameter: 10,
      material: "steel",
      pressure: 0,
    },
  },
  {
    id: "left-top-elbow-pipe",
    name: "Left Top Elbow Pipe",
    category: SVG_CATEGORIES.PIPES,
    description: "Left top elbow pipe for fluid transport",
    svgPath:
      "https://s3.ap-south-1.amazonaws.com/app.sandbox.growloc.farm/scada/left-top-elbow-pipe.svg",
    defaultSize: { width: 70, height: 70 },
    tags: ["pipe", "horizontal", "fluid", "transport"],
    properties: {
      diameter: 10,
      material: "steel",
      pressure: 0,
    },
  },
  // {
  //   id: "long-vertical-pipe",
  //   name: "Long Vertical Pipe",
  //   category: SVG_CATEGORIES.PIPES,
  //   description: "Long vertical pipe for fluid transport",
  //   svgPath:
  //     "https://s3.ap-south-1.amazonaws.com/app.sandbox.growloc.farm/scada/long-vertical-pipe.svg",
  //   defaultSize: { width: 100, height: 20 },
  //   tags: ["pipe", "vertical", "fluid", "transport"],
  //   properties: {
  //     diameter: 10,
  //     material: "steel",
  //     pressure: 0,
  //   },
  // },
  {
    id: "right-tee-pipe",
    name: "Right Tee Pipe",
    category: SVG_CATEGORIES.PIPES,
    description: "Right tee pipe for fluid transport",
    svgPath:
      "https://s3.ap-south-1.amazonaws.com/app.sandbox.growloc.farm/scada/right-tee-pipe.svg",
    defaultSize: { width: 70, height: 70 },
    tags: ["pipe", "vertical", "fluid", "transport"],
    properties: {
      diameter: 10,
      material: "steel",
      pressure: 0,
    },
  },
  {
    id: "top-right-elbow-pipe",
    name: "Top Right Elbow Pipe",
    category: SVG_CATEGORIES.PIPES,
    description: "Top right elbow pipe for fluid transport",
    svgPath:
      "https://s3.ap-south-1.amazonaws.com/app.sandbox.growloc.farm/scada/top-right-elbow-pipe.svg",
    defaultSize: { width: 70, height: 70 },
    tags: ["pipe", "vertical", "fluid", "transport"],
    properties: {
      diameter: 10,
      material: "steel",
      pressure: 0,
    },
  },
  {
    id: "top-tee-pipe",
    name: "Top Tee Pipe",
    category: SVG_CATEGORIES.PIPES,
    description: "Top tee pipe for fluid transport",
    svgPath:
      "https://s3.ap-south-1.amazonaws.com/app.sandbox.growloc.farm/scada/top-tee-pipe.svg",
    defaultSize: { width: 75, height: 75 },
    tags: ["pipe", "vertical", "fluid", "transport"],
    properties: {
      diameter: 10,
      material: "steel",
      pressure: 0,
    },
  },
  {
    id: "vertical-pipe",
    name: "Vertical Pipe",
    category: SVG_CATEGORIES.PIPES,
    description: "Vertical pipe for fluid transport",
    svgPath:
      "https://s3.ap-south-1.amazonaws.com/app.sandbox.growloc.farm/scada/vertical-pipe.svg",
    defaultSize: { width: 75, height: 75 },
    tags: ["pipe", "vertical", "fluid", "transport"],
    properties: {
      diameter: 10,
      material: "steel",
      pressure: 0,
    },
  },

  // Pumps
  {
    id: "right-motor-pump",
    name: "Right Motor Pump",
    category: SVG_CATEGORIES.PUMPS,
    description: "Standard right motor pump",
    svgPath:
      "https://s3.ap-south-1.amazonaws.com/app.sandbox.growloc.farm/scada/right-motor-pump.svg",
    defaultSize: { width: 100, height: 70 },
    tags: ["pump", "right motor", "motor"],
    properties: {
      flowRate: 100,
      pressure: 50,
      power: 10,
      efficiency: 85,
    },
  },
  {
    id: "left-motor-pump",
    name: "Left Motor Pump",
    category: SVG_CATEGORIES.PUMPS,
    description: "Left motor pump",
    svgPath:
      "https://s3.ap-south-1.amazonaws.com/app.sandbox.growloc.farm/scada/small-left-motor-pump.svg",
    defaultSize: { width: 100, height: 70 },
    tags: ["pump", "small left motor", "motor"],
    properties: {
      flowRate: 100,
      pressure: 50,
      power: 10,
      efficiency: 85,
    },
  },

  // Valves
  {
    id: "horizontal-ball-valve",
    name: "Horizontal Ball Valve",
    category: SVG_CATEGORIES.VALVES,
    description: "Ball valve for flow control",
    svgPath:
      "https://s3.ap-south-1.amazonaws.com/app.sandbox.growloc.farm/scada/horizontal-ball-valve.svg",
    defaultSize: { width: 70, height: 70 },
    tags: ["valve", "ball", "control"],
    properties: {
      position: 0,
      type: "ball",
      status: "closed",
    },
  },
  {
    id: "horizontal-wheel-valve",
    name: "Horizontal Wheel Valve",
    category: SVG_CATEGORIES.VALVES,
    description: "Horizontal wheel valve for flow control",
    svgPath:
      "https://s3.ap-south-1.amazonaws.com/app.sandbox.growloc.farm/scada/horizontal-wheel-valve.svg",
    defaultSize: { width: 80, height: 40 },
    tags: ["valve", "wheel", "flow control"],
  },
  {
    id: "vertical-ball-valve",
    name: "Vertical Ball Valve",
    category: SVG_CATEGORIES.VALVES,
    description: "Vertical ball valve for flow control",
    svgPath:
      "https://s3.ap-south-1.amazonaws.com/app.sandbox.growloc.farm/scada/vertical-ball-valve.svg",
    defaultSize: { width: 70, height: 70 },
    tags: ["valve", "ball", "flow control"],
  },
  {
    id: "vertical-wheel-valve",
    name: "Vertical Wheel Valve",
    category: SVG_CATEGORIES.VALVES,
    description: "Vertical wheel valve for flow control",
    svgPath:
      "https://s3.ap-south-1.amazonaws.com/app.sandbox.growloc.farm/scada/vertical-wheel-valve.svg",
    defaultSize: { width: 40, height: 80 },
    tags: ["valve", "wheel", "flow control"],
  },

  // Tanks
  {
    id: "ibc-tank",
    name: "IBC Tank",
    category: SVG_CATEGORIES.TANKS,
    description: "IBC tank",
    svgPath:
      "https://s3.ap-south-1.amazonaws.com/app.sandbox.growloc.farm/scada/ibc-tank.png",
    defaultSize: { width: 100, height: 100 },
    tags: ["tank", "storage", "vessel"],
    properties: {
      capacity: 1000,
      level: 50,
      material: "steel",
    },
  },
  {
    id: "stand-horizontal-tank",
    name: "Stand Horizontal Tank",
    category: SVG_CATEGORIES.TANKS,
    description: "High-pressure vessel",
    svgPath:
      "https://s3.ap-south-1.amazonaws.com/app.sandbox.growloc.farm/scada/stand-horizontal-tank.svg",
    defaultSize: { width: 140, height: 120 },
    tags: ["tank", "pressure", "vessel"],
  },
  {
    id: "stand-vertical-tank",
    name: "Stand Vertical Tank",
    category: SVG_CATEGORIES.TANKS,
    description: "High-pressure vessel",
    svgPath:
      "https://s3.ap-south-1.amazonaws.com/app.sandbox.growloc.farm/scada/stand-vertical-tank.svg",
    defaultSize: { width: 90, height: 140 },
    tags: ["tank", "pressure", "vessel"],
  },
  {
    id: "vertical-tank",
    name: "Vertical Tank",
    category: SVG_CATEGORIES.TANKS,
    description: "High-pressure vessel",
    svgPath:
      "https://s3.ap-south-1.amazonaws.com/app.sandbox.growloc.farm/scada/vertical-tank.svg",
    defaultSize: { width: 90, height: 140 },
    tags: ["tank", "pressure", "vessel"],
  },

  // Instruments
  {
    id: "bottom-flow-meter",
    name: "Bottom Flow Meter",
    category: SVG_CATEGORIES.INSTRUMENTS,
    description: "Bottom flow meter",
    svgPath:
      "https://s3.ap-south-1.amazonaws.com/app.sandbox.growloc.farm/scada/bottom-flow-meter.svg",
    defaultSize: { width: 140, height: 140 },
    tags: ["instrument", "flow", "meter", "measurement"],
  },
  {
    id: "horizontal-inline-flow-meter",
    name: "Horizontal Inline Flow Meter",
    category: SVG_CATEGORIES.INSTRUMENTS,
    description: "Horizontal inline flow meter",
    svgPath:
      "https://s3.ap-south-1.amazonaws.com/app.sandbox.growloc.farm/scada/horizontal-inline-flow-meter.svg",
    defaultSize: { width: 140, height: 70 },
    tags: ["instrument", "flow", "meter", "measurement"],
  },
  {
    id: "left-flow-meter",
    name: "Left Flow Meter",
    category: SVG_CATEGORIES.INSTRUMENTS,
    description: "Left flow meter",
    svgPath:
      "https://s3.ap-south-1.amazonaws.com/app.sandbox.growloc.farm/scada/left-flow-meter.svg",
    defaultSize: { width: 140, height: 140 },
    tags: ["instrument", "flow", "meter", "measurement"],
  },
  {
    id: "right-flow-meter",
    name: "Right Flow Meter",
    category: SVG_CATEGORIES.INSTRUMENTS,
    description: "Right flow meter",
    svgPath:
      "https://s3.ap-south-1.amazonaws.com/app.sandbox.growloc.farm/scada/right-flow-meter.svg",
    defaultSize: { width: 140, height: 140 },
    tags: ["instrument", "flow", "meter", "measurement"],
  },
  {
    id: "vertical-inline-flow-meter",
    name: "Vertical Inline Flow Meter",
    category: SVG_CATEGORIES.INSTRUMENTS,
    description: "Vertical inline flow meter",
    svgPath:
      "https://s3.ap-south-1.amazonaws.com/app.sandbox.growloc.farm/scada/vertical-inline-flow-meter.svg",
    defaultSize: { width: 70, height: 140 },
    tags: ["instrument", "flow", "meter", "measurement"],
  },
  {
    id: "long-bottom-filter",
    name: "Long Bottom Filter",
    category: SVG_CATEGORIES.INSTRUMENTS,
    description: "Long bottom filter",
    svgPath:
      "https://s3.ap-south-1.amazonaws.com/app.sandbox.growloc.farm/scada/long-bottom-filter.svg",
    defaultSize: { width: 40, height: 120 },
    tags: ["instrument", "flow", "filter", "measurement"],
  },
  {
    id: "long-top-filter",
    name: "Long Top Filter",
    category: SVG_CATEGORIES.INSTRUMENTS,
    description: "Long top filter",
    svgPath:
      "https://s3.ap-south-1.amazonaws.com/app.sandbox.growloc.farm/scada/long-top-filter.svg",
    defaultSize: { width: 40, height: 120 },
    tags: ["instrument", "flow", "filter", "measurement"],
  },
  {
    id: "short-bottom-filter",
    name: "Short Bottom Filter",
    category: SVG_CATEGORIES.INSTRUMENTS,
    description: "Short bottom filter",
    svgPath:
      "https://s3.ap-south-1.amazonaws.com/app.sandbox.growloc.farm/scada/short-bottom-filter.svg",
    defaultSize: { width: 40, height: 100 },
    tags: ["instrument", "flow", "filter", "measurement"],
  },
  {
    id: "short-top-filter",
    name: "Short Top Filter",
    category: SVG_CATEGORIES.INSTRUMENTS,
    description: "Short top filter",
    svgPath:
      "https://s3.ap-south-1.amazonaws.com/app.sandbox.growloc.farm/scada/short-top-filter.svg",
    defaultSize: { width: 40, height: 100 },
    tags: ["instrument", "flow", "filter", "measurement"],
  },

  //Electrical
  {
    id: "power-button-off",
    name: "Power Button",
    category: SVG_CATEGORIES.INSTRUMENTS,
    description: "Power button off",
    svgPath:
      "https://s3.ap-south-1.amazonaws.com/app.sandbox.growloc.farm/scada/power-button-off.svg",
    defaultSize: { width: 40, height: 40 },
    tags: ["instrument", "electrical", "button"],
  },
  // {
  //   id: "power-button-off",
  //   name: "Power Button Off",
  //   category: SVG_CATEGORIES.INSTRUMENTS,
  //   description: "Power button off",
  //   svgPath:
  //     "https://s3.ap-south-1.amazonaws.com/app.sandbox.growloc.farm/scada/power-button-off.svg",
  //   defaultSize: { width: 40, height: 30 },
  //   tags: ["instrument", "electrical", "button"],
  // },
  {
    id: "square-box-1",
    name: "Blue Square Box",
    category: SVG_CATEGORIES.CONTAINERS,
    description: "Simple square box container",
    svgPath:
      "https://s3.ap-south-1.amazonaws.com/app.sandbox.growloc.farm/scada/sqaure-box-1.svg",
    defaultSize: { width: 100, height: 100 },
    tags: ["container", "square", "box", "simple"],
    properties: {
      capacity: 0,
      level: 0,
      material: "generic",
    },
  },
  {
    id: "polyhouse",
    name: "Polyhouse",
    category: SVG_CATEGORIES.CONTAINERS,
    description: "Polyhouse container",
    svgPath:
      "https://s3.ap-south-1.amazonaws.com/app.sandbox.growloc.farm/scada/polyhouse.svg",
    defaultSize: { width: 800, height: 550 },
    tags: ["container", "polyhouse"],
    properties: {
      capacity: 0,
      level: 0,
      material: "generic",
    },
  },
  {
    id: "seedling",
    name: "Seedling Row",
    category: SVG_CATEGORIES.CONTAINERS,
    description: "Seedling row container",
    svgPath:
      "https://s3.ap-south-1.amazonaws.com/app.sandbox.growloc.farm/scada/seedling-row.svg",
    defaultSize: { width: 200, height: 50 },
    tags: ["container", "seedling-row"],
    properties: {
      capacity: 0,
      level: 0,
      material: "generic",
    },
  },
  {
    id: "plant-pot",
    name: "Plant Pot",
    category: SVG_CATEGORIES.CONTAINERS,
    description: "Plant pot container",
    svgPath:
      "https://s3.ap-south-1.amazonaws.com/app.sandbox.growloc.farm/scada/plant-pot.svg",
    defaultSize: { width: 70, height: 70 },
    tags: ["container", "plant-pot"],
    properties: {
      capacity: 0,
      level: 0,
      material: "generic",
    },
  },
  {
    id: "left-circular-fan",
    name: "Left Side Exhaust Fan",
    category: SVG_CATEGORIES.CONTAINERS,
    description: "Circular fan container",
    svgPath:
      "https://s3.ap-south-1.amazonaws.com/app.sandbox.growloc.farm/scada/left-fan.svg",
    defaultSize: { width: 100, height: 100 },
    tags: ["container", "circular"],
    properties: {
      capacity: 0,
      level: 0,
      material: "generic",
      animatedSvgPath:
        "https://s3.ap-south-1.amazonaws.com/app.sandbox.growloc.farm/scada/left-animate-fan.svg",
    },
  },
  {
    id: "right-circular-fan",
    name: "Right Side Exhaust Fan",
    category: SVG_CATEGORIES.CONTAINERS,
    description: "Circular fan container",
    svgPath:
      "https://s3.ap-south-1.amazonaws.com/app.sandbox.growloc.farm/scada/right-fan.svg",
    defaultSize: { width: 100, height: 100 },
    tags: ["container", "circular"],
    properties: {
      capacity: 0,
      level: 0,
      material: "generic",
      animatedSvgPath:
        "https://s3.ap-south-1.amazonaws.com/app.sandbox.growloc.farm/scada/right-animate-fan.svg",
    },
  },
  {
    id: "fan-pad",
    name: "Fan Pad",
    category: SVG_CATEGORIES.CONTAINERS,
    description: "Fan pad container",
    svgPath:
      "https://s3.ap-south-1.amazonaws.com/app.sandbox.growloc.farm/scada/fan-pad.svg",
    defaultSize: { width: 100, height: 100 },
    tags: ["container", "fan-pad"],
    properties: {
      capacity: 0,
      level: 0,
      material: "generic",
    },
  },
  {
    id: "bulb",
    name: "Bulb",
    category: SVG_CATEGORIES.CONTAINERS,
    description: "Bulb container",
    svgPath:
      "https://s3.ap-south-1.amazonaws.com/app.sandbox.growloc.farm/scada/light.svg",
    defaultSize: { width: 100, height: 100 },
    tags: ["container", "bulb"],
    properties: {
      capacity: 0,
      level: 0,
      material: "generic",
      animatedSvgPath:
        "https://s3.ap-south-1.amazonaws.com/app.sandbox.growloc.farm/scada/light-animated.svg",
    },
  },
  {
    id: "fogger-pump",
    name: "Fogger Pump",
    category: SVG_CATEGORIES.CONTAINERS,
    description: "Fogger pump container",
    svgPath:
      "https://s3.ap-south-1.amazonaws.com/app.sandbox.growloc.farm/scada/fogger.svg",
    defaultSize: { width: 80, height: 80 },
    tags: ["container", "fogger-pump"],
    properties: {
      capacity: 0,
      level: 0,
      material: "generic",
      animatedSvgPath:
        "https://s3.ap-south-1.amazonaws.com/app.sandbox.growloc.farm/scada/fogger-animated.svg",
    },
  },
];

// Utility functions
export function getSvgElementsByCategory(
  category: SvgCategory
): SvgElementDefinition[] {
  return SVG_ELEMENTS.filter((element) => element.category === category);
}

export function searchSvgElements(query: string): SvgElementDefinition[] {
  const lowercaseQuery = query.toLowerCase();
  return SVG_ELEMENTS.filter(
    (element) =>
      element.name.toLowerCase().includes(lowercaseQuery) ||
      element.description.toLowerCase().includes(lowercaseQuery) ||
      element.tags.some((tag) => tag.toLowerCase().includes(lowercaseQuery))
  );
}

export function getSvgElementById(
  id: string
): SvgElementDefinition | undefined {
  return SVG_ELEMENTS.find((element) => element.id === id);
}

export function getAllCategories(): SvgCategory[] {
  return Object.values(SVG_CATEGORIES);
}
