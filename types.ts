import { Vector2 } from 'three';

export enum GameStatus {
  TrackSelection = 'track-selection',
  Countdown = 'countdown',
  Racing = 'racing',
  Finished = 'finished',
}

export enum LapProgress {
  Start,
  Halfway,
}

export interface TrackDefinition {
  id: number;
  name: string;
  // Path is defined as an array of [x, z] coordinates for the center line
  path: [number, number][];
  // Positions are {x, z}
  startPositions: [{ x: number; y: number }, { x: number; y: number }];
  startAngle: number;
  // Finish line is a line segment {p1: {x,z}, p2: {x,z}}
  finishLine: { p1: { x: number; y: number }; p2: { x: number; y: number } };
  // Halfway line is a checkpoint to ensure a full lap is completed
  halfwayLine: { p1: { x: number; y: number }; p2: { x: number; y: number } };
}


export interface CarState {
  id: number;
  name: string;
  color: string;
  position: { x: number; y: number }; // Corresponds to X and Z in 3D space
  velocity: { x: number; y: number };
  angle: number;
  speed: number;
  laps: number;
  lapProgress: LapProgress;
  controls: {
    forward: string;
    backward: string;
    left: string;
    right: string;
  };
}