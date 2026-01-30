import { Player } from '@shared/types/game';
import { logger } from '@/utils/logger';

export class PlayerManager {
  private players: Map<string, Player> = new Map();
  private socketToPlayer: Map<string, string> = new Map();

  addPlayer(socketId: string, data: any): void {
    const player: Player = {
      id: socketId,
      name: data.name || `Player_${socketId.substring(0, 6)}`,
      resources: {
        minerals: 1000,
        energy: 500,
        credits: 5000
      },
      planets: [],
      ships: [],
      allianceId: null,
      color: this.generateColor()
    };

    this.players.set(socketId, player);
    this.socketToPlayer.set(socketId, socketId);
    logger.info(`Player added: ${player.name} (${socketId})`);
  }

  removePlayer(socketId: string): void {
    const player = this.players.get(socketId);
    if (player) {
      logger.info(`Player removed: ${player.name} (${socketId})`);
      this.players.delete(socketId);
      this.socketToPlayer.delete(socketId);
    }
  }

  getPlayer(playerId: string): Player | undefined {
    return this.players.get(playerId);
  }

  getAllPlayers(): Player[] {
    return Array.from(this.players.values());
  }

  getActivePlayerCount(): number {
    return this.players.size;
  }

  updatePlayerResources(playerId: string, resources: Partial<Player['resources']>): void {
    const player = this.players.get(playerId);
    if (player) {
      player.resources = { ...player.resources, ...resources };
    }
  }

  handleMessage(playerId: string, message: any): void {
    const player = this.players.get(playerId);
    if (player) {
      logger.debug(`Message from ${player.name}: ${message.text}`);
    }
  }

  private generateColor(): string {
    const colors = [
      '#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A', 
      '#98D8C8', '#F7DC6F', '#BB8FCE', '#85C1E2',
      '#F8B739', '#EC7063', '#AF7AC5', '#5DADE2'
    ];
    return colors[this.players.size % colors.length];
  }
}
