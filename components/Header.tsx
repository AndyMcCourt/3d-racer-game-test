import React from 'react';

const Header: React.FC = () => {
  return (
    <header className="w-full bg-gray-800 shadow-lg py-4">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-cyan-400 text-center tracking-wider">
          Retro Racer Arena
        </h1>
      </div>
    </header>
  );
};

export default Header;
