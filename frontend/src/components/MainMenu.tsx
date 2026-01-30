/**
 * Main Menu Component
 * 
 * Stellaris-inspired main menu with animated space background
 */

import React, { useState, useEffect } from 'react';
import { SpaceBackground } from './SpaceBackground';
import { SettingsModal } from './SettingsModal';
import { BackgroundMusic } from './BackgroundMusic';
import './MainMenu.css';

/**
 * Menu button props
 */
interface MenuButtonProps {
  label: string;
  onClick: () => void;
  disabled?: boolean;
  icon?: string;
  soundEnabled?: boolean;
}

/**
 * Main Menu Component
 */
export const MainMenu: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [hasSaveGame, setHasSaveGame] = useState(false);

  /**
   * Fade in on mount
   */
  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 100);
    
    // Check for existing save game
    const saveExists = localStorage.getItem('gameState') !== null;
    setHasSaveGame(saveExists);

    return () => clearTimeout(timer);
  }, []);

  /**
   * Play hover sound
   */
  const playHoverSound = () => {
    if (!soundEnabled) return;
    
    // Placeholder for sound effect
    // const audio = new Audio('/sounds/ui-hover.mp3');
    // audio.volume = 0.3;
    // audio.play().catch(() => {});
  };

  /**
   * Play click sound
   */
  const playClickSound = () => {
    if (!soundEnabled) return;
    
    // Placeholder for sound effect
    // const audio = new Audio('/sounds/ui-click.mp3');
    // audio.volume = 0.5;
    // audio.play().catch(() => {});
  };

  /**
   * Handle new game
   */
  const handleNewGame = () => {
    playClickSound();
    // TODO: Navigate to game setup
    console.log('New Game');
  };

  /**
   * Handle continue
   */
  const handleContinue = () => {
    playClickSound();
    // TODO: Load saved game
    console.log('Continue');
  };

  /**
   * Handle settings
   */
  const handleSettings = () => {
    playClickSound();
    setShowSettings(true);
  };

  /**
   * Handle exit
   */
  const handleExit = () => {
    playClickSound();
    // In electron app, this would close the window
    console.log('Exit');
    window.close();
  };

  return (
    <div className="main-menu">
      {/* Animated Background */}
      <SpaceBackground />

      {/* Background Music */}
      <BackgroundMusic soundEnabled={soundEnabled} />

      {/* Main Menu Content */}
      <div className={`menu-content ${isVisible ? 'fade-in' : 'fade-out'}`}>
        {/* Title Logo */}
        <div className="title-container">
          <h1 className="game-title">
            <span className="title-main">GALACTIC</span>
            <span className="title-sub">CONQUEST</span>
          </h1>
          <div className="title-tagline">
            A Space Strategy Game
          </div>
        </div>

        {/* Menu Buttons */}
        <div className="menu-buttons">
          <MenuButton
            label="New Game"
            icon="ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â°ÃƒÆ’Ã¢â‚¬Â¦Ãƒâ€šÃ‚Â¸ÃƒÆ’Ã¢â‚¬Â¦Ãƒâ€šÃ‚Â¡ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡Ãƒâ€šÃ‚Â¬"
            onClick={handleNewGame}
            onMouseEnter={playHoverSound}
            soundEnabled={soundEnabled}
          />

          <MenuButton
            label="Continue"
            icon="ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â°ÃƒÆ’Ã¢â‚¬Â¦Ãƒâ€šÃ‚Â¸ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬Ãƒâ€¦Ã¢â‚¬Å“ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â"
            onClick={handleContinue}
            onMouseEnter={playHoverSound}
            disabled={!hasSaveGame}
            soundEnabled={soundEnabled}
          />

          <MenuButton
            label="Settings"
            icon="ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã¢â‚¬Â¦Ãƒâ€šÃ‚Â¡ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¾Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¯ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¸ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â"
            onClick={handleSettings}
            onMouseEnter={playHoverSound}
            soundEnabled={soundEnabled}
          />

          <MenuButton
            label="Exit"
            icon="ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â°ÃƒÆ’Ã¢â‚¬Â¦Ãƒâ€šÃ‚Â¸ÃƒÆ’Ã¢â‚¬Â¦Ãƒâ€šÃ‚Â¡ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Âª"
            onClick={handleExit}
            onMouseEnter={playHoverSound}
            soundEnabled={soundEnabled}
          />
        </div>

        {/* Version Info */}
        <div className="version-info">
          <span>Version 1.0.0</span>
          <span className="separator">ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡Ãƒâ€šÃ‚Â¬ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¢</span>
          <span>ÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â© 2024</span>
        </div>
      </div>

      {/* Settings Modal */}
      {showSettings && (
        <SettingsModal
          onClose={() => setShowSettings(false)}
          soundEnabled={soundEnabled}
          onSoundEnabledChange={setSoundEnabled}
        />
      )}
    </div>
  );
};

/**
 * Menu Button Component
 */
const MenuButton: React.FC<MenuButtonProps & { onMouseEnter?: () => void }> = ({
  label,
  icon,
  onClick,
  disabled = false,
  onMouseEnter,
  soundEnabled
}) => {
  return (
    <button
      className={`menu-button ${disabled ? 'disabled' : ''}`}
      onClick={onClick}
      onMouseEnter={onMouseEnter}
      disabled={disabled}
    >
      <span className="button-icon">{icon}</span>
      <span className="button-label">{label}</span>
      <div className="button-glow"></div>
      <div className="button-shine"></div>
    </button>
  );
};

export default MainMenu;
