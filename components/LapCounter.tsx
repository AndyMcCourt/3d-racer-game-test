import React from 'react';
import { CarState } from '../types';
import { LAPS_TO_WIN } from '../constants';

interface LapCounterProps {
  cars: CarState[];
}

const LapCounter: React.FC<LapCounterProps> = ({ cars }) => {
  const player1 = cars.find(car => car.id === 1);
  const player2 = cars.find(car => car.id === 2);

  return (
    <div className="absolute top-2 sm:top-4 left-2 sm:left-4 right-2 sm:right-4 flex justify-between text-white font-mono text-lg sm:text-2xl z-20 pointer-events-none">
      <div className="p-2 bg-gray-800 bg-opacity-75 rounded">
        <span className="text-cyan-400">P1 Laps: </span>
        <span>{player1 ? Math.min(player1.laps, LAPS_TO_WIN) : 0} / {LAPS_TO_WIN}</span>
      </div>
      <div className="p-2 bg-gray-800 bg-opacity-75 rounded">
        <span className="text-red-500">P2 Laps: </span>
        <span>{player2 ? Math.min(player2.laps, LAPS_TO_WIN) : 0} / {LAPS_TO_WIN}</span>
      </div>
    </div>
  );
};

export default LapCounter;