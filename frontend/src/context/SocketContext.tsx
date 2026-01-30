/**
 * Socket Context Provider
 * 
 * React context for sharing socket instance across components
 */

import React, { createContext, useContext, ReactNode } from 'react';
import { useSocket, UseSocketReturn } from '@/hooks/useSocket';

/**
 * Socket Context
 */
const SocketContext = createContext<UseSocketReturn | null>(null);

/**
 * Socket Provider Props
 */
interface SocketProviderProps {
  children: ReactNode;
  url?: string;
  autoConnect?: boolean;
}

/**
 * Socket Provider Component
 * 
 * Wraps app to provide socket instance to all child components
 */
export const SocketProvider: React.FC<SocketProviderProps> = ({
  children,
  url,
  autoConnect = true
}) => {
  const socket = useSocket({ url, autoConnect });

  return (
    <SocketContext.Provider value={socket}>
      {children}
    </SocketContext.Provider>
  );
};

/**
 * useSocketContext Hook
 * 
 * Access socket instance from context
 */
export function useSocketContext(): UseSocketReturn {
  const context = useContext(SocketContext);
  
  if (!context) {
    throw new Error('useSocketContext must be used within SocketProvider');
  }
  
  return context;
}

export default SocketProvider;
