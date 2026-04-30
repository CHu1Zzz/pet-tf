import { _decorator, Component, Node, Prefab, instantiate, Sprite, Color } from 'cc';
import { GAME_CONFIG, GAME_EVENTS } from '../core/Constants';
import { EventBus } from '../core/EventBus';
import { GameManager, GameState } from '../core/GameManager';
import { TowerBase, TowerConfig } from '../entities/TowerBase';

const { ccclass, property } = _decorator;

@ccclass('BuildManager')
export class BuildManager extends Component {
  @property(Prefab)
  towerPrefab: Prefab = null;

  private buildPoints: Node[] = [];
  private occupiedPoints: Set<number> = new Set();

  onLoad() {
    this.createBuildPoints();
    this.registerEvents();
  }

  private registerEvents() {
    EventBus.on(GAME_EVENTS.SHOW_TOWER_PANEL, this.onShowTowerPanel, this);
    EventBus.on(GAME_EVENTS.HIDE_TOWER_PANEL, this.onHideTowerPanel, this);
  }

  onDestroy() {
    EventBus.off(GAME_EVENTS.SHOW_TOWER_PANEL, this.onShowTowerPanel, this);
    EventBus.off(GAME_EVENTS.HIDE_TOWER_PANEL, this.onHideTowerPanel, this);
  }

  private createBuildPoints() {
    const buildPointsConfig = GAME_CONFIG.BUILD_POINTS;

    for (let i = 0; i < buildPointsConfig.length; i++) {
      const point = buildPointsConfig[i];

      // Create build point visual
      const buildPointNode = new Node(`buildPoint_${i}`);
      buildPointNode.setParent(this.node);
      buildPointNode.setPosition(point.x, point.y, 0);

      // Add sprite for visual representation
      const sprite = buildPointNode.addComponent(Sprite);
      if (sprite) {
        sprite.node.setContentSize(60, 60);
        sprite.node.setColor(new Color(100, 100, 100, 150));
      }

      // Make it interactive
      this.addBuildPointClickHandler(buildPointNode, i);

      this.buildPoints.push(buildPointNode);
    }
  }

  private addBuildPointClickHandler(node: Node, index: number) {
    // In Cocos Creator 3.x, click handling is done via EventTarget
    node.on(Node.EventType.TOUCH_END, () => {
      this.onBuildPointClicked(index);
    });
  }

  private onBuildPointClicked(pointIndex: number) {
    // Check if in build phase
    const gameManager = GameManager.instance;
    if (!gameManager || !gameManager.isInBuildPhase()) {
      return;
    }

    // Check if point is occupied
    if (this.occupiedPoints.has(pointIndex)) {
      console.log('Build point already occupied');
      return;
    }

    // Get tower config
    const towerConfig = GAME_CONFIG.TOWER_CONFIG.arrow;

    // Check if player can afford it
    if (!gameManager.canBuildAtPoint(pointIndex, towerConfig.cost)) {
      console.log('Not enough gold');
      return;
    }

    // Place tower
    this.placeTower(pointIndex, towerConfig);
  }

  private placeTower(pointIndex: number, towerConfig: TowerConfig) {
    const gameManager = GameManager.instance;
    if (!gameManager) return;

    // Spend gold
    if (!gameManager.spendGold(towerConfig.cost)) {
      return;
    }

    // Create tower
    let towerNode: Node = null;
    if (this.towerPrefab) {
      towerNode = instantiate(this.towerPrefab);
    } else {
      towerNode = new Node(`Tower_${towerConfig.id}`);
    }

    towerNode.setParent(this.node.parent);
    const buildPos = GAME_CONFIG.BUILD_POINTS[pointIndex];
    towerNode.setPosition(buildPos.x, buildPos.y, 0);

    // Initialize tower
    const tower = towerNode.getComponent(TowerBase);
    if (tower) {
      tower.init(towerConfig);
    }

    // Mark point as occupied
    this.occupiedPoints.add(pointIndex);
    gameManager.occupyBuildPoint(pointIndex);

    // Hide build point visual
    const buildPointNode = this.buildPoints[pointIndex];
    if (buildPointNode) {
      buildPointNode.active = false;
    }

    // Emit event
    EventBus.emit(GAME_EVENTS.TOWER_PLACED, { tower: towerNode, pointIndex });
  }

  private onShowTowerPanel() {
    // Show build point visuals
    this.buildPoints.forEach((point, index) => {
      if (!this.occupiedPoints.has(index)) {
        point.active = true;
      }
    });
  }

  private onHideTowerPanel() {
    // Hide build point visuals
    this.buildPoints.forEach(point => {
      point.active = false;
    });
  }

  reset() {
    this.occupiedPoints.clear();
    this.buildPoints.forEach(point => {
      point.active = true;
    });
  }

  isPointOccupied(pointIndex: number): boolean {
    return this.occupiedPoints.has(pointIndex);
  }
}