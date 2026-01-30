/**
 * Ship Movement Client Integration
 * 
 * Client-side code for ship movement with Socket.IO
 */

import { io, Socket } from 'socket.io-client';

/**
 * Ship Movement Event Handlers
 */
interface ShipMovementHandlers {
  onShipMoving?: (data: any) => void;
  onShipArrived?: (data: any) => void;
  onMovementCancelled?: (data: any) => void;
  onCombatRequired?: (data: any) => void;
  onNotification?: (data: any) => void;
}

/**
 * Ship Movement Client
 * 
 * Handles ship movement operations on the client side
 */
export class ShipMovementClient {
  private socket: Socket;
  private handlers: ShipMovementHandlers;

  constructor(socket: Socket, handlers: ShipMovementHandlers = {}) {
    this.socket = socket;
    this.handlers = handlers;
    this.setupListeners();
  }

  /**
   * Setup event listeners
   */
  private setupListeners(): void {
    // Ship started moving
    this.socket.on('ship:moving', (data) => {
      console.log('Ship moving:', data);
      if (this.handlers.onShipMoving) {
        this.handlers.onShipMoving(data);
      }
    });

    // Ship arrived at destination
    this.socket.on('ship:arrived', (data) => {
      console.log('Ship arrived:', data);
      if (this.handlers.onShipArrived) {
        this.handlers.onShipArrived(data);
      }
    });

    // Movement cancelled
    this.socket.on('ship:movement:cancelled', (data) => {
      console.log('Movement cancelled:', data);
      if (this.handlers.onMovementCancelled) {
        this.handlers.onMovementCancelled(data);
      }
    });

    // Combat required
    this.socket.on('ship:combat_required', (data) => {
      console.log('Combat required:', data);
      if (this.handlers.onCombatRequired) {
        this.handlers.onCombatRequired(data);
      }
    });

    // Personal notifications
    this.socket.on('notification', (data) => {
      console.log('Notification:', data);
      if (this.handlers.onNotification) {
        this.handlers.onNotification(data);
      }
    });

    // Movement started (personal)
    this.socket.on('ship:movement:started', (data) => {
      console.log('Your ship started moving:', data);
    });
  }

  /**
   * Move ship to destination
   * 
   * @param shipId - Ship ID
   * @param destinationPlanetId - Destination planet ID
   * @param allowCombat - Allow movement to enemy planets
   * @returns Promise with result
   */
  public async moveShip(
    shipId: string,
    destinationPlanetId: string,
    allowCombat: boolean = false
  ): Promise<any> {
    return new Promise((resolve, reject) => {
      this.socket.emit(
        'ship:move',
        { shipId, destinationPlanetId, allowCombat },
        (response: any) => {
          if (response.success) {
            resolve(response);
          } else {
            reject(new Error(response.message));
          }
        }
      );
    });
  }

  /**
   * Cancel ship movement
   * 
   * @param shipId - Ship ID
   * @returns Promise with result
   */
  public async cancelMovement(shipId: string): Promise<any> {
    return new Promise((resolve, reject) => {
      this.socket.emit(
        'ship:cancel_movement',
        { shipId },
        (response: any) => {
          if (response.success) {
            resolve(response);
          } else {
            reject(new Error(response.message));
          }
        }
      );
    });
  }

  /**
   * Get active movements for player
   * 
   * @returns Promise with movements array
   */
  public async getMovements(): Promise<any[]> {
    return new Promise((resolve, reject) => {
      this.socket.emit('ship:get_movements', (response: any) => {
        if (response.success) {
          resolve(response.movements);
        } else {
          reject(new Error(response.message));
        }
      });
    });
  }

  /**
   * Get arrival time for ship
   * 
   * @param shipId - Ship ID
   * @returns Promise with arrival time
   */
  public async getArrivalTime(shipId: string): Promise<{
    arrivalTime: number | null;
    remainingTime: number;
  }> {
    return new Promise((resolve, reject) => {
      this.socket.emit(
        'ship:get_arrival_time',
        { shipId },
        (response: any) => {
          if (response.success) {
            resolve({
              arrivalTime: response.arrivalTime,
              remainingTime: response.remainingTime
            });
          } else {
            reject(new Error(response.message));
          }
        }
      );
    });
  }

