import { _decorator, Component, Node, Sprite, Vec3, tween } from 'cc';
import { GAME_CONFIG, GAME_EVENTS } from '../core/Constants';
import { EventBus } from '../core/EventBus';
import { Enemy } from './Enemy';

const { ccclass, property } = _decorator;

@ccclass('Bullet')
export class Bullet extends Component {
  @property(Sprite)
  bulletSprite: Sprite = null;

  private damage: number = 10;
  private speed: number = 300;
  private target: Node = null;
  private isActive: boolean = false;

  onLoad() {
    // Create bullet visual
    const visual = new Node('bulletVisual');
    visual.setParent(this.node);
    const sprite = visual.addComponent(Sprite);
    if (sprite) {
      sprite.node.setContentSize(8, 8);
    }
  }

  init(damage: number, speed: number, target: Node) {
    this.damage = damage;
    this.speed = speed;
    this.target = target;
    this.isActive = true;
    this.node.setPosition(0, 0, 0);
    this.node.setOpacity(255);
  }

  update(dt: number) {
    if (!this.isActive || !this.target || !this.target.isValid) {
      this.despawn();
      return;
    }

    const currentPos = this.node.position;
    const targetPos = this.target.position;
    const direction = new Vec3().subtract(targetPos, currentPos);
    const distance = direction.length();

    if (distance < 10) {
      this.hit();
      return;
    }

    direction.normalize();
    const moveDistance = this.speed * dt;
    const newPos = new Vec3(
      currentPos.x + direction.x * moveDistance,
      currentPos.y + direction.y * moveDistance,
      0
    );
    this.node.setPosition(newPos);

    // Rotate to face target
    const angle = Math.atan2(direction.y, direction.x) * 180 / Math.PI;
    this.node.setRotationFromEuler(0, 0, angle);
  }

  private hit() {
    if (this.target && this.target.isValid) {
      const enemy = this.target.getComponent(Enemy);
      if (enemy && typeof enemy.takeDamage === 'function') {
        enemy.takeDamage(this.damage);
      }
      EventBus.emit(GAME_EVENTS.BULLET_HIT, { bullet: this, target: this.target });
    }
    this.despawn();
  }

  private despawn() {
    this.isActive = false;
    this.node.destroy();
  }

  isBulletActive(): boolean {
    return this.isActive;
  }
}