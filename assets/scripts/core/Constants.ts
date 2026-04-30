export const GAME_CONFIG = {
  // Path waypoints for enemies (S-curve path)
  PATH_WAYPOINTS: [
    { x: -50, y: 270 },
    { x: 150, y: 270 },
    { x: 150, y: 100 },
    { x: 450, y: 100 },
    { x: 450, y: 270 },
    { x: 1010, y: 270 }
  ],

  // Build points where towers can be placed
  BUILD_POINTS: [
    { x: 100, y: 180 },
    { x: 200, y: 200 },
    { x: 300, y: 180 },
    { x: 400, y: 200 },
    { x: 500, y: 180 },
    { x: 600, y: 200 }
  ],

  // Game settings
  STARTING_GOLD: 100,
  STARTING_LIVES: 10,
  TOTAL_WAVES: 5,
  ENEMIES_PER_WAVE: 8,

  // Tower configs
  TOWER_CONFIG: {
    arrow: {
      id: 'arrow',
      name: 'Arrow Tower',
      cost: 50,
      range: 150,
      damage: 10,
      fireRate: 1.0,
      projectileSpeed: 300
    }
  },

  // Enemy configs
  ENEMY_CONFIG: {
    mouse: {
      id: 'mouse',
      name: 'Mouse',
      hp: 100,
      speed: 60,
      reward: 10,
      scale: 1.0
    }
  },

  // Wave configs
  WAVE_CONFIGS: [
    { wave: 1, enemyCount: 5, spawnInterval: 1.5, hpMultiplier: 1.0 },
    { wave: 2, enemyCount: 6, spawnInterval: 1.3, hpMultiplier: 1.2 },
    { wave: 3, enemyCount: 7, spawnInterval: 1.1, hpMultiplier: 1.4 },
    { wave: 4, enemyCount: 8, spawnInterval: 1.0, hpMultiplier: 1.6 },
    { wave: 5, enemyCount: 10, spawnInterval: 0.8, hpMultiplier: 2.0 }
  ]
};

export const GAME_EVENTS = {
  // Tower events
  TOWER_PLACED: 'tower_placed',
  TOWER_FIRED: 'tower_fired',

  // Enemy events
  ENEMY_SPAWNED: 'enemy_spawned',
  ENEMY_KILLED: 'enemy_killed',
  ENEMY_ESCAPED: 'enemy_escaped',
  ENEMY_DIED: 'enemy_died',

  // Bullet events
  BULLET_HIT: 'bullet_hit',

  // Game state events
  WAVE_STARTED: 'wave_started',
  WAVE_COMPLETED: 'wave_completed',
  GOLD_CHANGED: 'gold_changed',
  LIVES_CHANGED: 'lives_changed',
  GAME_OVER: 'game_over',
  VICTORY: 'victory',

  // UI events
  SHOW_TOWER_PANEL: 'show_tower_panel',
  HIDE_TOWER_PANEL: 'hide_tower_panel'
};