  /**
   * Check for collision at destination
   * 
   * @param planetId - Planet ID
   * @returns Promise with collision status
   */
  public async checkCollision(planetId: string): Promise<boolean> {
    return new Promise((resolve, reject) => {
      this.socket.emit(
        'ship:check_collision',
        { planetId },
        (response: any) => {
          if (response.success) {
            resolve(response.collision);
          } else {
            reject(new Error(response.message));
          }
        }
      );
    });
  }

  /**
   * Subscribe to ship movement updates
   */
  public subscribeToMovements(): void {
    this.socket.emit('ship:subscribe_movements');
  }

  /**
   * Unsubscribe from ship movement updates
   */
  public unsubscribeFromMovements(): void {
    this.socket.emit('ship:unsubscribe_movements');
  }

  /**
   * Cleanup listeners
   */
  public destroy(): void {
    this.socket.off('ship:moving');
    this.socket.off('ship:arrived');
    this.socket.off('ship:movement:cancelled');
    this.socket.off('ship:combat_required');
    this.socket.off('notification');
    this.socket.off('ship:movement:started');
  }
}

/**
 * Example usage in React component
 */
export function useShipMovement() {
  const socket = io('http://localhost:3000', {
    auth: { token: localStorage.getItem('token') }
  });

  const shipMovement = new ShipMovementClient(socket, {
    onShipMoving: (data) => {
      console.log(`Ship ${data.shipName} is moving to ${data.destinationName}`);
      // Update UI - show ship in transit
    },

    onShipArrived: (data) => {
      console.log(`Ship ${data.shipName} arrived at ${data.planetName}`);
      // Update UI - show ship at destination
      // Play notification sound
    },

    onMovementCancelled: (data) => {
      console.log(`Movement cancelled for ship ${data.shipName}`);
      // Update UI
    },

    onCombatRequired: (data) => {
      console.log('Combat required!');
      // Show combat confirmation dialog
      const confirmed = window.confirm(
        `Destination is occupied by enemy. Initiate combat?`
      );

      if (confirmed) {
        shipMovement.moveShip(data.shipId, data.enemyPlanetId, true);
      }
    },

    onNotification: (data) => {
      // Show toast notification
      console.log('Notification:', data.message);
    }
  });

  return shipMovement;
}

/**
 * Example: Move ship with UI feedback
 */
export async function moveShipWithFeedback(
  shipMovement: ShipMovementClient,
  shipId: string,
  destinationPlanetId: string
) {
  try {
    // Check for collision first
    const collision = await shipMovement.checkCollision(destinationPlanetId);

    if (collision) {
      const confirmed = window.confirm(
        'Destination is occupied by enemy. Initiate combat?'
      );

      if (!confirmed) {
        return;
      }
    }

    // Move ship
    const result = await shipMovement.moveShip(
      shipId,
      destinationPlanetId,
      collision
    );

    console.log('Ship moving:', result);
    console.log(`ETA: ${result.data.travelTime} seconds`);

    return result;
  } catch (error) {
    console.error('Failed to move ship:', error);
    throw error;
  }
}

/**
 * Example: Display movement progress
 */
export async function displayMovementProgress(
  shipMovement: ShipMovementClient,
  shipId: string
) {
  const updateProgress = async () => {
    try {
      const { arrivalTime, remainingTime } = await shipMovement.getArrivalTime(
        shipId
      );

      if (arrivalTime) {
        const progress =
          ((Date.now() - (arrivalTime - remainingTime * 1000)) /
            (remainingTime * 1000)) *
          100;

        console.log(`Progress: ${progress.toFixed(1)}%`);
        console.log(`Remaining: ${remainingTime}s`);

        // Update progress bar
        // updateProgressBar(progress);

        if (remainingTime > 0) {
          setTimeout(updateProgress, 1000);
        }
      }
    } catch (error) {
      console.error('Error updating progress:', error);
    }
  };

  updateProgress();
}

/**
 * Example: React component
 */
export function ShipMovementComponent() {
  const shipMovement = useShipMovement();

  const handleMoveShip = async (shipId: string, planetId: string) => {
    try {
      await moveShipWithFeedback(shipMovement, shipId, planetId);
    } catch (error) {
      console.error(error);
    }
  };

  const handleCancelMovement = async (shipId: string) => {
    try {
      await shipMovement.cancelMovement(shipId);
      console.log('Movement cancelled');
    } catch (error) {
      console.error(error);
    }
  };

  return {
    moveShip: handleMoveShip,
    cancelMovement: handleCancelMovement,
    getMovements: () => shipMovement.getMovements()
  };
}
