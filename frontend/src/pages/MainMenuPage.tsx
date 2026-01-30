/**
 * Main Menu Page - Integration Example
 * 
 * Example of using the MainMenu component in the app
 */

import React from 'react';
import { useNavigate } from 'react-router-dom';
import { MainMenu } from '@/components/MainMenu';

/**
 * Main Menu Page Component
 */
export const MainMenuPage: React.FC = () => {
  const navigate = useNavigate();

  return <MainMenu />;
};

/**
 * Alternative: Main Menu with Navigation
 */
export const MainMenuWithNav: React.FC = () => {
  const navigate = useNavigate();

  const handleNewGame = () => {
    navigate('/game/setup');
  };

  const handleContinue = () => {
    navigate('/game');
  };

  const handleExit = () => {
    if (window.confirm('Are you sure you want to exit?')) {
      window.close();
    }
  };

  return <MainMenu />;
};

/**
 * App.tsx integration example
 */
/*
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { MainMenuPage } from '@/pages/MainMenuPage';
import { GamePage } from '@/pages/GamePage';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<MainMenuPage />} />
        <Route path="/game" element={<GamePage />} />
        <Route path="/game/setup" element={<GameSetupPage />} />
      </Routes>
    </BrowserRouter>
  );
}
*/

export default MainMenuPage;
