/**
 * Game Controls Component
 * 
 * Game time display and speed controls
 */

import React from 'react';
import type { GameSpeed } from './GameHUD';
import './GameControls.css';

/**
 * Game Controls Props
 */
interface GameControlsProps {
  gameSpeed: GameSpeed;
  currentTime: number;
  onSpeedChange: (speed: GameSpeed) => void;
}

/**
 * Game Controls Component
 */
export const GameControls: React.FC<GameControlsProps> = ({
  gameSpeed,
  currentTime,
  onSpeedChange
}) => {
  /**
   * Format game time
   */
  const formatGameTime = (milliseconds: number): string => {
    const totalSeconds = Math.floor(milliseconds / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    return `${hours.toString().padStart(2, '0')}:${minutes
      .toString()
      .padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  /**
   * Format date (year, day)
   */
  const formatGameDate = (milliseconds: number): string => {
    const days = Math.floor(milliseconds / (1000 * 60 * 60 * 24));
    const year = Math.floor(days / 365) + 2100; // Start year 2100
    const dayOfYear = days % 365;

    return `Year ${year}, Day ${dayOfYear + 1}`;
  };

  return (
    <div className="game-controls">
      {/* Time Display */}
      <div className="time-display">
        <div className="game-date">{formatGameDate(currentTime)}</div>
        <div className="game-time">{formatGameTime(currentTime)}</div>
      </div>

      {/* Speed Controls */}
      <div className="speed-controls">
        <button
          className={`speed-btn ${gameSpeed === 'paused' ? 'active' : ''}`}
          onClick={() => onSpeedChange('paused')}
          title="Pause (Space)"
        >
          ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚ÂÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¸ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¯ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¸ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â
        </button>

        <button
          className={`speed-btn ${gameSpeed === '1x' ? 'active' : ''}`}
          onClick={() => onSpeedChange('1x')}
          title="Normal Speed (1)"
        >
          1ÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â
        </button>

        <button
          className={`speed-btn ${gameSpeed === '2x' ? 'active' : ''}`}
          onClick={() => onSpeedChange('2x')}
          title="Fast (2)"
        >
          2ÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â
        </button>

        <button
          className={`speed-btn ${gameSpeed === '4x' ? 'active' : ''}`}
          onClick={() => onSpeedChange('4x')}
          title="Very Fast (3)"
        >
          4ÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â
        </button>
      </div>
    </div>
  );
};

export default GameControls;
