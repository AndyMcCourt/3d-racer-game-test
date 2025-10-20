import React from 'react';
import { GameStatus } from '../types';

interface GameOverlayProps {
  status: GameStatus;
  winner: string | null;
  countdown: number;
  onReset: () => void;
}

const GameOverlay: React.FC<GameOverlayProps> = ({ status, winner, countdown, onReset }) => {
  if (status !== GameStatus.Countdown && status !== GameStatus.Finished) {
    return null;
  }

  return (
    <div className="absolute inset-0 bg-black bg-opacity-60 flex flex-col justify-center items-center text-white font-bold z-10">
      {status === GameStatus.Countdown && (
        <h1 className="text-7xl sm:text-9xl animate-ping">{countdown}</h1>
      )}
      {status === GameStatus.Finished && winner && (
        <>
          <h1 className="text-4xl sm:text-6xl mb-4">{winner} Wins!</h1>
          <button
            onClick={onReset}
            className="px-6 py-3 text-xl sm:px-8 sm:py-4 sm:text-2xl bg-red-500 hover:bg-red-400 rounded-lg shadow-lg transform hover:scale-105 transition-transform"
          >
            Choose New Track
          </button>
        </>
      )}
    </div>
  );
};

export default GameOverlay;