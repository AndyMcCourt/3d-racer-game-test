import { TrackDefinition } from './types';
import { TRACK_LANE_WIDTH } from './constants';

// Helper to generate an ellipse path
const generateEllipsePath = (cx: number, cy: number, rx: number, ry: number, segments: number, startAngle = 0): [number, number][] => {
  const path: [number, number][] = [];
  for (let i = 0; i <= segments; i++) {
    const angle = startAngle + (i / segments) * Math.PI * 2;
    const x = cx + rx * Math.cos(angle);
    const y = cy + ry * Math.sin(angle);
    path.push([x, y]);
  }
  return path;
};

const w = TRACK_LANE_WIDTH;
const w2 = w / 2;
const w4 = w / 4;

export const TRACKS: TrackDefinition[] = [
  {
    id: 1,
    name: "Classic Oval",
    path: generateEllipsePath(0, 0, 50, 30, 40),
    startAngle: 0,
    startPositions: [
      { x: -50, y: w4 },
      { x: -50, y: -w4 },
    ],
    finishLine: { p1: { x: -50, y: -w2 }, p2: { x: -50, y: w2 } },
    halfwayLine: { p1: { x: 50, y: -w2 }, p2: { x: 50, y: w2 } },
  },
  {
    id: 2,
    name: "The Bean",
    path: [
      [-40, 0], [-50, 20], [-40, 40], [0, 40],
      [40, 40], [50, 20], [40, 0], [20, 0],
      [10, -15], [-10, -15], [-20, 0], [-40, 0]
    ],
    startAngle: Math.PI,
    startPositions: [
      { x: 30, y: 1 + w4 },
      { x: 30, y: 1 - w4 },
    ],
    finishLine: { p1: { x: 30, y: 1 - w2 }, p2: { x: 30, y: 1 + w2 } },
    halfwayLine: { p1: { x: -45, y: 20 }, p2: { x: -45, y: 40 } },
  },
  {
    id: 3,
    name: "Right Turn",
    path: [
        [-40, -30], [40, -30], [50, -20], [50, 20],
        [40, 30], [-40, 30], [-50, 20], [-50, -20], [-40, -30]
    ],
    startAngle: 0,
    startPositions: [
        { x: 0, y: -31 + w4 }, 
        { x: 0, y: -31 - w4 }
    ],
    finishLine: { p1: { x: 0, y: -31 - w2 }, p2: { x: 0, y: -31 + w2 } },
    halfwayLine: { p1: { x: 0, y: 30 - w2 }, p2: { x: 0, y: 30 + w2 } },
  },
  {
    id: 4,
    name: "Superspeedway",
    path: generateEllipsePath(0, 0, 65, 25, 50),
    startAngle: 0,
    startPositions: [
      { x: -65, y: w4 },
      { x: -65, y: -w4 },
    ],
    finishLine: { p1: { x: -65, y: -w2 }, p2: { x: -65, y: w2 } },
    halfwayLine: { p1: { x: 65, y: -w2 }, p2: { x: 65, y: w2 } },
  },
  {
    id: 5,
    name: "The Pretzel",
    path: [
        [-20, 0], [-40, 20], [-20, 40], [20, 40], [40, 20], [20, 0],
        [-20, 0], [-40, -20], [-20, -40], [20, -40], [40, -20], [20, 0], [-20, 0]
    ],
    startAngle: Math.PI,
    startPositions: [
        { x: 0, y: w4}, 
        { x: 0, y: -w4 }
    ],
    finishLine: { p1: { x: 0, y: -w2 }, p2: { x: 0, y: w2 } },
    halfwayLine: { p1: { x: 40, y: -20 }, p2: { x: 40, y: 20 } },
  },
  {
    id: 6,
    name: "Winding Road",
    path: [
        [-50, -20], [0, -20], [20, 0], [40, -20], [60, 0], [60, 30],
        [40, 30], [20, 10], [0, 30], [-50, 30], [-50, -20]
    ],
    startAngle: 0,
    startPositions: [
        { x: -25, y: -19 + w4 }, 
        { x: -25, y: -19 - w4 }
    ],
    finishLine: { p1: { x: -25, y: -19 - w2 }, p2: { x: -25, y: -19 + w2 } },
    halfwayLine: { p1: { x: 0, y: 30 - w2 }, p2: { x: 0, y: 30 + w2 } },
  },
  {
    id: 7,
    name: "Square Circuit",
    path: [
        [-40, -30], [40, -30], [40, 30], [-40, 30], [-40, -30]
    ],
    startAngle: 0,
    startPositions: [
        { x: 0, y: -33 + w4 }, 
        { x: 0, y: -33 - w4 }
    ],
    finishLine: { p1: { x: 0, y: -33 - w2 }, p2: { x: 0, y: -33 + w2 } },
    halfwayLine: { p1: { x: 0, y: 30 - w2 }, p2: { x: 0, y: 30 + w2 } },
  },
  {
    id: 8,
    name: "Peanut",
    path: [
        [0, 2], [-30, -30], [-40, 0], [-30, 30], [0, -2],
        [30, 30], [40, 0], [30, -30], [0, 2]
    ],
    startAngle: -Math.PI / 2,
    startPositions: [
        { x: w4, y: 0 }, 
        { x: -w4, y: 0 }
    ],
    finishLine: { p1: { x: -w2, y: 0 }, p2: { x: w2, y: 0 } },
    halfwayLine: { p1: { x: -40, y: -w2 }, p2: { x: -40, y: w2 } },
  },
  {
    id: 9,
    name: "Long Straight",
    path: [
        [-60, -15], [60, -15], [60, 15], [-60, 15], [-60, -15]
    ],
    startAngle: 0,
    startPositions: [
        { x: 0, y: -16 + w4 }, 
        { x: 0, y: -16 - w4 }
    ],
    finishLine: { p1: { x: 0, y: -16 - w2 }, p2: { x: 0, y: -16 + w2 } },
    halfwayLine: { p1: { x: 0, y: 15 - w2 }, p2: { x: 0, y: 15 + w2 } },
  },
  {
    id: 10,
    name: "The 'S'",
    path: [
        [-50, -20], [0, -20], [20, -10], [0, 0], [20, 10], [0, 20], [-50, 20], [-50, -20]
    ],
    startAngle: Math.PI / 2, // Pointing up
    startPositions: [
        { x: 0 + w4, y: 0 }, 
        { x: 0 - w4, y: 0 }
    ],
    finishLine: { p1: { x: -w2, y: 0 }, p2: { x: w2, y: 0 } },
    halfwayLine: { p1: { x: -50 - w2, y: 0 }, p2: { x: -50 + w2, y: 0 } },
  },
  {
    id: 11,
    name: "Donut",
    path: generateEllipsePath(0, 0, 35, 35, 40),
    startAngle: 0,
    startPositions: [
        { x: -35, y: w4 }, 
        { x: -35, y: -w4 }
    ],
    finishLine: { p1: { x: -35, y: -w2 }, p2: { x: -35, y: w2 } },
    halfwayLine: { p1: { x: 35, y: -w2 }, p2: { x: 35, y: w2 } },
  },
];