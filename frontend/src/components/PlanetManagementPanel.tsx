/**
 * Planet Management Panel Component
 * 
 * Comprehensive UI for managing a single planet
 */

import React, { useState, useEffect, useCallback } from 'react';
import type { Planet } from '@shared/types/galaxyMap';
import type { Building } from '@shared/types/buildings';
import type { Ship, ShipType } from '@shared/types/ships';
import type { ConstructionQueueItem } from '@shared/types/buildingSystem';
import './PlanetManagementPanel.css';

/**
 * Props interface
 */
interface PlanetManagementPanelProps {
  planet: Planet;
  onBuildBuilding?: (buildingType: string) => void;
  onUpgradeBuilding?: (buildingId: string) => void;
  onConstructShip?: (shipType: ShipType) => void;
  onCancelConstruction?: (queueItemId: string) => void;
  buildingQueue?: ConstructionQueueItem[];
  shipQueue?: ConstructionQueueItem[];
  canBuild?: (type: string, cost: ResourceCost) => boolean;
}

/**
 * Resource cost interface
 */
interface ResourceCost {
  minerals: number;
  energy: number;
  credits: number;
}

/**
 * Building type definition
 */
interface BuildingTypeDefinition {
  type: string;
  name: string;
  description: string;
  baseCost: ResourceCost;
  productionRate?: {
    minerals?: number;
    energy?: number;
    population?: number;
  };
  maxLevel: number;
  icon: string;
}

/**
 * Ship type definition
 */
interface ShipTypeDefinition {
  type: ShipType;
  name: string;
  description: string;
  cost: ResourceCost;
  buildTime: number;
  icon: string;
  stats: {
    attack: number;
    defense: number;
    speed: number;
    cargo: number;
  };
}

/**
 * Available building types
 */
const BUILDING_TYPES: BuildingTypeDefinition[] = [
  {
    type: 'mine',
    name: 'Mineral Mine',
    description: 'Extracts minerals from the planet',
    baseCost: { minerals: 100, energy: 50, credits: 25 },
    productionRate: { minerals: 10 },
    maxLevel: 20,
    icon: 'ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬Ãƒâ€šÃ‚ÂºÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚ÂÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¯ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¸ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â'
  },
  {
    type: 'solar_plant',
    name: 'Solar Power Plant',
    description: 'Generates energy from the star',
    baseCost: { minerals: 75, energy: 25, credits: 20 },
    productionRate: { energy: 15 },
    maxLevel: 20,
    icon: 'ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã¢â‚¬Â¹Ãƒâ€¦Ã¢â‚¬Å“ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡Ãƒâ€šÃ‚Â¬ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¯ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¸ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â'
  },
  {
    type: 'habitat',
    name: 'Habitat',
    description: 'Houses population',
    baseCost: { minerals: 50, energy: 30, credits: 40 },
    productionRate: { population: 100 },
    maxLevel: 15,
    icon: 'ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â°ÃƒÆ’Ã¢â‚¬Â¦Ãƒâ€šÃ‚Â¸ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚ÂÃƒÆ’Ã¢â‚¬Â¹Ãƒâ€¦Ã¢â‚¬Å“ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¯ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¸ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â'
  },
  {
    type: 'research_lab',
    name: 'Research Laboratory',
    description: 'Advances technology',
    baseCost: { minerals: 200, energy: 150, credits: 100 },
    maxLevel: 10,
    icon: 'ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â°ÃƒÆ’Ã¢â‚¬Â¦Ãƒâ€šÃ‚Â¸ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬Ãƒâ€šÃ‚ÂÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¬'
  },
  {
    type: 'shipyard',
    name: 'Shipyard',
    description: 'Constructs ships faster',
    baseCost: { minerals: 300, energy: 200, credits: 150 },
    maxLevel: 10,
    icon: 'ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â°ÃƒÆ’Ã¢â‚¬Â¦Ãƒâ€šÃ‚Â¸ÃƒÆ’Ã¢â‚¬Â¦Ãƒâ€šÃ‚Â¡ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡Ãƒâ€šÃ‚Â¬'
  },
  {
    type: 'defense_platform',
    name: 'Defense Platform',
    description: 'Defends against attacks',
    baseCost: { minerals: 250, energy: 150, credits: 100 },
    maxLevel: 10,
    icon: 'ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â°ÃƒÆ’Ã¢â‚¬Â¦Ãƒâ€šÃ‚Â¸ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬Ãƒâ€šÃ‚ÂºÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¡ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¯ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¸ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â'
  }
];

