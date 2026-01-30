/**
 * Notification Badge Component
 * 
 * Displays unread count badge
 */

import React from 'react';
import './NotificationBadge.css';

/**
 * Notification Badge Props
 */
interface NotificationBadgeProps {
  count: number;
  maxDisplay?: number;
}

/**
 * Notification Badge Component
 */
export const NotificationBadge: React.FC<NotificationBadgeProps> = ({
  count,
  maxDisplay = 99
}) => {
  if (count <= 0) return null;

  const displayCount = count > maxDisplay ? `${maxDisplay}+` : count.toString();

  return (
    <div className="notification-badge">
      {displayCount}
    </div>
  );
};

export default NotificationBadge;
