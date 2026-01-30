/**
 * Database Seeder
 * 
 * Seeds the database with initial data for development and testing.
 */

import { userModel } from './models/UserModel';
import { planetModel } from './models/PlanetModel';
import { shipModel } from './models/ShipModel';
import { allianceModel } from './models/AllianceModel';
import { logger } from '@/utils/logger';
import { SHIP_TYPES } from '@shared/constants/ships';

/**
 * Generate random position within game bounds
 */
const randomPosition = (min: number = -5000, max: number = 5000): { x: number; y: number } => {
  return {
    x: Math.random() * (max - min) + min,
    y: Math.random() * (max - min) + min
  };
};

/**
 * Generate planet name
 */
const generatePlanetName = (index: number): string => {
  const prefixes = ['Alpha', 'Beta', 'Gamma', 'Delta', 'Epsilon', 'Zeta', 'Eta', 'Theta', 'Iota', 'Kappa'];
  const suffixes = ['Prime', 'Secundus', 'Tertius', 'Major', 'Minor', 'Nova', 'Centauri', 'Proxima'];
  
  const prefix = prefixes[Math.floor(Math.random() * prefixes.length)];
  const suffix = suffixes[Math.floor(Math.random() * suffixes.length)];
  
  return `${prefix}-${suffix}-${index}`;
};

/**
 * Seed test users
 */
export const seedUsers = async (): Promise<void> => {
  logger.info('Seeding users...');
  
  const testUsers = [
    { username: 'admiral', email: 'admiral@spacegame.com', password: 'password123' },
    { username: 'commander', email: 'commander@spacegame.com', password: 'password123' },
    { username: 'captain', email: 'captain@spacegame.com', password: 'password123' },
    { username: 'pilot', email: 'pilot@spacegame.com', password: 'password123' }
  ];

  for (const userData of testUsers) {
    try {
      // Check if user already exists
      const existing = userModel.findByEmail(userData.email);
      if (existing) {
        logger.debug(`User already exists: ${userData.username}`);
        continue;
      }

      await userModel.create(userData);
      logger.info(`Created user: ${userData.username}`);
    } catch (error) {
      logger.error(`Failed to create user ${userData.username}:`, error);
    }
  }
};

/**
 * Seed planets
 */
export const seedPlanets = (): void => {
  logger.info('Seeding planets...');
  
  const planetCount = 50;
  const planetsData = [];

  for (let i = 0; i < planetCount; i++) {
    const pos = randomPosition();
    const size = Math.floor(Math.random() * 5) + 1;
    
    planetsData.push({
      name: generatePlanetName(i + 1),
      x_position: pos.x,
      y_position: pos.y,
      size,
      max_population: size * 1000,
      minerals: Math.floor(Math.random() * 1000) + 500,
      energy: Math.floor(Math.random() * 500) + 250,
      production_minerals: Math.floor(Math.random() * 50) + 10,
      production_energy: Math.floor(Math.random() * 30) + 5,
      production_credits: Math.floor(Math.random() * 20) + 5
    });
  }

  try {
    planetModel.bulkCreate(planetsData);
    logger.info(`Created ${planetCount} planets`);
  } catch (error) {
    logger.error('Failed to create planets:', error);
  }
};

/**
 * Assign starting planets to users
 */
export const assignStartingPlanets = (): void => {
  logger.info('Assigning starting planets...');
  
  const users = userModel.findAll(10);
  const unownedPlanets = planetModel.findUnowned(users.length);

  users.forEach((user, index) => {
    if (index < unownedPlanets.length) {
      const planet = unownedPlanets[index];
      planetModel.colonize(planet.id, user.id, 1000);
      logger.info(`Assigned ${planet.name} to ${user.username}`);
    }
  });
};

/**
 * Seed initial ships for players
 */
export const seedShips = (): void => {
  logger.info('Seeding ships...');
  
  const users = userModel.findAll(10);
  
  users.forEach(user => {
    const userPlanets = planetModel.findByOwner(user.id);
    
    if (userPlanets.length === 0) return;
    
    const homePlanet = userPlanets[0];
    
    // Create a scout ship and a fighter for each player
    const ships = [
      {
        owner_id: user.id,
        type: 'scout',
        planet_id: homePlanet.id,
        x_position: homePlanet.x_position,
        y_position: homePlanet.y_position,
        health: SHIP_TYPES.scout.maxHealth,
        max_health: SHIP_TYPES.scout.maxHealth,
        speed: SHIP_TYPES.scout.speed,
        damage: SHIP_TYPES.scout.damage
      },
      {
        owner_id: user.id,
        type: 'fighter',
        planet_id: homePlanet.id,
        x_position: homePlanet.x_position,
        y_position: homePlanet.y_position,
        health: SHIP_TYPES.fighter.maxHealth,
        max_health: SHIP_TYPES.fighter.maxHealth,
        speed: SHIP_TYPES.fighter.speed,
        damage: SHIP_TYPES.fighter.damage
      }
    ];

    try {
      shipModel.bulkCreate(ships);
      logger.info(`Created starter ships for ${user.username}`);
    } catch (error) {
      logger.error(`Failed to create ships for ${user.username}:`, error);
    }
  });
};

/**
 * Seed alliances
 */
export const seedAlliances = (): void => {
  logger.info('Seeding alliances...');
  
  const users = userModel.findAll(10);
  
  if (users.length < 2) {
    logger.warn('Not enough users to create alliances');
    return;
  }

  const alliancesData = [
    { name: 'United Federation', leader_id: users[0].id, description: 'A peaceful alliance dedicated to exploration' },
    { name: 'Empire Coalition', leader_id: users[1].id, description: 'A powerful military alliance' }
  ];

  alliancesData.forEach((data, index) => {
    try {
      // Check if alliance already exists
      const existing = allianceModel.findByName(data.name);
      if (existing) {
        logger.debug(`Alliance already exists: ${data.name}`);
        return;
      }

      const alliance = allianceModel.create(data);
      
      // Add additional members
      if (index * 2 + 2 < users.length) {
        allianceModel.addMember(alliance.id, users[index * 2 + 2].id);
      }
      
      logger.info(`Created alliance: ${data.name}`);
    } catch (error) {
      logger.error(`Failed to create alliance ${data.name}:`, error);
    }
  });
};

/**
 * Run all seeders
 */
export const seedDatabase = async (): Promise<void> => {
  try {
    logger.info('ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â°ÃƒÆ’Ã¢â‚¬Â¦Ãƒâ€šÃ‚Â¸ÃƒÆ’Ã¢â‚¬Â¦ÃƒÂ¢Ã¢â€šÂ¬Ã¢â€žÂ¢ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â± Starting database seeding...');
    
    await seedUsers();
    seedPlanets();
    assignStartingPlanets();
    seedShips();
    seedAlliances();
    
    logger.info('ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã¢â‚¬Â¦ÃƒÂ¢Ã¢â€šÂ¬Ã…â€œÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬Ãƒâ€šÃ‚Â¦ Database seeding completed successfully');
  } catch (error) {
    logger.error('ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚ÂÃƒÆ’Ã¢â‚¬Â¦ÃƒÂ¢Ã¢â€šÂ¬Ã¢â€žÂ¢ Database seeding failed:', error);
    throw error;
  }
};

/**
 * Check if database needs seeding
 */
export const needsSeeding = (): boolean => {
  const userCount = userModel.count();
  const planetCount = planetModel.count();
  
  return userCount === 0 || planetCount === 0;
};
