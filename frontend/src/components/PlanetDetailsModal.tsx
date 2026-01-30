import { useEffect } from 'react';
import { useGameStore } from '../store/gameStore';
import type { Planet } from '@shared/types/game';
import './PlanetDetailsModal.css';

interface PlanetDetailsModalProps {
  planet: Planet | null;
  onClose: () => void;
}

export default function PlanetDetailsModal({ planet, onClose }: PlanetDetailsModalProps) {
  const { player, colonizePlanet } = useGameStore();

  // Close modal on ESC key
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEsc);
    return () => document.removeEventListener('keydown', handleEsc);
  }, [onClose]);

  // Don't render if no planet selected
  if (!planet) return null;

  const isNeutral = planet.ownerId === null;
  const isOwnedByPlayer = player && planet.ownerId === player.id;

  // Colonization cost
  const colonizationCost = {
    minerals: 500,
    energy: 300,
    credits: 1000
  };

  // Check if player can afford colonization
  const canAfford = player && 
    player.resources.minerals >= colonizationCost.minerals &&
    player.resources.energy >= colonizationCost.energy &&
    player.resources.credits >= colonizationCost.credits;

  const handleColonize = () => {
    if (planet && canAfford) {
      colonizePlanet(planet.id);
      onClose();
    }
  };

  const handleManage = () => {
    // TODO: Open management panel for owned planets
    alert('Planet management coming soon!');
  };

  // Get size label
  const getSizeLabel = (size: number): string => {
    if (size <= 1) return 'Small';
    if (size <= 3) return 'Medium';
    return 'Large';
  };

  return (
    <div className="planet-modal-overlay" onClick={onClose}>
      <div className="planet-modal" onClick={(e) => e.stopPropagation()}>
        <div className="planet-modal-header">
          <h2>{planet.name}</h2>
          <button className="close-button" onClick={onClose} aria-label="Close">
            ×
          </button>
        </div>

        <div className="planet-modal-content">
          <div className="planet-info-section">
            <h3>Planet Information</h3>
            <div className="info-grid">
              <div className="info-item">
                <span className="info-label">Size:</span>
                <span className="info-value">{getSizeLabel(planet.size)}</span>
              </div>
              <div className="info-item">
                <span className="info-label">Position:</span>
                <span className="info-value">
                  ({planet.position.x.toFixed(0)}, {planet.position.y.toFixed(0)})
                </span>
              </div>
              <div className="info-item">
                <span className="info-label">Owner:</span>
                <span className="info-value">
                  {isNeutral ? 'Neutral' : planet.ownerId === player?.id ? 'You' : 'Other Player'}
                </span>
              </div>
              <div className="info-item">
                <span className="info-label">Population:</span>
                <span className="info-value">
                  {planet.population.toFixed(0)} / {planet.maxPopulation}
                </span>
              </div>
            </div>
          </div>

          <div className="planet-resources-section">
            <h3>Resources</h3>
            <div className="resources-grid">
              <div className="resource-item minerals">
                <span className="resource-icon">⛏️</span>
                <div className="resource-details">
                  <span className="resource-label">Minerals</span>
                  <span className="resource-value">{planet.resources.minerals.toFixed(0)}</span>
                </div>
              </div>
              <div className="resource-item energy">
                <span className="resource-icon">⚡</span>
                <div className="resource-details">
                  <span className="resource-label">Energy</span>
                  <span className="resource-value">{planet.resources.energy.toFixed(0)}</span>
                </div>
              </div>
              <div className="resource-item credits">
                <span className="resource-icon">💰</span>
                <div className="resource-details">
                  <span className="resource-label">Credits</span>
                  <span className="resource-value">{planet.resources.credits.toFixed(0)}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="planet-production-section">
            <h3>Production Rates</h3>
            <div className="production-grid">
              <div className="production-item">
                <span className="production-icon">⛏️</span>
                <span className="production-label">Minerals:</span>
                <span className="production-value">+{planet.production.minerals}/s</span>
              </div>
              <div className="production-item">
                <span className="production-icon">⚡</span>
                <span className="production-label">Energy:</span>
                <span className="production-value">+{planet.production.energy}/s</span>
              </div>
              <div className="production-item">
                <span className="production-icon">💰</span>
                <span className="production-label">Credits:</span>
                <span className="production-value">+{planet.production.credits}/s</span>
              </div>
            </div>
          </div>

          <div className="planet-actions">
            {isNeutral && (
              <div className="colonize-section">
                <h3>Colonization</h3>
                <div className="colonization-cost">
                  <p>Required Resources:</p>
                  <div className="cost-grid">
                    <span className="cost-item">
                      ⛏️ {colonizationCost.minerals} Minerals
                    </span>
                    <span className="cost-item">
                      ⚡ {colonizationCost.energy} Energy
                    </span>
                    <span className="cost-item">
                      💰 {colonizationCost.credits} Credits
                    </span>
                  </div>
                </div>
                <button
                  className="colonize-button"
                  onClick={handleColonize}
                  disabled={!canAfford}
                  title={!canAfford ? 'Insufficient resources' : 'Colonize this planet'}
                >
                  {canAfford ? 'Colonize Planet' : 'Insufficient Resources'}
                </button>
              </div>
            )}

            {isOwnedByPlayer && (
              <button className="manage-button" onClick={handleManage}>
                Manage Planet
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
