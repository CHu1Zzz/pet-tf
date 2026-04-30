import { _decorator, Component, Node } from 'cc';
import { GAME_CONFIG, GAME_EVENTS } from './Constants';
import { EventBus } from './EventBus';

const { ccclass, property } = _decorator;

export enum GameState {
  MENU = 'menu',
  BUILD = 'build',
  WAVE_ACTIVE = 'wave_active',
  WAVE_COMPLETE = 'wave_complete',
  VICTORY = 'victory',
  DEFEAT = 'defeat'
}

@ccclass('GameManager')
export class GameManager extends Component {
  private static _instance: GameManager = null;
  public static get instance(): GameManager {
    return GameManager._instance;
  }

  @property({ type: Node })
  hudNode: Node = null;

  @property({ type: Node })
  towerPanelNode: Node = null;

  @property({ type: Node })
  gameOverOverlay: Node = null;

  private state: GameState = GameState.MENU;
  private gold: number = GAME_CONFIG.STARTING_GOLD;
  private lives: number = GAME_CONFIG.STARTING_LIVES;
  private currentWave: number = 0;
  private placedTowers: Node[] = [];
  private occupiedBuildPoints: Set<number> = new Set();

  onLoad() {
    if (GameManager._instance) {
      this.destroy();
      return;
    }
    GameManager._instance = this;

    this.registerEvents();
  }

  onDestroy() {
    this.unregisterEvents();
    if (GameManager._instance === this) {
      GameManager._instance = null;
    }
  }

  private registerEvents() {
    EventBus.on(GAME_EVENTS.ENEMY_KILLED, this.onEnemyKilled, this);
    EventBus.on(GAME_EVENTS.ENEMY_ESCAPED, this.onEnemyEscaped, this);
    EventBus.on(GAME_EVENTS.WAVE_COMPLETED, this.onWaveCompleted, this);
    EventBus.on(GAME_EVENTS.GOLD_CHANGED, this.updateHUD, this);
    EventBus.on(GAME_EVENTS.LIVES_CHANGED, this.updateHUD, this);
  }

  private unregisterEvents() {
    EventBus.off(GAME_EVENTS.ENEMY_KILLED, this.onEnemyKilled, this);
    EventBus.off(GAME_EVENTS.ENEMY_ESCAPED, this.onEnemyEscaped, this);
    EventBus.off(GAME_EVENTS.WAVE_COMPLETED, this.onWaveCompleted, this);
    EventBus.off(GAME_EVENTS.GOLD_CHANGED, this.updateHUD, this);
    EventBus.off(GAME_EVENTS.LIVES_CHANGED, this.updateHUD, this);
  }

  start() {
    this.updateHUD();
  }

  private registerEvents() {
    EventBus.on(GAME_EVENTS.ENEMY_KILLED, this.onEnemyKilled, this);
    EventBus.on(GAME_EVENTS.ENEMY_ESCAPED, this.onEnemyEscaped, this);
    EventBus.on(GAME_EVENTS.WAVE_COMPLETED, this.onWaveCompleted, this);
    EventBus.on(GAME_EVENTS.GOLD_CHANGED, this.updateHUD, this);
    EventBus.on(GAME_EVENTS.LIVES_CHANGED, this.updateHUD, this);
  }

  // ============ Game State Transitions ============

  startGame() {
    this.state = GameState.BUILD;
    this.gold = GAME_CONFIG.STARTING_GOLD;
    this.lives = GAME_CONFIG.STARTING_LIVES;
    this.currentWave = 0;
    this.placedTowers = [];
    this.occupiedBuildPoints.clear();
    this.updateHUD();
  }

  startNextWave() {
    this.currentWave++;
    this.state = GameState.WAVE_ACTIVE;
    EventBus.emit(GAME_EVENTS.WAVE_STARTED, this.currentWave);
    this.updateHUD();
  }

  private onWaveCompleted() {
    if (this.currentWave >= GAME_CONFIG.TOTAL_WAVES) {
      this.state = GameState.VICTORY;
      EventBus.emit(GAME_EVENTS.VICTORY);
      this.showGameOver(true);
    } else {
      this.state = GameState.WAVE_COMPLETE;
      this.updateHUD();
    }
  }

  private onEnemyKilled(enemy: any) {
    this.addGold(enemy.reward || GAME_CONFIG.ENEMY_CONFIG.mouse.reward);
  }

  private onEnemyEscaped() {
    this.loseLife();
  }

  loseLife() {
    this.lives--;
    EventBus.emit(GAME_EVENTS.LIVES_CHANGED, this.lives);

    if (this.lives <= 0) {
      this.state = GameState.DEFEAT;
      EventBus.emit(GAME_EVENTS.GAME_OVER);
      this.showGameOver(false);
    }
  }

  // ============ Gold Management ============

  addGold(amount: number) {
    this.gold += amount;
    EventBus.emit(GAME_EVENTS.GOLD_CHANGED, this.gold);
  }

  spendGold(amount: number): boolean {
    if (this.gold >= amount) {
      this.gold -= amount;
      EventBus.emit(GAME_EVENTS.GOLD_CHANGED, this.gold);
      return true;
    }
    return false;
  }

  getGold(): number {
    return this.gold;
  }

  getLives(): number {
    return this.lives;
  }

  getCurrentWave(): number {
    return this.currentWave;
  }

  getTotalWaves(): number {
    return GAME_CONFIG.TOTAL_WAVES;
  }

  // ============ Tower Placement ============

  canBuildAtPoint(pointIndex: number, towerCost: number): boolean {
    if (this.occupiedBuildPoints.has(pointIndex)) return false;
    return this.gold >= towerCost;
  }

  occupyBuildPoint(pointIndex: number) {
    this.occupiedBuildPoints.add(pointIndex);
  }

  isBuildPointOccupied(pointIndex: number): boolean {
    return this.occupiedBuildPoints.has(pointIndex);
  }

  // ============ HUD Update ============

  private updateHUD() {
    // This will be implemented by HUD component listening to events
  }

  // ============ Game Over ============

  private showGameOver(isVictory: boolean) {
    if (this.gameOverOverlay) {
      this.gameOverOverlay.active = true;
      const label = this.gameOverOverlay.getChildByName('ResultLabel')?.getComponent('cc.Label');
      if (label) {
        label.string = isVictory ? 'VICTORY!' : 'DEFEAT!';
      }
    }
  }

  returnToMenu() {
    this.state = GameState.MENU;
    this.currentWave = 0;
  }

  getState(): GameState {
    return this.state;
  }

  isInBuildPhase(): boolean {
    return this.state === GameState.BUILD || this.state === GameState.WAVE_COMPLETE;
  }

  isWaveActive(): boolean {
    return this.state === GameState.WAVE_ACTIVE;
  }
}
