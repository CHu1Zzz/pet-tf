import { _decorator, Component, Node, Button, Label } from 'cc';
import { EventBus } from '../core/EventBus';
import { GameManager } from '../core/GameManager';

const { ccclass, property } = _decorator;

@ccclass('MainMenu')
export class MainMenu extends Component {
  @property(Button)
  startButton: Button = null;

  @property(Label)
  titleLabel: Label = null;

  onLoad() {
    // Setup title
    if (this.titleLabel) {
      this.titleLabel.string = 'Pet Tower Defense';
    }

    // Setup start button
    if (this.startButton) {
      this.startButton.node.on(Button.EventType.CLICK, this.onStartClicked, this);
    }
  }

  private onStartClicked() {
    // Start game logic
    const gameManager = GameManager.instance;
    if (gameManager) {
      gameManager.startGame();
    }

    // Load game scene
    const sceneName = 'GamePlay';
    const scene = cc.director.getScene();
    if (scene && scene.name !== sceneName) {
      cc.director.loadScene(sceneName);
    }
  }
}