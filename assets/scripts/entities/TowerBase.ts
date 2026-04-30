import { _decorator, Component, Node, Sprite, Prefab, instantiate, Vec3 } from 'cc';
import { GAME_CONFIG, GAME_EVENTS } from '../core/Constants';
import { EventBus } from '../core/EventBus';
import { Bullet } from './Bullet';
import { Enemy } from './Enemy';

const { ccclass, property } = _decorator;

export interface TowerConfig {
  id?: string;
  name?: string;
  cost?: number;
  range?: number;
  damage?: number;
  fireRate?: number;
  projectileSpeed?: number;
}

@ccclass('TowerBase')
export class TowerBase extends Component {
  @property(Prefab)
  bulletPrefab: Prefab = null;

  protected towerId: string = '';
  protected towerName: string = '';
  protected cost: number = 50;
  protected range: number = 150;
  protected damage: number = 10;
  protected fireRate: number = 1.0;
  protected projectileSpeed: number = 300;

  protected target: Node = null;
  protected lastFireTime: number = 0;
  protected isActive: boolean = true;

  onLoad() {
    this.setupVisuals();
  }

  protected setupVisuals() {
    // Create tower visual - cat shape
    // Body (circle)
    const body = new Node('body');
    body.setParent(this.node);
    body.setPosition(0, 0, 0);
    const bodySprite = body.addComponent(Sprite);
    if (bodySprite) {
      bodySprite.node.setContentSize(50, 50);
    }

    // Head
    const head = new Node('head');
    head.setParent(this.node);
    head.setPosition(0, 35, 0);
    const headSprite = head.addComponent(Sprite);
    if (headSprite) {
      headSprite.node.setContentSize(40, 35);
    }

    // Ears (triangles via nodes)
    const leftEar = new Node('leftEar');
    leftEar.setParent(this.node);
    leftEar.setPosition(-18, 55, 0);

    const rightEar = new Node('rightEar');
    rightEar.setParent(this.node);
    rightEar.setPosition(18, 55, 0);

    // Eyes
    const leftEye = new Node('leftEye');
    leftEye.setParent(this.node);
    leftEye.setPosition(-10, 40, 0);

    const rightEye = new Node('rightEye');
    rightEye.setParent(this.node);
    rightEye.setPosition(10, 40, 0);
  }

  init(config: TowerConfig) {
    this.towerId = config.id || 'arrow';
    this.towerName = config.name || 'Tower';
    this.cost = config.cost || 50;
    this.range = config.range || 150;
    this.damage = config.damage || 10;
    this.fireRate = config.fireRate || 1.0;
    this.projectileSpeed = config.projectileSpeed || 300;
  }

  update(dt: number) {
    if (!this.isActive) return;

    // Find target
    this.findTarget();

    // Fire at target if ready
    if (this.target && this.target.isValid) {
      const currentTime = Date.now() / 1000;
      if (currentTime - this.lastFireTime >= 1 / this.fireRate) {
        this.fire();
        this.lastFireTime = currentTime;
      }

      // Rotate to face target
      const direction = new Vec3().subtract(this.target.position, this.node.position);
      const angle = Math.atan2(direction.y, direction.x) * 180 / Math.PI;
      this.node.setRotationFromEuler(0, 0, angle);
    }
  }

  protected findTarget() {
    // Get all enemy nodes in the scene
    const enemies = this.getEnemiesInRange();
    if (enemies.length > 0) {
      // Target the first enemy (could be enhanced to target closest/strongest)
      this.target = enemies[0];
    } else {
      this.target = null;
    }
  }

  protected getEnemiesInRange(): Node[] {
    const enemies: Node[] = [];
    const allNodes = this.node.parent?.children || [];
    const towerPos = this.node.position;

    for (const node of allNodes) {
      if (node.name === 'Enemy' || node.getComponent(Enemy)) {
        const distance = towerPos.subtract(node.position).length();
        if (distance <= this.range) {
          enemies.push(node);
        }
      }
    }

    return enemies;
  }

  protected fire() {
    if (!this.target || !this.target.isValid) return;

    // Spawn bullet
    let bulletNode: Node = null;
    if (this.bulletPrefab) {
      bulletNode = instantiate(this.bulletPrefab);
      bulletNode.setParent(this.node.parent);
      const bullet = bulletNode.getComponent(Bullet);
      if (bullet) {
        bullet.init(this.damage, this.projectileSpeed, this.target);
      }
    }

    EventBus.emit(GAME_EVENTS.TOWER_FIRED, {
      tower: this.node,
      target: this.target,
      bullet: bulletNode
    });
  }

  getCost(): number {
    return this.cost;
  }

  getRange(): number {
    return this.range;
  }

  isTowerActive(): boolean {
    return this.isActive;
  }

  setActive(active: boolean) {
    this.isActive = active;
  }
}