import { Alliance } from '@shared/types/game';
import { v4 as uuidv4 } from 'uuid';
import { logger } from '@/utils/logger';

export class AllianceManager {
  private alliances: Map<string, Alliance> = new Map();

  createAlliance(leaderId: string, name: string): Alliance {
    const alliance: Alliance = {
      id: uuidv4(),
      name: name,
      leaderId: leaderId,
      memberIds: [leaderId],
      createdAt: Date.now(),
      description: ''
    };

    this.alliances.set(alliance.id, alliance);
    logger.info(`Alliance ${name} created by ${leaderId}`);
    return alliance;
  }

  joinAlliance(playerId: string, allianceId: string): boolean {
    const alliance = this.alliances.get(allianceId);
    
    if (!alliance) {
      logger.warn(`Alliance ${allianceId} not found`);
      return false;
    }

    if (alliance.memberIds.includes(playerId)) {
      logger.warn(`Player ${playerId} already in alliance ${allianceId}`);
      return false;
    }

    alliance.memberIds.push(playerId);
    logger.info(`Player ${playerId} joined alliance ${alliance.name}`);
    return true;
  }

  leaveAlliance(playerId: string, allianceId: string): boolean {
    const alliance = this.alliances.get(allianceId);
    
    if (!alliance) {
      return false;
    }

    alliance.memberIds = alliance.memberIds.filter(id => id !== playerId);
    
    // If leader leaves, assign new leader or disband
    if (alliance.leaderId === playerId) {
      if (alliance.memberIds.length > 0) {
        alliance.leaderId = alliance.memberIds[0];
        logger.info(`New alliance leader: ${alliance.leaderId}`);
      } else {
        this.alliances.delete(allianceId);
        logger.info(`Alliance ${alliance.name} disbanded`);
        return true;
      }
    }

    logger.info(`Player ${playerId} left alliance ${alliance.name}`);
    return true;
  }

  getAlliances(): Alliance[] {
    return Array.from(this.alliances.values());
  }

  getAlliance(allianceId: string): Alliance | undefined {
    return this.alliances.get(allianceId);
  }

  getPlayerAlliance(playerId: string): Alliance | undefined {
    return Array.from(this.alliances.values()).find(
      alliance => alliance.memberIds.includes(playerId)
    );
  }

  isInSameAlliance(playerId1: string, playerId2: string): boolean {
    const alliance = this.getPlayerAlliance(playerId1);
    if (!alliance) return false;
    return alliance.memberIds.includes(playerId2);
  }

  updateAllianceDescription(allianceId: string, description: string): boolean {
    const alliance = this.alliances.get(allianceId);
    if (alliance) {
      alliance.description = description;
      return true;
    }
    return false;
  }
}
