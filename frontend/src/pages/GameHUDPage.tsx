/**
 * Game HUD Page - Integration Example
 * 
 * Example of using GameHUD with game state
 */

import React, { useState, useEffect } from 'react';
import { GameHUD, GameSpeed, ResourceData, IncomeData } from '@/components/GameHUD';
import type { Alliance } from '@shared/types/alliance';
import type { Planet } from '@shared/types/galaxyMap';

/**
 * Game HUD Page Component
 */
export const GameHUDPage: React.FC = () => {
  const [resources, setResources] = useState<ResourceData>({
    minerals: 1250,
    energy: 850,
    credits: 5420,
    population: 15000,
    storage: {
      minerals: 10000,
      energy: 5000,
      credits: 50000
    }
  });

  const [income] = useState<IncomeData>({
    minerals: 120,
    energy: 95,
    credits: 45
  });

  const [unreadMessages, setUnreadMessages] = useState(3);
  const [gameSpeed, setGameSpeed] = useState<GameSpeed>('1x');
  const [currentTime, setCurrentTime] = useState(0);
  const [planets, setPlanets] = useState<Planet[]>([]);
  const [alliance, setAlliance] = useState<Alliance | undefined>();

  /**
   * Game tick - update time and resources
   */
  useEffect(() => {
    if (gameSpeed === 'paused') return;

    const speedMultipliers = {
      'paused': 0,
      '1x': 1,
      '2x': 2,
      '4x': 4
    };

    const multiplier = speedMultipliers[gameSpeed];
    const interval = setInterval(() => {
      setCurrentTime(prev => prev + 1000 * multiplier);

      // Update resources based on income
      setResources(prev => ({
        ...prev,
        minerals: Math.min(
          prev.storage.minerals,
          prev.minerals + (income.minerals * multiplier) / 3600
        ),
        energy: Math.min(
          prev.storage.energy,
          prev.energy + (income.energy * multiplier) / 3600
        ),
        credits: Math.min(
          prev.storage.credits,
          prev.credits + (income.credits * multiplier) / 3600
        )
      }));
    }, 1000);

    return () => clearInterval(interval);
  }, [gameSpeed, income]);

  /**
   * Load initial data
   */
  useEffect(() => {
    // TODO: Load from API
    const mockPlanets: Planet[] = [
      {
        id: 'planet-1',
        name: 'Home World',
        position: { x: 100, y: 100 },
        size: 10,
        type: 'terran',
        ownerId: 'player-1',
        resources: { minerals: 1000, energy: 500, crystal: 200 },
        buildings: []
      },
      {
        id: 'planet-2',
        name: 'Colony Alpha',
        position: { x: 300, y: 200 },
        size: 8,
        type: 'desert',
        ownerId: 'player-1',
        resources: { minerals: 800, energy: 400, crystal: 150 },
        buildings: []
      }
    ];

    setPlanets(mockPlanets);

    // Load alliance if user is in one
    // setAlliance(mockAlliance);
  }, []);

  /**
   * Handle fleet manager
   */
  const handleFleetManager = () => {
    console.log('Open fleet manager');
    // Navigate to fleet manager or open modal
  };

  /**
   * Handle research
   */
  const handleResearch = () => {
    console.log('Open research');
    // Navigate to research screen
  };

  /**
   * Handle diplomacy
   */
  const handleDiplomacy = () => {
    console.log('Open diplomacy');
    // Navigate to diplomacy screen
  };

  /**
   * Handle messages
   */
  const handleMessages = () => {
    console.log('Open messages');
    setUnreadMessages(0);
    // Navigate to messages or open modal
  };

  /**
   * Handle logout
   */
  const handleLogout = () => {
    if (confirm('Are you sure you want to logout?')) {
      console.log('Logout');
      // Clear session and redirect
    }
  };

  /**
   * Handle planet select from minimap
   */
  const handlePlanetSelect = (planetId: string) => {
    console.log('Selected planet:', planetId);
    // Center map on planet or open planet view
  };

  return (
    <div style={{ position: 'relative', width: '100vw', height: '100vh', background: '#000' }}>
      {/* Game content goes here */}
      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center', 
        height: '100%',
        color: '#fff'
      }}>
        <h1>Game Content Area</h1>
      </div>

      {/* HUD Overlay */}
      <GameHUD
        resources={resources}
        income={income}
        unreadMessages={unreadMessages}
        alliance={alliance}
        planets={planets}
        gameSpeed={gameSpeed}
        currentTime={currentTime}
        onSpeedChange={setGameSpeed}
        onFleetManager={handleFleetManager}
        onResearch={handleResearch}
        onDiplomacy={handleDiplomacy}
        onMessages={handleMessages}
        onLogout={handleLogout}
        onPlanetSelect={handlePlanetSelect}
      />
    </div>
  );
};

export default GameHUDPage;
