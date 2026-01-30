/**
 * Socket Connection Indicator Component
 * 
 * Visual indicator for socket connection status
 */

import React from 'react';
import type { ConnectionStatus } from '@/hooks/useSocket';
import './ConnectionIndicator.css';

/**
 * Connection Indicator Props
 */
interface ConnectionIndicatorProps {
  status: ConnectionStatus;
  error?: Error | null;
  showLabel?: boolean;
  className?: string;
}

/**
 * Connection Indicator Component
 */
export const ConnectionIndicator: React.FC<ConnectionIndicatorProps> = ({
  status,
  error,
  showLabel = true,
  className = ''
}) => {
  const getStatusColor = (): string => {
    switch (status) {
      case 'connected':
        return '#22c55e';
      case 'connecting':
        return '#fbbf24';
      case 'disconnected':
        return '#6b7280';
      case 'error':
        return '#ef4444';
      default:
        return '#6b7280';
    }
  };

  const getStatusLabel = (): string => {
    switch (status) {
      case 'connected':
        return 'Connected';
      case 'connecting':
        return 'Connecting...';
      case 'disconnected':
        return 'Disconnected';
      case 'error':
        return 'Connection Error';
      default:
        return 'Unknown';
    }
  };

  const getStatusIcon = (): string => {
    switch (status) {
      case 'connected':
        return 'ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ÃƒÂ¢Ã¢â€šÂ¬Ã‚ÂÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â';
      case 'connecting':
        return 'ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ÃƒÂ¢Ã¢â€šÂ¬Ã‚ÂÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â';
      case 'disconnected':
        return 'ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ÃƒÂ¢Ã¢â€šÂ¬Ã‚ÂÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬Ãƒâ€šÃ‚Â¹';
      case 'error':
        return 'ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã¢â‚¬Â¦ÃƒÂ¢Ã¢â€šÂ¬Ã…â€œÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬Ãƒâ€šÃ‚Â¢';
      default:
        return 'ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ÃƒÂ¢Ã¢â€šÂ¬Ã‚ÂÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬Ãƒâ€šÃ‚Â¹';
    }
  };

  return (
    <div className={`connection-indicator ${className}`} title={error?.message}>
      <div
        className={`status-icon ${status}`}
        style={{ color: getStatusColor() }}
      >
        {getStatusIcon()}
      </div>
      {showLabel && (
        <span className="status-label" style={{ color: getStatusColor() }}>
          {getStatusLabel()}
        </span>
      )}
      {error && (
        <div className="error-tooltip">
          {error.message}
        </div>
      )}
    </div>
  );
};

export default ConnectionIndicator;
