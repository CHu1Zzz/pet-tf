import { _decorator, Component, Node, Label, Button } from 'cc';
import { GAME_CONFIG, GAME_EVENTS } from '../core/Constants';
import { EventBus } from '../core/EventBus';
import { GameManager, GameState } from '../core/GameManager';

const { ccclass, property } = _decorator;

@ccclass('HUD')
export class HUD extends Component {
  @property(Label)
  goldLabel: Label = null;

  @property(Label)
  livesLabel: Label = null;

  @property(Label)
  waveLabel: Label = null;

  @property(Label)
  enemyCountLabel: Label = null;

  @property(Button)
  startWaveButton: Button = null;

  private gameManager: GameManager = null;
  private enemyCount: number = 0;

  onLoad() {
    this.gameManager = GameManager.instance;
    this.registerEvents();
    this.setupButtonHandlers();
  }

  onDestroy() {
    EventBus.off(GAME_EVENTS.GOLD_CHANGED, this.onGoldChanged, this);
    EventBus.off(GAME_EVENTS.LIVES_CHANGED, this.onLivesChanged, this);
    EventBus.off(GAME_EVENTS.WAVE_STARTED, this.onWaveStarted, this);
    EventBus.off(GAME_EVENTS.WAVE_COMPLETED, this.onWaveCompleted, this);
    EventBus.off(GAME_EVENTS.ENEMY_SPAWNED, this.onEnemySpawned, this);
    EventBus.off(GAME_EVENTS.ENEMY_DIED, this.onEnemyDied, this);
  }

  private setupButtonHandlers() {
    if (this.startWaveButton) {
      this.startWaveButton.node.on(Button.EventType.CLICK, this.onStartWaveClicked, this);
    }
  }

  private registerEvents() {
    EventBus.on(GAME_EVENTS.GOLD_CHANGED, this.onGoldChanged, this);
    EventBus.on(GAME_EVENTS.LIVES_CHANGED, this.onLivesChanged, this);
    EventBus.on(GAME_EVENTS.WAVE_STARTED, this.onWaveStarted, this);
    EventBus.on(GAME_EVENTS.WAVE_COMPLETED, this.onWaveCompleted, this);
    EventBus.on(GAME_EVENTS.ENEMY_SPAWNED, this.onEnemySpawned, this);
    EventBus.on(GAME_EVENTS.ENEMY_DIED, this.onEnemyDied, this);
  }

  onDestroy() {
    EventBus.off(GAME_EVENTS.GOLD_CHANGED, this.onGoldChanged, this);
    EventBus.off(GAME_EVENTS.LIVES_CHANGED, this.onLivesChanged, this);
    EventBus.off(GAME_EVENTS.WAVE_STARTED, this.onWaveStarted, this);
    EventBus.off(GAME_EVENTS.WAVE_COMPLETED, this.onWaveCompleted, this);
    EventBus.off(GAME_EVENTS.ENEMY_SPAWNED, this.onEnemySpawned, this);
    EventBus.off(GAME_EVENTS.ENEMY_DIED, this.onEnemyDied, this);
  }

  start() {
    this.updateDisplay();
  }

  private onGoldChanged(gold: number) {
    if (this.goldLabel) {
      this.goldLabel.string = `Gold: ${gold}`;
    }
  }

  private onLivesChanged(lives: number) {
    if (this.livesLabel) {
      this.livesLabel.string = `Lives: ${lives}`;
    }
  }

  private onWaveStarted(waveNumber: number) {
    this.updateDisplay();
    if (this.startWaveButton) {
      this.startWaveButton.node.active = false;
    }
  }

  private onWaveCompleted() {
    this.updateDisplay();
    if (this.startWaveButton) {
      this.startWaveButton.node.active = true;
    }
  }

  private onEnemySpawned() {
    this.enemyCount++;
    this.updateEnemyCount();
  }

  private onEnemyDied() {
    this.enemyCount--;
    this.updateEnemyCount();
  }

  private updateDisplay() {
    if (!this.gameManager) return;

    const gold = this.gameManager.getGold();
    const lives = this.gameManager.getLives();
    const currentWave = this.gameManager.getCurrentWave();
    const totalWaves = this.gameManager.getTotalWaves();

    if (this.goldLabel) this.goldLabel.string = `Gold: ${gold}`;
    if (this.livesLabel) this.livesLabel.string = `Lives: ${lives}`;
    if (this.waveLabel) this.waveLabel.string = `Wave: ${currentWave}/${totalWaves}`;

    this.updateEnemyCount();
  }

  private updateEnemyCount() {
    if (this.enemyCountLabel) {
      this.enemyCountLabel.string = `Enemies: ${this.enemyCount}`;
    }
  }

  onStartWaveClicked() {
    if (!this.gameManager) return;

    if (this.gameManager.getState() === GameState.BUILD ||
        this.gameManager.getState() === GameState.WAVE_COMPLETE) {
      this.gameManager.startNextWave();
    }
  }
}