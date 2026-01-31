/**
 * Building Construction Panel Component
 * 
 * UI for constructing and managing buildings on a planet
 */

import { useState } from 'react';
import type { Planet } from '@shared/types/game';
import { BuildingType } from '@shared/types/buildingSystem';
import {
  BASE_BUILDING_COSTS,
  BASE_BUILD_TIMES,
  BASE_PRODUCTION,
  MAX_BUILDING_LEVELS,
} from '@shared/constants/buildingSystem';
import './BuildingConstructionPanel.css';

interface Props {
  planet: Planet;
  onBuild?: (buildingType: BuildingType) => void;
  constructionQueue?: any[];
}

// Building display information
const BUILDING_INFO: Record<BuildingType, { name: string; description: string; icon: string }> = {
  [BuildingType.MetalMine]: {
    name: 'Metal Mine',
    description: 'Extracts metal from the planet',
    icon: '⛏️',
  },
  [BuildingType.EnergyPlant]: {
    name: 'Energy Plant',
    description: 'Generates energy from solar power',
    icon: '⚡',
  },
  [BuildingType.CrystalMine]: {
    name: 'Crystal Mine',
    description: 'Harvests rare crystals',
    icon: '💎',
  },
  [BuildingType.Shipyard]: {
    name: 'Shipyard',
    description: 'Constructs and repairs ships',
    icon: '🚀',
  },
  [BuildingType.ResearchLab]: {
    name: 'Research Lab',
    description: 'Advances technology research',
    icon: '🔬',
  },
  [BuildingType.Defense]: {
    name: 'Defense System',
    description: 'Protects the planet',
    icon: '🛡️',
  },
  [BuildingType.CommandCenter]: {
    name: 'Command Center',
    description: 'Coordinates planet operations',
    icon: '🏛️',
  },
  [BuildingType.Storage]: {
    name: 'Storage Facility',
    description: 'Stores resources',
    icon: '📦',
  },
};

export default function BuildingConstructionPanel({ planet, onBuild, constructionQueue = [] }: Props) {
  const [selectedBuilding, setSelectedBuilding] = useState<BuildingType | null>(null);

  // Get current building level on this planet
  const getBuildingLevel = (type: BuildingType): number => {
    const building = planet.buildings?.find((b) => b.type === type);
    return building?.level || 0;
  };

  // Check if building can be built/upgraded
  const canBuild = (type: BuildingType): boolean => {
    const currentLevel = getBuildingLevel(type);
    const maxLevel = MAX_BUILDING_LEVELS[type];
    return currentLevel < maxLevel;
  };

  const handleBuild = (type: BuildingType) => {
    if (onBuild && canBuild(type)) {
      onBuild(type);
    }
  };

  const formatProduction = (production: any): string[] => {
    const items: string[] = [];
    if (production.metal) items.push(`+${production.metal} Metal/h`);
    if (production.energy) {
      const sign = production.energy > 0 ? '+' : '';
      items.push(`${sign}${production.energy} Energy/h`);
    }
    if (production.crystal) items.push(`+${production.crystal} Crystal/h`);
    if (production.research) items.push(`+${production.research} Research/h`);
    if (production.defense) items.push(`+${production.defense} Defense`);
    if (production.storage) items.push(`+${production.storage} Storage`);
    return items;
  };

  const formatTime = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    if (minutes > 0) {
      return `${minutes}m ${secs}s`;
    }
    return `${secs}s`;
  };

  return (
    <div className="building-construction-panel">
      <h3>🏗️ Building Construction</h3>

      {/* Construction Queue */}
      {constructionQueue.length > 0 && (
        <div className="construction-queue">
          <h4>Construction Queue</h4>
          {constructionQueue.map((item, index) => (
            <div key={index} className="queue-item">
              <span>{BUILDING_INFO[item.type as BuildingType]?.icon || '🏗️'}</span>
              <span>{BUILDING_INFO[item.type as BuildingType]?.name || item.type}</span>
              <div className="progress-bar">
                <div
                  className="progress-fill"
                  style={{
                    width: `${item.progress || 0}%`,
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Available Buildings */}
      <div className="buildings-grid">
        {Object.values(BuildingType).map((type) => {
          const info = BUILDING_INFO[type];
          const cost = BASE_BUILDING_COSTS[type];
          const buildTime = BASE_BUILD_TIMES[type];
          const production = BASE_PRODUCTION[type];
          const currentLevel = getBuildingLevel(type);
          const maxLevel = MAX_BUILDING_LEVELS[type];
          const buildable = canBuild(type);

          return (
            <div
              key={type}
              className={`building-card ${!buildable ? 'disabled' : ''} ${
                selectedBuilding === type ? 'selected' : ''
              }`}
              onClick={() => setSelectedBuilding(type)}
            >
              <div className="building-icon">{info.icon}</div>
              <div className="building-header">
                <h4>{info.name}</h4>
                <span className="building-level">
                  Level {currentLevel}/{maxLevel}
                </span>
              </div>
              <p className="building-description">{info.description}</p>

              <div className="building-cost">
                <div className="cost-item">
                  <span>⛏️</span>
                  <span>{cost.metal}</span>
                </div>
                <div className="cost-item">
                  <span>⚡</span>
                  <span>{cost.energy}</span>
                </div>
                <div className="cost-item">
                  <span>💎</span>
                  <span>{cost.crystal}</span>
                </div>
              </div>

              <div className="building-stats">
                <div className="stat-item">
                  <span>⏱️ Build Time:</span>
                  <span>{formatTime(buildTime)}</span>
                </div>
                {formatProduction(production).map((prod, idx) => (
                  <div key={idx} className="stat-item production">
                    <span>{prod}</span>
                  </div>
                ))}
              </div>

              <button
                className="btn-build"
                onClick={(e) => {
                  e.stopPropagation();
                  handleBuild(type);
                }}
                disabled={!buildable}
              >
                {currentLevel === 0 ? 'Build' : 'Upgrade'} {buildable ? '' : '(Max Level)'}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
