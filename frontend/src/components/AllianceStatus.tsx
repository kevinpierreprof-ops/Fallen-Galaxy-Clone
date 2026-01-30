/**
 * Alliance Status Component
 * 
 * Displays alliance information in HUD
 */

import React from 'react';
import type { Alliance } from '@shared/types/alliance';
import './AllianceStatus.css';

/**
 * Alliance Status Props
 */
interface AllianceStatusProps {
  alliance: Alliance;
  onViewDetails: () => void;
}

/**
 * Alliance Status Component
 */
export const AllianceStatus: React.FC<AllianceStatusProps> = ({
  alliance,
  onViewDetails
}) => {
  return (
    <button className="alliance-status" onClick={onViewDetails} title="View Alliance">
      <div className="alliance-icon">
        <span className="alliance-tag">[{alliance.tag}]</span>
      </div>
      <div className="alliance-info">
        <div className="alliance-name">{alliance.name}</div>
        <div className="alliance-members">
          {alliance.members.length}/{alliance.maxMembers} members
        </div>
      </div>
    </button>
  );
};

export default AllianceStatus;
