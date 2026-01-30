/**
 * App with Socket Context - Integration Example
 */

import React from 'react';
import { SocketProvider } from '@/context/SocketContext';
import { GameWithSocket } from '@/examples/SocketExamples';

/**
 * App Component with Socket Provider
 */
function App() {
  return (
    <SocketProvider url="http://localhost:3000" autoConnect={true}>
      <GameWithSocket />
    </SocketProvider>
  );
}

export default App;