/**
 * Available ship types
 */
const SHIP_TYPES: ShipTypeDefinition[] = [
  {
    type: 'fighter',
    name: 'Fighter',
    description: 'Fast attack ship',
    cost: { minerals: 50, energy: 30, credits: 20 },
    buildTime: 60,
    icon: 'ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã¢â‚¬Â¦ÃƒÂ¢Ã¢â€šÂ¬Ã…â€œÃƒÆ’Ã¢â‚¬Â¹ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¯ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¸ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â',
    stats: { attack: 40, defense: 15, speed: 200, cargo: 20 }
  },
  {
    type: 'cruiser',
    name: 'Cruiser',
    description: 'Balanced warship',
    cost: { minerals: 150, energy: 100, credits: 75 },
    buildTime: 180,
    icon: 'ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â°ÃƒÆ’Ã¢â‚¬Â¦Ãƒâ€šÃ‚Â¸ÃƒÆ’Ã¢â‚¬Â¦Ãƒâ€šÃ‚Â¡ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¢',
    stats: { attack: 80, defense: 60, speed: 120, cargo: 100 }
  },
  {
    type: 'battleship',
    name: 'Battleship',
    description: 'Heavy warship',
    cost: { minerals: 400, energy: 300, credits: 200 },
    buildTime: 300,
    icon: 'ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã¢â‚¬Â¦Ãƒâ€šÃ‚Â¡ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬Ãƒâ€¦Ã¢â‚¬Å“',
    stats: { attack: 150, defense: 120, speed: 80, cargo: 200 }
  },
  {
    type: 'transport',
    name: 'Transport',
    description: 'Large cargo ship',
    cost: { minerals: 100, energy: 50, credits: 40 },
    buildTime: 120,
    icon: 'ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â°ÃƒÆ’Ã¢â‚¬Â¦Ãƒâ€šÃ‚Â¸ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬Ãƒâ€¦Ã¢â‚¬Å“ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¦',
    stats: { attack: 10, defense: 20, speed: 90, cargo: 500 }
  },
  {
    type: 'explorer',
    name: 'Explorer',
    description: 'Scout ship',
    cost: { minerals: 80, energy: 60, credits: 50 },
    buildTime: 90,
    icon: 'ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â°ÃƒÆ’Ã¢â‚¬Â¦Ãƒâ€šÃ‚Â¸ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬Ãƒâ€šÃ‚ÂÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â­',
    stats: { attack: 20, defense: 25, speed: 150, cargo: 50 }
  }
];

/**
 * Planet Management Panel Component
 */
