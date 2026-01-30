/**
 * Game HUD Component
 * 
 * Main heads-up display for the game interface
 */

import React, { useState, useEffect } from 'react';
import { ResourceBar } from './ResourceBar';
import { Minimap } from './Minimap';
import { NotificationBadge } from './NotificationBadge';
import { QuickActions } from './QuickActions';
import { GameControls } from './GameControls';
import { AllianceStatus } from './AllianceStatus';
import type { Alliance } from '@shared/types/alliance';
import type { Planet } from '@shared/types/galaxyMap';
import './GameHUD.css';

/**
 * Game speed multipliers
 */
export type GameSpeed = 'paused' | '1x' | '2x' | '4x';

/**
 * Resource data
 */
export interface ResourceData {
  minerals: number;
  energy: number;
  credits: number;
  population: number;
  storage: {
    minerals: number;
    energy: number;
    credits: number;
  };
}

/**
 * Income data
 */
export interface IncomeData {
  minerals: number;
  energy: number;
  credits: number;
}

/**
 * HUD props
 */
interface GameHUDProps {
  resources: ResourceData;
  income: IncomeData;
  unreadMessages: number;
  alliance?: Alliance;
  planets: Planet[];
  currentPlanetId?: string;
  gameSpeed: GameSpeed;
  currentTime: number;
  onSpeedChange: (speed: GameSpeed) => void;
  onFleetManager: () => void;
  onResearch: () => void;
  onDiplomacy: () => void;
  onMessages: () => void;
  onLogout: () => void;
  onPlanetSelect?: (planetId: string) => void;
}

/**
 * Game HUD Component
 */
export const GameHUD: React.FC<GameHUDProps> = ({
  resources,
  income,
  unreadMessages,
  alliance,
  planets,
  currentPlanetId,
  gameSpeed,
  currentTime,
  onSpeedChange,
  onFleetManager,
  onResearch,
  onDiplomacy,
  onMessages,
  onLogout,
  onPlanetSelect
}) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [showAlliancePopup, setShowAlliancePopup] = useState(false);

  /**
   * Handle keyboard shortcuts
   */
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      // Only handle if not typing in input
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }

      switch (e.key.toLowerCase()) {
        case 'f':
          onFleetManager();
          break;
        case 'r':
          onResearch();
          break;
        case 'd':
          onDiplomacy();
          break;
        case 'm':
          onMessages();
          break;
        case ' ':
          e.preventDefault();
          onSpeedChange(gameSpeed === 'paused' ? '1x' : 'paused');
          break;
        case '1':
          onSpeedChange('1x');
          break;
        case '2':
          onSpeedChange('2x');
          break;
        case '3':
          onSpeedChange('4x');
          break;
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [gameSpeed, onSpeedChange, onFleetManager, onResearch, onDiplomacy, onMessages]);

  return (
    <div className={`game-hud ${isCollapsed ? 'collapsed' : ''}`}>
      {/* Top Bar */}
      <div className="hud-top-bar">
        {/* Left Section - Resources */}
        <div className="hud-left">
          <ResourceBar resources={resources} income={income} />
        </div>

        {/* Center Section - Game Time & Controls */}
        <div className="hud-center">
          <GameControls
            gameSpeed={gameSpeed}
            currentTime={currentTime}
            onSpeedChange={onSpeedChange}
          />
        </div>

        {/* Right Section - Alliance & User */}
        <div className="hud-right">
          {alliance && (
            <AllianceStatus
              alliance={alliance}
              onViewDetails={() => setShowAlliancePopup(!showAlliancePopup)}
            />
          )}

          <button className="logout-button" onClick={onLogout} title="Logout">
            <span className="icon">ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â°ÃƒÆ’Ã¢â‚¬Â¦Ãƒâ€šÃ‚Â¸ÃƒÆ’Ã¢â‚¬Â¦Ãƒâ€šÃ‚Â¡ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Âª</span>
            <span className="label">Logout</span>
          </button>
        </div>
      </div>

      {/* Quick Actions Bar */}
      <div className="hud-quick-actions">
        <QuickActions
          onFleetManager={onFleetManager}
          onResearch={onResearch}
          onDiplomacy={onDiplomacy}
          unreadMessages={unreadMessages}
          onMessages={onMessages}
        />
      </div>

      {/* Minimap */}
      <div className="hud-minimap">
        <Minimap
          planets={planets}
          currentPlanetId={currentPlanetId}
          onPlanetSelect={onPlanetSelect}
        />
      </div>

      {/* Collapse Toggle */}
      <button
        className="hud-collapse-toggle"
        onClick={() => setIsCollapsed(!isCollapsed)}
        title={isCollapsed ? 'Show HUD' : 'Hide HUD'}
      >
        {isCollapsed ? 'ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ÃƒÂ¢Ã¢â€šÂ¬Ã…â€œÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¼' : 'ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ÃƒÂ¢Ã¢â€šÂ¬Ã…â€œÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â²'}
      </button>
    </div>
  );
};

export default GameHUD;
