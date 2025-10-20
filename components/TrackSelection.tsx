import React from 'react';
import { TrackDefinition } from '../types';

interface TrackSelectionProps {
  tracks: TrackDefinition[];
  onSelectTrack: (track: TrackDefinition) => void;
}

const TrackSelection: React.FC<TrackSelectionProps> = ({ tracks, onSelectTrack }) => {
  return (
    <div className="absolute inset-0 bg-gray-800 flex flex-col justify-center items-center z-20 p-4 sm:p-8">
      <h1 className="text-4xl md:text-6xl mb-8 text-cyan-400 font-bold">Select a Track</h1>
      <div className="w-full grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 sm:gap-6 overflow-y-auto">
        {tracks.map(track => (
          <button
            key={track.id}
            onClick={() => onSelectTrack(track)}
            className="p-2 sm:p-4 bg-gray-700 text-white rounded-lg shadow-lg hover:bg-cyan-500 transition-colors focus:outline-none focus:ring-4 focus:ring-cyan-300 transform hover:scale-105"
          >
            <div className="text-base sm:text-xl font-semibold">{track.name}</div>
          </button>
        ))}
      </div>
    </div>
  );
};

export default TrackSelection;