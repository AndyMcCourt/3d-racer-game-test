import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import * as THREE from 'three';
import GameOverlay from './components/GameOverlay';
import ControlsInfo from './components/ControlsInfo';
import LapCounter from './components/LapCounter';
import ThreeScene from './components/ThreeScene';
import TrackSelection from './components/TrackSelection';
import Header from './components/Header';
import Footer from './components/Footer';
import { useKeyPress } from './hooks/useKeyPress';
import { CarState, GameStatus, LapProgress, TrackDefinition } from './types';
import { TRACKS } from './tracks';
import { 
  ACCELERATION, 
  MAX_SPEED, 
  FRICTION, 
  TURN_SPEED, 
  GRASS_FRICTION,
  TRACK_LANE_WIDTH,
  LAPS_TO_WIN,
  DRIFT_FACTOR,
  GRIP_LOSS,
  QUICK_TURN_MULTIPLIER,
  QUICK_TURN_BRAKE_FACTOR
} from './constants';

// --- UTILITY FUNCTIONS ---

// Gets the closest point on a line segment to a given point
function getClosestPointOnSegment(p: {x:number, y:number}, a: {x:number, y:number}, b: {x:number, y:number}) {
    const ab = { x: b.x - a.x, y: b.y - a.y };
    const ap = { x: p.x - a.x, y: p.y - a.y };
    const dotAB = ab.x * ab.x + ab.y * ab.y;
    if (dotAB === 0) return a;
    const dotAP = ab.x * ap.x + ab.y * ap.y;
    const t = Math.max(0, Math.min(1, dotAP / dotAB));
    return { x: a.x + t * ab.x, y: a.y + t * ab.y };
}

// Checks if two line segments intersect
function segmentsIntersect(p1: any, q1: any, p2: any, q2: any) {
    function orientation(p: any, q: any, r: any) {
        const val = (q.y - p.y) * (r.x - q.x) - (q.x - p.x) * (r.y - q.y);
        if (val === 0) return 0; // Collinear
        return (val > 0) ? 1 : 2; // Clockwise or Counterclockwise
    }
    const o1 = orientation(p1, q1, p2);
    const o2 = orientation(p1, q1, q2);
    const o3 = orientation(p2, q2, p1);
    const o4 = orientation(p2, q2, q1);
    if (o1 !== o2 && o3 !== o4) return true;
    return false;
}

// --- APP COMPONENT ---

const getInitialCarStates = (track: TrackDefinition): CarState[] => [
  {
    id: 1, name: 'Player 1', color: '#06b6d4',
    position: track.startPositions[0],
    angle: track.startAngle,
    velocity: { x: 0, y: 0 }, speed: 0, laps: 0, lapProgress: LapProgress.Start,
    controls: { forward: 'w', backward: 's', left: 'd', right: 'a' },
  },
  {
    id: 2, name: 'Player 2', color: '#ef4444',
    position: track.startPositions[1],
    angle: track.startAngle,
    velocity: { x: 0, y: 0 }, speed: 0, laps: 0, lapProgress: LapProgress.Start,
    controls: { forward: 'arrowup', backward: 'arrowdown', left: 'arrowright', right: 'arrowleft' },
  },
];