export const PlanetManagementPanel: React.FC<PlanetManagementPanelProps> = ({
  planet,
  onBuildBuilding,
  onUpgradeBuilding,
  onConstructShip,
  onCancelConstruction,
  buildingQueue = [],
  shipQueue = [],
  canBuild
}) => {
  const [activeTab, setActiveTab] = useState<'buildings' | 'ships' | 'queue'>('buildings');
  const [resources, setResources] = useState(planet.resources || {
    minerals: 0,
    energy: 0,
    crystal: 0
  });

  /**
   * Update resources every second
   */
  useEffect(() => {
    const interval = setInterval(() => {
      setResources(prev => {
        // Calculate production from buildings
        const production = calculateProduction();

        return {
          minerals: prev.minerals + production.minerals / 60,
          energy: prev.energy + production.energy / 60,
          crystal: prev.crystal + (production.crystal || 0) / 60
        };
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [planet.buildings]);

  /**
   * Calculate production rates from buildings
   */
  const calculateProduction = useCallback(() => {
    const production = { minerals: 0, energy: 0, crystal: 0 };

    planet.buildings?.forEach(building => {
      const buildingDef = BUILDING_TYPES.find(b => b.type === building.type);
      if (buildingDef?.productionRate) {
        if (buildingDef.productionRate.minerals) {
          production.minerals += buildingDef.productionRate.minerals * building.level;
        }
        if (buildingDef.productionRate.energy) {
          production.energy += buildingDef.productionRate.energy * building.level;
        }
      }
    });

    return production;
  }, [planet.buildings]);

  /**
   * Get building cost with level scaling
   */
  const getBuildingCost = (buildingDef: BuildingTypeDefinition, level: number): ResourceCost => {
    const multiplier = Math.pow(1.5, level);
    return {
      minerals: Math.floor(buildingDef.baseCost.minerals * multiplier),
      energy: Math.floor(buildingDef.baseCost.energy * multiplier),
      credits: Math.floor(buildingDef.baseCost.credits * multiplier)
    };
  };

  /**
   * Check if can afford
   */
  const canAfford = (cost: ResourceCost): boolean => {
    return (
      resources.minerals >= cost.minerals &&
      resources.energy >= cost.energy
    );
  };

  /**
   * Handle build building
   */
  const handleBuildBuilding = (buildingType: string) => {
    const buildingDef = BUILDING_TYPES.find(b => b.type === buildingType);
    if (!buildingDef) return;

    const existingBuilding = planet.buildings?.find(b => b.type === buildingType);
    const level = existingBuilding ? existingBuilding.level + 1 : 1;
    const cost = getBuildingCost(buildingDef, level);

    if (canAfford(cost) && onBuildBuilding) {
      onBuildBuilding(buildingType);
      setResources(prev => ({
        minerals: prev.minerals - cost.minerals,
        energy: prev.energy - cost.energy,
        crystal: prev.crystal
      }));
    }
  };

  /**
   * Handle construct ship
   */
  const handleConstructShip = (shipType: ShipType) => {
    const shipDef = SHIP_TYPES.find(s => s.type === shipType);
    if (!shipDef) return;

    if (canAfford(shipDef.cost) && onConstructShip) {
      onConstructShip(shipType);
      setResources(prev => ({
        minerals: prev.minerals - shipDef.cost.minerals,
        energy: prev.energy - shipDef.cost.energy,
        crystal: prev.crystal
      }));
    }
  };

  const production = calculateProduction();

  return (
    <div className="planet-management-panel">
      {/* Header */}
      <div className="panel-header">
        <div className="planet-info">
          <h2>{planet.name}</h2>
          <div className="planet-coords">
            Coordinates: ({planet.position.x}, {planet.position.y})
          </div>
          <div className="planet-type">Type: {planet.type}</div>
        </div>
      </div>

      {/* Resources Display */}
      <ResourceDisplay 
        resources={resources}
        production={production}
      />

      {/* Tabs */}
      <div className="panel-tabs">
        <button
          className={`tab-button ${activeTab === 'buildings' ? 'active' : ''}`}
          onClick={() => setActiveTab('buildings')}
        >
          Buildings ({planet.buildings?.length || 0})
        </button>
        <button
          className={`tab-button ${activeTab === 'ships' ? 'active' : ''}`}
          onClick={() => setActiveTab('ships')}
        >
          Ships
        </button>
        <button
          className={`tab-button ${activeTab === 'queue' ? 'active' : ''}`}
          onClick={() => setActiveTab('queue')}
        >
          Queue ({buildingQueue.length + shipQueue.length})
        </button>
      </div>

      {/* Tab Content */}
      <div className="panel-content">
        {activeTab === 'buildings' && (
          <BuildingsList
            planet={planet}
            buildingTypes={BUILDING_TYPES}
            onBuildBuilding={handleBuildBuilding}
            onUpgradeBuilding={onUpgradeBuilding}
            getBuildingCost={getBuildingCost}
            canAfford={canAfford}
          />
        )}

        {activeTab === 'ships' && (
          <ShipConstructionPanel
            shipTypes={SHIP_TYPES}
            onConstructShip={handleConstructShip}
            canAfford={canAfford}
          />
        )}

        {activeTab === 'queue' && (
          <ConstructionQueue
            buildingQueue={buildingQueue}
            shipQueue={shipQueue}
            onCancelConstruction={onCancelConstruction}
          />
        )}
      </div>
    </div>
  );
};

/**
 * Resource Display Component
 */
interface ResourceDisplayProps {
  resources: {
    minerals: number;
    energy: number;
    crystal: number;
  };
  production: {
    minerals: number;
    energy: number;
    crystal: number;
  };
}

const ResourceDisplay: React.FC<ResourceDisplayProps> = ({ resources, production }) => {
  return (
    <div className="resource-display">
      <div className="resource-item">
        <span className="resource-icon">ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬Ãƒâ€šÃ‚ÂºÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚ÂÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¯ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¸ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â</span>
        <div className="resource-details">
          <div className="resource-amount">{Math.floor(resources.minerals)}</div>
          <div className="resource-production">+{production.minerals}/min</div>
        </div>
      </div>

      <div className="resource-item">
        <span className="resource-icon">ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã¢â‚¬Â¦Ãƒâ€šÃ‚Â¡ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¡</span>
        <div className="resource-details">
          <div className="resource-amount">{Math.floor(resources.energy)}</div>
          <div className="resource-production">+{production.energy}/min</div>
        </div>
      </div>

      <div className="resource-item">
        <span className="resource-icon">ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â°ÃƒÆ’Ã¢â‚¬Â¦Ãƒâ€šÃ‚Â¸ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ÃƒÂ¢Ã¢â‚¬Å¾Ã‚Â¢ÃƒÆ’Ã¢â‚¬Â¦Ãƒâ€šÃ‚Â½</span>
        <div className="resource-details">
          <div className="resource-amount">{Math.floor(resources.crystal)}</div>
          <div className="resource-production">+{production.crystal}/min</div>
        </div>
      </div>
    </div>
  );
};

/**
 * Buildings List Component
 */
interface BuildingsListProps {
  planet: Planet;
  buildingTypes: BuildingTypeDefinition[];
  onBuildBuilding?: (type: string) => void;
  onUpgradeBuilding?: (id: string) => void;
  getBuildingCost: (def: BuildingTypeDefinition, level: number) => ResourceCost;
  canAfford: (cost: ResourceCost) => boolean;
}

const BuildingsList: React.FC<BuildingsListProps> = ({
  planet,
  buildingTypes,
  onBuildBuilding,
  onUpgradeBuilding,
  getBuildingCost,
  canAfford
}) => {
  return (
    <div className="buildings-list">
      {buildingTypes.map(buildingDef => {
        const existingBuilding = planet.buildings?.find(b => b.type === buildingDef.type);
        const level = existingBuilding?.level || 0;
        const nextLevel = level + 1;
        const cost = getBuildingCost(buildingDef, nextLevel);
        const canBuildThis = canAfford(cost) && nextLevel <= buildingDef.maxLevel;

        return (
          <div key={buildingDef.type} className="building-card">
            <div className="building-header">
              <span className="building-icon">{buildingDef.icon}</span>
              <div className="building-info">
                <h4>{buildingDef.name}</h4>
                <p className="building-description">{buildingDef.description}</p>
              </div>
            </div>

            {existingBuilding && (
              <div className="building-stats">
                <div className="building-level">Level {level}</div>
                {buildingDef.productionRate && (
                  <div className="building-production">
                    {buildingDef.productionRate.minerals && (
                      <span>ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬Ãƒâ€šÃ‚ÂºÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚ÂÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¯ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¸ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â +{buildingDef.productionRate.minerals * level}/min</span>
                    )}
                    {buildingDef.productionRate.energy && (
                      <span>ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã¢â‚¬Â¦Ãƒâ€šÃ‚Â¡ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¡ +{buildingDef.productionRate.energy * level}/min</span>
                    )}
                    {buildingDef.productionRate.population && (
                      <span>ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â°ÃƒÆ’Ã¢â‚¬Â¦Ãƒâ€šÃ‚Â¸ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬Ãƒâ€¹Ã…â€œÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¥ +{buildingDef.productionRate.population * level}</span>
                    )}
                  </div>
                )}
              </div>
            )}

            <div className="building-cost">
              <div className="cost-label">
                {existingBuilding ? `Upgrade to Level ${nextLevel}` : 'Build'}:
              </div>
              <div className="cost-items">
                <span className={cost.minerals > 0 ? 'cost-item' : 'cost-item disabled'}>
                  ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬Ãƒâ€šÃ‚ÂºÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚ÂÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¯ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¸ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â {cost.minerals}
                </span>
                <span className={cost.energy > 0 ? 'cost-item' : 'cost-item disabled'}>
                  ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã¢â‚¬Â¦Ãƒâ€šÃ‚Â¡ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¡ {cost.energy}
                </span>
                <span className={cost.credits > 0 ? 'cost-item' : 'cost-item disabled'}>
                  ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â°ÃƒÆ’Ã¢â‚¬Â¦Ãƒâ€šÃ‚Â¸ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ÃƒÂ¢Ã¢â‚¬Å¾Ã‚Â¢ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â° {cost.credits}
                </span>
              </div>
            </div>

            <button
              className={`build-button ${canBuildThis ? '' : 'disabled'}`}
              onClick={() => {
                if (existingBuilding && onUpgradeBuilding) {
                  onUpgradeBuilding(existingBuilding.id);
                } else if (onBuildBuilding) {
                  onBuildBuilding(buildingDef.type);
                }
              }}
              disabled={!canBuildThis}
            >
              {existingBuilding ? 'Upgrade' : 'Build'}
              {nextLevel > buildingDef.maxLevel && ' (Max Level)'}
            </button>
          </div>
        );
      })}
    </div>
  );
};

/**
 * Ship Construction Panel Component
 */
interface ShipConstructionPanelProps {
  shipTypes: ShipTypeDefinition[];
  onConstructShip?: (type: ShipType) => void;
  canAfford: (cost: ResourceCost) => boolean;
}

const ShipConstructionPanel: React.FC<ShipConstructionPanelProps> = ({
  shipTypes,
  onConstructShip,
  canAfford
}) => {
  return (
    <div className="ship-construction-panel">
      {shipTypes.map(shipDef => {
        const canBuild = canAfford(shipDef.cost);

        return (
          <div key={shipDef.type} className="ship-card">
            <div className="ship-header">
              <span className="ship-icon">{shipDef.icon}</span>
              <div className="ship-info">
                <h4>{shipDef.name}</h4>
                <p className="ship-description">{shipDef.description}</p>
              </div>
            </div>

            <div className="ship-stats">
              <div className="stat-item">
                <span className="stat-label">ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã¢â‚¬Â¦Ãƒâ€šÃ‚Â¡ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬Ãƒâ€šÃ‚ÂÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¯ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¸ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â Attack:</span>
                <span className="stat-value">{shipDef.stats.attack}</span>
              </div>
              <div className="stat-item">
                <span className="stat-label">ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â°ÃƒÆ’Ã¢â‚¬Â¦Ãƒâ€šÃ‚Â¸ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬Ãƒâ€šÃ‚ÂºÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¡ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¯ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¸ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â Defense:</span>
                <span className="stat-value">{shipDef.stats.defense}</span>
              </div>
              <div className="stat-item">
                <span className="stat-label">ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â°ÃƒÆ’Ã¢â‚¬Â¦Ãƒâ€šÃ‚Â¸ÃƒÆ’Ã¢â‚¬Â¦Ãƒâ€šÃ‚Â¡ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡Ãƒâ€šÃ‚Â¬ Speed:</span>
                <span className="stat-value">{shipDef.stats.speed}</span>
              </div>
              <div className="stat-item">
                <span className="stat-label">ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â°ÃƒÆ’Ã¢â‚¬Â¦Ãƒâ€šÃ‚Â¸ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬Ãƒâ€¦Ã¢â‚¬Å“ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¦ Cargo:</span>
                <span className="stat-value">{shipDef.stats.cargo}</span>
              </div>
            </div>

            <div className="ship-cost">
              <div className="cost-label">Cost:</div>
              <div className="cost-items">
                <span className="cost-item">ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬Ãƒâ€šÃ‚ÂºÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚ÂÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¯ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¸ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â {shipDef.cost.minerals}</span>
                <span className="cost-item">ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã¢â‚¬Â¦Ãƒâ€šÃ‚Â¡ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¡ {shipDef.cost.energy}</span>
                <span className="cost-item">ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â°ÃƒÆ’Ã¢â‚¬Â¦Ãƒâ€šÃ‚Â¸ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ÃƒÂ¢Ã¢â‚¬Å¾Ã‚Â¢ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â° {shipDef.cost.credits}</span>
              </div>
              <div className="build-time">ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚ÂÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â±ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¯ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¸ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â {shipDef.buildTime}s</div>
            </div>

            <button
              className={`construct-button ${canBuild ? '' : 'disabled'}`}
              onClick={() => onConstructShip && onConstructShip(shipDef.type)}
              disabled={!canBuild}
            >
              Construct {shipDef.name}
            </button>
          </div>
        );
      })}
    </div>
  );
};

/**
 * Construction Queue Component
 */
interface ConstructionQueueProps {
  buildingQueue: ConstructionQueueItem[];
  shipQueue: ConstructionQueueItem[];
  onCancelConstruction?: (id: string) => void;
}

const ConstructionQueue: React.FC<ConstructionQueueProps> = ({
  buildingQueue,
  shipQueue,
  onCancelConstruction
}) => {
  const [progress, setProgress] = useState<{ [key: string]: number }>({});

  useEffect(() => {
    const interval = setInterval(() => {
      const newProgress: { [key: string]: number } = {};

      [...buildingQueue, ...shipQueue].forEach(item => {
        const elapsed = Date.now() - item.startTime;
        const totalTime = item.completionTime - item.startTime;
        newProgress[item.id] = Math.min(100, (elapsed / totalTime) * 100);
      });

      setProgress(newProgress);
    }, 100);

    return () => clearInterval(interval);
  }, [buildingQueue, shipQueue]);

  if (buildingQueue.length === 0 && shipQueue.length === 0) {
    return (
      <div className="queue-empty">
        <p>No construction in progress</p>
      </div>
    );
  }

  return (
    <div className="construction-queue">
      {buildingQueue.length > 0 && (
        <div className="queue-section">
          <h3>Building Queue</h3>
          {buildingQueue.map((item, index) => (
            <QueueItem
              key={item.id}
              item={item}
              index={index}
              progress={progress[item.id] || 0}
              onCancel={onCancelConstruction}
            />
          ))}
        </div>
      )}

      {shipQueue.length > 0 && (
        <div className="queue-section">
          <h3>Ship Queue</h3>
          {shipQueue.map((item, index) => (
            <QueueItem
              key={item.id}
              item={item}
              index={index}
              progress={progress[item.id] || 0}
              onCancel={onCancelConstruction}
            />
          ))}
        </div>
      )}
    </div>
  );
};

/**
 * Queue Item Component
 */
interface QueueItemProps {
  item: ConstructionQueueItem;
  index: number;
  progress: number;
  onCancel?: (id: string) => void;
}

const QueueItem: React.FC<QueueItemProps> = ({ item, index, progress, onCancel }) => {
  const remainingTime = Math.max(0, item.completionTime - Date.now());
  const remainingSeconds = Math.floor(remainingTime / 1000);
  const minutes = Math.floor(remainingSeconds / 60);
  const seconds = remainingSeconds % 60;

  return (
    <div className="queue-item">
      <div className="queue-item-header">
        <span className="queue-position">#{index + 1}</span>
        <span className="queue-item-name">{item.type}</span>
        <span className="queue-time">
          {minutes}:{seconds.toString().padStart(2, '0')}
        </span>
      </div>

      <div className="progress-bar">
        <div 
          className="progress-fill" 
          style={{ width: `${progress}%` }}
        />
      </div>

      <button
        className="cancel-button"
        onClick={() => onCancel && onCancel(item.id)}
      >
        Cancel
      </button>
    </div>
  );
};

export default PlanetManagementPanel;
