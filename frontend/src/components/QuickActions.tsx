/**
 * Quick Actions Component
 * 
 * Quick access buttons for common game actions
 */

import React from 'react';
import { NotificationBadge } from './NotificationBadge';
import './QuickActions.css';

/**
 * Quick Actions Props
 */
interface QuickActionsProps {
  onFleetManager: () => void;
  onResearch: () => void;
  onDiplomacy: () => void;
  onMessages: () => void;
  unreadMessages: number;
}

/**
 * Quick Actions Component
 */
export const QuickActions: React.FC<QuickActionsProps> = ({
  onFleetManager,
  onResearch,
  onDiplomacy,
  onMessages,
  unreadMessages
}) => {
  return (
    <div className="quick-actions">
      <button
        className="quick-action-btn"
        onClick={onFleetManager}
        title="Fleet Manager (F)"
      >
        <span className="action-icon">ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â°ÃƒÆ’Ã¢â‚¬Â¦Ãƒâ€šÃ‚Â¸ÃƒÆ’Ã¢â‚¬Â¦Ãƒâ€šÃ‚Â¡ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡Ãƒâ€šÃ‚Â¬</span>
        <span className="action-label">Fleet</span>
      </button>

      <button
        className="quick-action-btn"
        onClick={onResearch}
        title="Research (R)"
      >
        <span className="action-icon">ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â°ÃƒÆ’Ã¢â‚¬Â¦Ãƒâ€šÃ‚Â¸ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬Ãƒâ€šÃ‚ÂÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¬</span>
        <span className="action-label">Research</span>
      </button>

      <button
        className="quick-action-btn"
        onClick={onDiplomacy}
        title="Diplomacy (D)"
      >
        <span className="action-icon">ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â°ÃƒÆ’Ã¢â‚¬Â¦Ãƒâ€šÃ‚Â¸ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¤ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â</span>
        <span className="action-label">Diplomacy</span>
      </button>

      <button
        className="quick-action-btn messages-btn"
        onClick={onMessages}
        title="Messages (M)"
      >
        <span className="action-icon">ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â°ÃƒÆ’Ã¢â‚¬Â¦Ãƒâ€šÃ‚Â¸ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ÃƒÂ¢Ã¢â‚¬Å¾Ã‚Â¢ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¬</span>
        <span className="action-label">Messages</span>
        {unreadMessages > 0 && <NotificationBadge count={unreadMessages} />}
      </button>
    </div>
  );
};

export default QuickActions;
