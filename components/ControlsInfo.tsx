import React from 'react';

const Key: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <kbd className="w-10 h-10 sm:w-12 sm:h-12 inline-flex items-center justify-center bg-gray-700 text-gray-200 border border-gray-600 rounded-md shadow-md">
    {children}
  </kbd>
);

const ControlsInfo: React.FC = () => {
  return (
    <div className="mt-4 sm:mt-8 flex flex-col sm:flex-row justify-center items-center sm:items-start gap-8 sm:gap-16 text-white font-mono">
      <div className="text-center">
        <h3 className="text-xl sm:text-2xl font-bold mb-4 text-cyan-400">Player 1</h3>
        <div className="grid grid-cols-3 gap-2 w-32 sm:w-40 mx-auto">
          <div />
          <Key>W</Key>
          <div />
          <Key>A</Key>
          <Key>S</Key>
          <Key>D</Key>
        </div>
      </div>
      <div className="text-center">
        <h3 className="text-xl sm:text-2xl font-bold mb-4 text-red-500">Player 2</h3>
        <div className="grid grid-cols-3 gap-2 w-32 sm:w-40 mx-auto">
          <div />
          <Key>↑</Key>
          <div />
          <Key>←</Key>
          <Key>↓</Key>
          <Key>→</Key>
        </div>
      </div>
    </div>
  );
};

export default ControlsInfo;