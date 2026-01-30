/**
 * Planet Details Modal Component
 * 
 * Displays detailed information about a planet and allows colonization
 */

import { useState } from 'react';
import type { Planet } from '@shared/types/game';
import './PlanetDetailsModal.css';

interface Props {
  planet: Planet | null;
  onClose: () => void;
  onColonize?: (planetId: string) => void;
  canColonize?: boolean;
}

export default function PlanetDetailsModal({ 
  planet, 
  onClose, 
  onColonize,
  canColonize = false 
}: Props) {
  const [isColonizing, setIsColonizing] = useState(false);

  if (!planet) return null;

  const handleColonize = async () => {
    if (onColonize && planet.id) {
      setIsColonizing(true);
      try {
        await onColonize(planet.id);
      } finally {
        setIsColonizing(false);
      }
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>×</button>
        
        <h2>{planet.name}</h2>
        
        <div className="planet-stats">
          <div className="stat">
            <label>Size:</label>
            <span>{planet.size}/5</span>
          </div>
          
          <div className="stat">
            <label>Population:</label>
            <span>{planet.population || 0} / {planet.maxPopulation || 1000}</span>
          </div>
          
          <div className="stat">
            <label>Owner:</label>
            <span>{planet.ownerId || 'None'}</span>
          </div>
        </div>

        <div className="planet-resources">
          <h3>Resources</h3>
          <div className="resource-grid">
            <div>💎 Minerals: {planet.resources?.minerals || 0}</div>
            <div>⚡ Energy: {planet.resources?.energy || 0}</div>
          </div>
        </div>

        <div className="planet-production">
          <h3>Production</h3>
          <div className="production-grid">
            <div>+{planet.production?.minerals || 0} Minerals/h</div>
            <div>+{planet.production?.energy || 0} Energy/h</div>
            <div>+{planet.production?.credits || 0} Credits/h</div>
          </div>
        </div>

        {canColonize && !planet.ownerId && (
          <div className="colonization-section">
            <div className="colonization-cost">
              <h4>Colonization Cost:</h4>
              <div className="cost-grid">
                <div>💎 500 Minerals</div>
                <div>⚡ 300 Energy</div>
                <div>💰 1000 Credits</div>
              </div>
            </div>
            <button 
              className="btn-colonize" 
              onClick={handleColonize}
              disabled={isColonizing}
            >
              {isColonizing ? '🚀 Colonizing...' : '🪐 Colonize Planet'}
            </button>
          </div>
        )}

        {planet.ownerId && (
          <div className="planet-actions">
            <button className="btn-manage">🏗️ Manage Buildings</button>
            <button className="btn-ships">🚀 Build Ships</button>
          </div>
        )}
      </div>
    </div>
  );
}
