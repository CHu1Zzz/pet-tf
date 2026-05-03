import { _decorator, Component, Node, Button, Label, director } from 'cc';
import { GAME_EVENTS } from '../core/Constants';
import { EventBus } from '../core/EventBus';
import { GameManager } from '../core/GameManager';

const { ccclass, property } = _decorator;

@ccclass('GameOverOverlay')
export class GameOverOverlay extends Component {
  @property(Label)
  resultLabel: Label = null;

  @property(Button)
  restartButton: Button = null;

  @property(Button)
  menuButton: Button = null;

  onLoad() {
    if (this.node) {
      this.node.active = false;
    }

    EventBus.on(GAME_EVENTS.VICTORY, this.onVictory, this);
    EventBus.on(GAME_EVENTS.GAME_OVER, this.onGameOver, this);
  }

  onDestroy() {
    EventBus.off(GAME_EVENTS.VICTORY, this.onVictory, this);
    EventBus.off(GAME_EVENTS.GAME_OVER, this.onGameOver, this);
  }

  private onVictory() {
    this.show(true);
  }

  private onGameOver() {
    this.show(false);
  }

  private show(isVictory: boolean) {
    if (this.node) {
      this.node.active = true;
    }

    if (this.resultLabel) {
      this.resultLabel.string = isVictory ? 'VICTORY!' : 'DEFEAT!';
    }
  }

  onRestartClicked() {
    const gameManager = GameManager.instance;
    if (gameManager) {
      gameManager.startGame();
    }

    director.loadScene('Game');
  }

  onMenuClicked() {
    const gameManager = GameManager.instance;
    if (gameManager) {
      gameManager.returnToMenu();
    }

    director.loadScene('Game');
  }
}