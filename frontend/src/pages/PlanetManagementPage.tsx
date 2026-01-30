/**
 * Planet Management Page - Integration Example
 * 
 * Example of integrating PlanetManagementPanel with game state and API
 */

import React, { useState, useEffect } from 'react';
import { PlanetManagementPanel } from '@/components/PlanetManagementPanel';
import type { Planet } from '@shared/types/galaxyMap';
import type { ShipType } from '@shared/types/ships';
import type { ConstructionQueueItem } from '@shared/types/buildingSystem';

/**
 * Planet Management Page Component
 */
export const PlanetManagementPage: React.FC = () => {
  const [selectedPlanet, setSelectedPlanet] = useState<Planet | null>(null);
  const [buildingQueue, setBuildingQueue] = useState<ConstructionQueueItem[]>([]);
  const [shipQueue, setShipQueue] = useState<ConstructionQueueItem[]>([]);
  const [loading, setLoading] = useState(true);

  /**
   * Load planet data
   */
  useEffect(() => {
    const loadPlanetData = async () => {
      try {
        // Load planet from API
        const response = await fetch('/api/planets/my-planet');
        const data = await response.json();

        if (data.success) {
          setSelectedPlanet(data.planet);
        }

        // Load construction queues
        const queueResponse = await fetch('/api/planets/my-planet/queue');
        const queueData = await queueResponse.json();

        if (queueData.success) {
          setBuildingQueue(queueData.buildingQueue);
          setShipQueue(queueData.shipQueue);
        }

        setLoading(false);
      } catch (error) {
        console.error('Failed to load planet data:', error);
        setLoading(false);
      }
    };

    loadPlanetData();
  }, []);

  /**
   * Handle build building
   */
  const handleBuildBuilding = async (buildingType: string) => {
    try {
      const response = await fetch('/api/planets/my-planet/build', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ buildingType })
      });

      const data = await response.json();

      if (data.success) {
        // Update building queue
        setBuildingQueue(prev => [...prev, data.queueItem]);
        console.log('Building queued:', buildingType);
      } else {
        alert(data.message);
      }
    } catch (error) {
      console.error('Failed to build:', error);
      alert('Failed to start construction');
    }
  };

  /**
   * Handle upgrade building
   */
  const handleUpgradeBuilding = async (buildingId: string) => {
    try {
      const response = await fetch(`/api/planets/my-planet/buildings/${buildingId}/upgrade`, {
        method: 'POST'
      });

      const data = await response.json();

      if (data.success) {
        setBuildingQueue(prev => [...prev, data.queueItem]);
        console.log('Building upgrade queued:', buildingId);
      } else {
        alert(data.message);
      }
    } catch (error) {
      console.error('Failed to upgrade:', error);
      alert('Failed to start upgrade');
    }
  };

  /**
   * Handle construct ship
   */
  const handleConstructShip = async (shipType: ShipType) => {
    try {
      const response = await fetch('/api/planets/my-planet/ships/construct', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ shipType })
      });

      const data = await response.json();

      if (data.success) {
        setShipQueue(prev => [...prev, data.queueItem]);
        console.log('Ship construction queued:', shipType);
      } else {
        alert(data.message);
      }
    } catch (error) {
      console.error('Failed to construct ship:', error);
      alert('Failed to start ship construction');
    }
  };

  /**
   * Handle cancel construction
   */
  const handleCancelConstruction = async (queueItemId: string) => {
    try {
      const response = await fetch(`/api/planets/my-planet/queue/${queueItemId}`, {
        method: 'DELETE'
      });

      const data = await response.json();

      if (data.success) {
        // Remove from appropriate queue
        setBuildingQueue(prev => prev.filter(item => item.id !== queueItemId));
        setShipQueue(prev => prev.filter(item => item.id !== queueItemId));
        console.log('Construction cancelled:', queueItemId);
      } else {
        alert(data.message);
      }
    } catch (error) {
      console.error('Failed to cancel construction:', error);
      alert('Failed to cancel construction');
    }
  };

  /**
   * Check if can build
   */
  const canBuild = (type: string, cost: any): boolean => {
    if (!selectedPlanet?.resources) return false;

    return (
      selectedPlanet.resources.minerals >= cost.minerals &&
      selectedPlanet.resources.energy >= cost.energy
    );
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner" />
        <p>Loading planet data...</p>
      </div>
    );
  }

  if (!selectedPlanet) {
    return (
      <div className="error-container">
        <p>No planet selected</p>
      </div>
    );
  }

  return (
    <div className="planet-management-page">
      <PlanetManagementPanel
        planet={selectedPlanet}
        onBuildBuilding={handleBuildBuilding}
        onUpgradeBuilding={handleUpgradeBuilding}
        onConstructShip={handleConstructShip}
        onCancelConstruction={handleCancelConstruction}
        buildingQueue={buildingQueue}
        shipQueue={shipQueue}
        canBuild={canBuild}
      />
    </div>
  );
};

/**
 * Example with multiple planets
 */
export const MultiPlanetManagement: React.FC = () => {
  const [planets, setPlanets] = useState<Planet[]>([]);
  const [selectedPlanetId, setSelectedPlanetId] = useState<string | null>(null);

  useEffect(() => {
    // Load all player's planets
    fetch('/api/planets/my-planets')
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setPlanets(data.planets);
          if (data.planets.length > 0) {
            setSelectedPlanetId(data.planets[0].id);
          }
        }
      });
  }, []);

  const selectedPlanet = planets.find(p => p.id === selectedPlanetId);

  return (
    <div className="multi-planet-management">
      {/* Planet Selector */}
      <div className="planet-selector">
        <h3>Your Planets</h3>
        {planets.map(planet => (
          <button
            key={planet.id}
            className={`planet-button ${planet.id === selectedPlanetId ? 'active' : ''}`}
            onClick={() => setSelectedPlanetId(planet.id)}
          >
            {planet.name}
          </button>
        ))}
      </div>

      {/* Planet Management Panel */}
      {selectedPlanet && (
        <PlanetManagementPanel
          planet={selectedPlanet}
          // ... handlers
        />
      )}
    </div>
  );
};

/**
 * Example with Socket.IO real-time updates
 */
export const RealtimePlanetManagement: React.FC = () => {
  const [planet, setPlanet] = useState<Planet | null>(null);

  useEffect(() => {
    // Connect to Socket.IO
    const socket = io('http://localhost:3000');

    // Listen for planet updates
    socket.on('planet:updated', (updatedPlanet: Planet) => {
      setPlanet(updatedPlanet);
    });

    // Listen for queue updates
    socket.on('queue:updated', (queueData: any) => {
      // Update queues
    });

    // Listen for resource updates
    socket.on('resources:updated', (resources: any) => {
      setPlanet(prev => prev ? { ...prev, resources } : null);
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  if (!planet) {
    return <div>Loading...</div>;
  }

  return (
    <PlanetManagementPanel
      planet={planet}
      // ... handlers
    />
  );
};

export default PlanetManagementPage;
