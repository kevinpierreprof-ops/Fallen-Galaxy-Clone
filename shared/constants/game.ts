export const GAME_CONFIG = {
  MAP_SIZE: 10000,
  INITIAL_PLANETS: 50,
  STARTING_RESOURCES: {
    minerals: 1000,
    energy: 500,
    credits: 5000
  },
  UPDATE_RATE: 30, // Updates per second
  MAX_PLAYERS: 100
};

export const BUILDING_TYPES = {
  MINE: 'mine',
  POWER_PLANT: 'power_plant',
  RESEARCH_LAB: 'research_lab',
  SHIPYARD: 'shipyard',
  DEFENSE_TURRET: 'defense_turret',
  HABITAT: 'habitat'
};

export const ACTION_TYPES = {
  COLONIZE_PLANET: 'colonize_planet',
  BUILD_SHIP: 'build_ship',
  MOVE_FLEET: 'move_fleet',
  BUILD_BUILDING: 'build_building',
  CREATE_ALLIANCE: 'create_alliance',
  JOIN_ALLIANCE: 'join_alliance',
  LEAVE_ALLIANCE: 'leave_alliance',
  SEND_MESSAGE: 'send_message'
};
