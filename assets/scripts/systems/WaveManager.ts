import { _decorator, Component, Node, Prefab, instantiate } from 'cc';
import { GAME_CONFIG, GAME_EVENTS } from '../core/Constants';
import { EventBus } from '../core/EventBus';
import { Enemy } from '../entities/Enemy';

const { ccclass, property } = _decorator;

interface WaveConfig {
  wave: number;
  enemyCount: number;
  spawnInterval: number;
  hpMultiplier: number;
}

@ccclass('WaveManager')
export class WaveManager extends Component {
  @property(Prefab)
  enemyPrefab: Prefab = null;

  private currentWave: number = 0;
  private enemiesSpawned: number = 0;
  private enemiesAlive: number = 0;
  private spawnTimer: number = 0;
  private isSpawning: boolean = false;
  private waveConfig: WaveConfig | null = null;

  onLoad() {
    this.registerEvents();
  }

  private registerEvents() {
    EventBus.on(GAME_EVENTS.WAVE_STARTED, this.onWaveStarted, this);
    EventBus.on(GAME_EVENTS.ENEMY_DIED, this.onEnemyDied, this);
    EventBus.on(GAME_EVENTS.ENEMY_ESCAPED, this.onEnemyEscaped, this);
  }

  onDestroy() {
    EventBus.off(GAME_EVENTS.WAVE_STARTED, this.onWaveStarted, this);
    EventBus.off(GAME_EVENTS.ENEMY_DIED, this.onEnemyDied, this);
    EventBus.off(GAME_EVENTS.ENEMY_ESCAPED, this.onEnemyEscaped, this);
  }

  private onWaveStarted(waveNumber: number) {
    this.currentWave = waveNumber;
    this.waveConfig = GAME_CONFIG.WAVE_CONFIGS.find(w => w.wave === waveNumber);
    if (!this.waveConfig) {
      console.warn(`Wave config not found for wave ${waveNumber}`);
      return;
    }

    this.enemiesSpawned = 0;
    this.enemiesAlive = 0;
    this.isSpawning = true;
    this.spawnTimer = 0;
  }

  update(dt: number) {
    if (!this.isSpawning || !this.waveConfig) return;

    this.spawnTimer += dt;
    const spawnInterval = this.waveConfig.spawnInterval;

    if (this.spawnTimer >= spawnInterval && this.enemiesSpawned < this.waveConfig.enemyCount) {
      this.spawnEnemy();
      this.spawnTimer = 0;
    }

    // Check if wave is complete
    if (this.enemiesSpawned >= this.waveConfig.enemyCount && this.enemiesAlive === 0) {
      this.completeWave();
    }
  }

  private spawnEnemy() {
    if (!this.enemyPrefab) {
      console.warn('Enemy prefab not set');
      return;
    }

    const enemyNode = instantiate(this.enemyPrefab);
    enemyNode.setParent(this.node);
    enemyNode.setPosition(GAME_CONFIG.PATH_WAYPOINTS[0].x, GAME_CONFIG.PATH_WAYPOINTS[0].y, 0);

    const enemy = enemyNode.getComponent(Enemy);
    if (enemy) {
      const hpMultiplier = this.waveConfig.hpMultiplier || 1.0;
      const baseConfig = GAME_CONFIG.ENEMY_CONFIG.mouse;
      enemy.init({
        hp: baseConfig.hp * hpMultiplier,
        speed: baseConfig.speed,
        reward: baseConfig.reward,
        scale: baseConfig.scale
      });
    }

    this.enemiesSpawned++;
    this.enemiesAlive++;

    EventBus.emit(GAME_EVENTS.ENEMY_SPAWNED, enemyNode);
  }

  private onEnemyDied(enemy: any) {
    this.enemiesAlive--;
  }

  private onEnemyEscaped() {
    this.enemiesAlive--;
  }

  private completeWave() {
    this.isSpawning = false;
    EventBus.emit(GAME_EVENTS.WAVE_COMPLETED);
  }

  getCurrentWave(): number {
    return this.currentWave;
  }

  getEnemiesAlive(): number {
    return this.enemiesAlive;
  }

  isWaveInProgress(): boolean {
    return this.isSpawning;
  }
}