const App: React.FC = () => {
  const [cars, setCars] = useState<CarState[]>([]);
  const [status, setStatus] = useState<GameStatus>(GameStatus.TrackSelection);
  const [winner, setWinner] = useState<string | null>(null);
  const [countdown, setCountdown] = useState(3);
  const [selectedTrack, setSelectedTrack] = useState<TrackDefinition | null>(null);
  
  const pressedKeys = useKeyPress();
  const pressedKeysRef = useRef(pressedKeys);
  useEffect(() => {
    pressedKeysRef.current = pressedKeys;
  }, [pressedKeys]);

  const gameLoopRef = useRef<number | null>(null);
  const countdownIntervalRef = useRef<number | null>(null);
  const winnerRef = useRef(winner);
  useEffect(() => {
    winnerRef.current = winner;
  }, [winner]);
  
  const trackCurvePoints = useMemo(() => {
    if (!selectedTrack) return [];
    const points = selectedTrack.path.map(p => new THREE.Vector3(p[0], 0, p[1]));
    const curve = new THREE.CatmullRomCurve3(points, true);
    return curve.getPoints(200); // Same resolution as renderer
  }, [selectedTrack]);

  const handleTrackSelect = (track: TrackDefinition) => {
    setSelectedTrack(track);
    setCars(getInitialCarStates(track));
    setStatus(GameStatus.Countdown);
  };

  const resetGame = useCallback(() => {
    setStatus(GameStatus.TrackSelection);
    setWinner(null);
    setCountdown(3);
    setSelectedTrack(null);
    setCars([]);
  }, []);

  useEffect(() => {
    if (status === GameStatus.Countdown) {
      countdownIntervalRef.current = window.setInterval(() => {
        setCountdown(prev => prev - 1);
      }, 1000);
    }
  }, [status]);
  
  useEffect(() => {
    if (countdown === 0) {
      if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);
      setStatus(GameStatus.Racing);
    }
  }, [countdown]);

  const updateGame = useCallback(() => {
    if (!selectedTrack || trackCurvePoints.length === 0) return;

    setCars(prevCars => {
      const newCars = prevCars.map(car => {
        let updatedCar = { ...car, position: { ...car.position }, velocity: { ...car.velocity } };
        const { controls } = updatedCar;
        const forward = pressedKeysRef.current.has(controls.forward);
        const backward = pressedKeysRef.current.has(controls.backward);
        const left = pressedKeysRef.current.has(controls.left);
        const right = pressedKeysRef.current.has(controls.right);

        // --- Refactored Physics Logic ---

        // 1. Handle acceleration. Only apply if brake/reverse is NOT held down.
        if (forward && !backward) {
            updatedCar.speed = Math.min(updatedCar.speed + ACCELERATION, MAX_SPEED);
        }

        // 2. Check for the handbrake turn condition.
        const isHandbrakeTurn = updatedCar.speed > MAX_SPEED * 0.3 && backward && (left || right);

        // 3. Apply braking, turning, and drifting logic.
        if (isHandbrakeTurn) {
            // Apply a strong braking force to induce a skid
            updatedCar.speed *= QUICK_TURN_BRAKE_FACTOR;

            // Apply a much faster turn rate
            const quickTurnAmount = TURN_SPEED * QUICK_TURN_MULTIPLIER;
            if (left) updatedCar.angle += quickTurnAmount;
            if (right) updatedCar.angle -= quickTurnAmount;

            // Induce a strong drift
            updatedCar.velocity.x *= DRIFT_FACTOR;
            updatedCar.velocity.y *= DRIFT_FACTOR;
            const driftAngle = updatedCar.angle + (Math.PI / 2) * (left ? 1 : -1);
            updatedCar.velocity.x += Math.cos(driftAngle) * GRIP_LOSS * updatedCar.speed * 1.5;
            updatedCar.velocity.y += Math.sin(driftAngle) * GRIP_LOSS * updatedCar.speed * 1.5;
        } else {
            // --- Normal Braking & Turning Logic ---
            if (backward) {
                updatedCar.speed = Math.max(updatedCar.speed - ACCELERATION, -MAX_SPEED / 2);
            }

            if (updatedCar.speed !== 0) {
              const turnDirection = updatedCar.speed > 0 ? 1 : -1;
              const speedRatio = Math.min(1, Math.abs(updatedCar.speed) / MAX_SPEED);
              const turnFactor = 1.5 - (0.5 * speedRatio);
              const turnAmount = TURN_SPEED * turnDirection * turnFactor;

              if (left) updatedCar.angle += turnAmount;
              if (right) updatedCar.angle -= turnAmount;
              
              // Normal drift at high speeds
              if ((left || right) && Math.abs(updatedCar.speed) > MAX_SPEED * 0.4) {
                updatedCar.velocity.x *= DRIFT_FACTOR;
                updatedCar.velocity.y *= DRIFT_FACTOR;
                const driftAngle = updatedCar.angle + (Math.PI / 2) * (left ? 1 : -1);
                updatedCar.velocity.x += Math.cos(driftAngle) * GRIP_LOSS * updatedCar.speed;
                updatedCar.velocity.y += Math.sin(driftAngle) * GRIP_LOSS * updatedCar.speed;
              }
            }
        }
        
        // 4. Apply general friction and update velocity/position
        updatedCar.speed *= (1 - FRICTION);
        if (Math.abs(updatedCar.speed) < 0.01) updatedCar.speed = 0;

        const forwardVelX = Math.cos(updatedCar.angle) * updatedCar.speed;
        const forwardVelY = Math.sin(updatedCar.angle) * updatedCar.speed;
        
        // Define the condition for a normal high-speed drift
        const isNormalDrift = !isHandbrakeTurn && (left || right) && Math.abs(updatedCar.speed) > MAX_SPEED * 0.4;

        // If we are in any kind of drift (handbrake or normal), blend the car's forward momentum
        // with its existing sideways velocity. Otherwise, the velocity is purely forward.
        if (isHandbrakeTurn || isNormalDrift) {
          updatedCar.velocity.x += (forwardVelX - updatedCar.velocity.x) * 0.2;
          updatedCar.velocity.y += (forwardVelY - updatedCar.velocity.y) * 0.2;
        } else {
           updatedCar.velocity = { x: forwardVelX, y: forwardVelY };
        }

        const prevPosition = { ...updatedCar.position };
        updatedCar.position.x += updatedCar.velocity.x;
        updatedCar.position.y += updatedCar.velocity.y;
        
        // --- ALIGNED PHYSICS & VISUALS ---
        // Find distance to the smoothed curve, not the raw path points
        let minDist = Infinity;
        for (let i = 0; i < trackCurvePoints.length; i++) {
            const p1_vec = trackCurvePoints[i];
            const p2_vec = trackCurvePoints[(i + 1) % trackCurvePoints.length]; // Loop back to start for closed curve
            const p1 = { x: p1_vec.x, y: p1_vec.z };
            const p2 = { x: p2_vec.x, y: p2_vec.z };
            const closest = getClosestPointOnSegment(updatedCar.position, p1, p2);
            const dist = Math.hypot(updatedCar.position.x - closest.x, updatedCar.position.y - closest.y);
            if (dist < minDist) {
                minDist = dist;
            }
        }

        if (minDist > TRACK_LANE_WIDTH / 2) {
          updatedCar.speed *= (1 - GRASS_FRICTION);
        }

        // --- ROBUST LAP DETECTION LOGIC ---
        const movementSegment = { p1: prevPosition, q1: updatedCar.position };

        // 1. Check for crossing finish line (only if we are halfway through the lap)
        if (updatedCar.lapProgress === LapProgress.Halfway) {
          const finishSegment = { p2: selectedTrack.finishLine.p1, q2: selectedTrack.finishLine.p2 };
          if (segmentsIntersect(movementSegment.p1, movementSegment.q1, finishSegment.p2, finishSegment.q2)) {
            updatedCar.laps += 1;
            updatedCar.lapProgress = LapProgress.Start; // Reset for the next lap
            if (updatedCar.laps >= LAPS_TO_WIN && !winnerRef.current) {
              setWinner(updatedCar.name);
              setStatus(GameStatus.Finished);
            }
          }
        } 
        // 2. Check for crossing halfway line (only if we are at the start of a lap)
        else if (updatedCar.lapProgress === LapProgress.Start) {
          const halfwaySegment = { p2: selectedTrack.halfwayLine.p1, q2: selectedTrack.halfwayLine.p2 };
          if (segmentsIntersect(movementSegment.p1, movementSegment.q1, halfwaySegment.p2, halfwaySegment.q2)) {
            updatedCar.lapProgress = LapProgress.Halfway;
          }
        }
        
        return updatedCar;
      });
      return newCars;
    });
  }, [selectedTrack, trackCurvePoints]);

  useEffect(() => {
    if (status === GameStatus.Racing) {
      gameLoopRef.current = requestAnimationFrame(function gameLoop() {
        updateGame();
        gameLoopRef.current = requestAnimationFrame(gameLoop);
      });
    }
    return () => {
      if (gameLoopRef.current) cancelAnimationFrame(gameLoopRef.current);
    };
  }, [status, updateGame]);
  
  return (
    <div className="bg-gray-900 min-h-screen flex flex-col font-sans text-white">
      <Header />
      <main className="flex-grow flex flex-col items-center justify-center p-2 sm:p-4">
        <div className="w-full max-w-[1000px] mx-auto aspect-[10/6] relative bg-black rounded-lg shadow-2xl overflow-hidden">
          {status === GameStatus.TrackSelection && (
            <TrackSelection tracks={TRACKS} onSelectTrack={handleTrackSelect} />
          )}
          <GameOverlay
            status={status}
            winner={winner}
            countdown={countdown}
            onReset={resetGame}
          />
          {status !== GameStatus.TrackSelection && selectedTrack && (
            <>
              <LapCounter cars={cars} />
              <ThreeScene cars={cars} track={selectedTrack} />
            </>
          )}
          {status !== GameStatus.TrackSelection && (
            <button
              onClick={resetGame}
              className="absolute bottom-4 right-4 px-6 py-3 bg-red-600 text-white font-bold rounded-lg shadow-md hover:bg-red-500 transition-colors z-30"
              aria-label="Exit to track selection"
            >
              Exit
            </button>
          )}
        </div>
        <ControlsInfo />
      </main>
      <Footer />
    </div>
  );
};

export default App;
