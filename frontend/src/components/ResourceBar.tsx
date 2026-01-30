/**
 * Resource Bar Component
 * 
 * Displays current resources and income rates
 */

import React from 'react';
import type { ResourceData, IncomeData } from './GameHUD';
import './ResourceBar.css';

/**
 * Resource Bar Props
 */
interface ResourceBarProps {
  resources: ResourceData;
  income: IncomeData;
}

/**
 * Resource Bar Component
 */
export const ResourceBar: React.FC<ResourceBarProps> = ({ resources, income }) => {
  /**
   * Format large numbers
   */
  const formatNumber = (num: number): string => {
    if (num >= 1000000) {
      return `${(num / 1000000).toFixed(1)}M`;
    }
    if (num >= 1000) {
      return `${(num / 1000).toFixed(1)}K`;
    }
    return Math.floor(num).toString();
  };

  /**
   * Get storage percentage
   */
  const getStoragePercent = (current: number, max: number): number => {
    return Math.min(100, (current / max) * 100);
  };

  /**
   * Get storage color based on percentage
   */
  const getStorageColor = (percent: number): string => {
    if (percent >= 90) return '#ef4444'; // Red
    if (percent >= 70) return '#f59e0b'; // Orange
    return '#22c55e'; // Green
  };

  return (
    <div className="resource-bar">
      {/* Minerals */}
      <div className="resource-item">
        <div className="resource-icon minerals">ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬Ãƒâ€šÃ‚ÂºÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚ÂÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¯ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¸ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â</div>
        <div className="resource-info">
          <div className="resource-amount">
            {formatNumber(resources.minerals)}
            <span className="resource-max">/{formatNumber(resources.storage.minerals)}</span>
          </div>
          <div className="resource-income">
            +{formatNumber(income.minerals)}/h
          </div>
          <div
            className="resource-storage-bar"
            style={{
              background: `linear-gradient(to right, ${getStorageColor(
                getStoragePercent(resources.minerals, resources.storage.minerals)
              )} ${getStoragePercent(resources.minerals, resources.storage.minerals)}%, rgba(0,0,0,0.3) 0%)`
            }}
          />
        </div>
      </div>

      {/* Energy */}
      <div className="resource-item">
        <div className="resource-icon energy">ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã¢â‚¬Â¦Ãƒâ€šÃ‚Â¡ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¡</div>
        <div className="resource-info">
          <div className="resource-amount">
            {formatNumber(resources.energy)}
            <span className="resource-max">/{formatNumber(resources.storage.energy)}</span>
          </div>
          <div className="resource-income">
            +{formatNumber(income.energy)}/h
          </div>
          <div
            className="resource-storage-bar"
            style={{
              background: `linear-gradient(to right, ${getStorageColor(
                getStoragePercent(resources.energy, resources.storage.energy)
              )} ${getStoragePercent(resources.energy, resources.storage.energy)}%, rgba(0,0,0,0.3) 0%)`
            }}
          />
        </div>
      </div>

      {/* Credits */}
      <div className="resource-item">
        <div className="resource-icon credits">ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â°ÃƒÆ’Ã¢â‚¬Â¦Ãƒâ€šÃ‚Â¸ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ÃƒÂ¢Ã¢â‚¬Å¾Ã‚Â¢ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â°</div>
        <div className="resource-info">
          <div className="resource-amount">
            {formatNumber(resources.credits)}
            <span className="resource-max">/{formatNumber(resources.storage.credits)}</span>
          </div>
          <div className="resource-income">
            +{formatNumber(income.credits)}/h
          </div>
          <div
            className="resource-storage-bar"
            style={{
              background: `linear-gradient(to right, ${getStorageColor(
                getStoragePercent(resources.credits, resources.storage.credits)
              )} ${getStoragePercent(resources.credits, resources.storage.credits)}%, rgba(0,0,0,0.3) 0%)`
            }}
          />
        </div>
      </div>

      {/* Population */}
      <div className="resource-item">
        <div className="resource-icon population">ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â°ÃƒÆ’Ã¢â‚¬Â¦Ãƒâ€šÃ‚Â¸ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬Ãƒâ€¹Ã…â€œÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¥</div>
        <div className="resource-info">
          <div className="resource-amount">
            {formatNumber(resources.population)}
          </div>
          <div className="resource-label">Population</div>
        </div>
      </div>
    </div>
  );
};

export default ResourceBar;
