import { _decorator, Component, Node, Sprite, Label, tween, Tween, Vec3 } from 'cc';
import { GAME_CONFIG, GAME_EVENTS } from '../core/Constants';
import { EventBus } from '../core/EventBus';

const { ccclass, property } = _decorator;

interface EnemyConfig {
  hp?: number;
  speed?: number;
  reward?: number;
  scale?: number;
}

@ccclass('Enemy')
export class Enemy extends Component {
  @property(Sprite)
  bodySprite: Sprite = null;

  @property(Label)
  hpLabel: Label = null;

  private maxHp: number = 100;
  private currentHp: number = 100;
  private speed: number = 60;
  private reward: number = 10;
  private scale: number = 1.0;

  private waypointIndex: number = 0;
  private isAlive: boolean = true;
  private isPaused: boolean = false;
  private colorTween: Tween | null = null;
  private visualNodes: Node[] = [];

  onLoad() {
    this.setupVisuals();
  }

  onDestroy() {
    this.stopColorTween();
    this.cleanupVisualNodes();
  }

  private stopColorTween() {
    if (this.colorTween) {
      this.colorTween.stop();
      this.colorTween = null;
    }
  }

  private cleanupVisualNodes() {
    for (const visualNode of this.visualNodes) {
      if (visualNode && visualNode.isValid) {
        visualNode.destroy();
      }
    }
    this.visualNodes = [];
  }

  private setupVisuals() {
    // Create procedural mouse shape using a sprite with a colored fill
    const body = new Node('body');
    body.setParent(this.node);
    this.visualNodes.push(body);

    const sprite = body.addComponent(Sprite);
    if (sprite) {
      sprite.node.setContentSize(40, 25);
    }

    // Add ears
    const leftEar = new Node('leftEar');
    leftEar.setParent(this.node);
    leftEar.setPosition(-12, 12, 0);
    this.visualNodes.push(leftEar);

    const rightEar = new Node('rightEar');
    rightEar.setParent(this.node);
    rightEar.setPosition(12, 12, 0);
    this.visualNodes.push(rightEar);

    // Add HP bar background
    const hpBarBg = new Node('hpBarBg');
    hpBarBg.setParent(this.node);
    hpBarBg.setPosition(0, 25, 0);
    this.visualNodes.push(hpBarBg);

    const bgSprite = hpBarBg.addComponent(Sprite);
    if (bgSprite) {
      bgSprite.node.setContentSize(50, 6);
    }

    // Add HP bar fill
    const hpBarFill = new Node('hpBarFill');
    hpBarFill.setParent(hpBarBg);
    hpBarFill.setPosition(-25, 0, 0);
    this.visualNodes.push(hpBarFill);

    const fillSprite = hpBarFill.addComponent(Sprite);
    if (fillSprite) {
      fillSprite.node.setContentSize(50, 6);
    }
  }

  init(config: EnemyConfig) {
    this.maxHp = config.hp ?? 100;
    this.currentHp = this.maxHp;
    this.speed = config.speed ?? 60;
    this.reward = config.reward ?? 10;
    this.scale = config.scale ?? 1.0;
    this.waypointIndex = 0;
    this.isAlive = true;
    this.isPaused = false;

    this.node.setScale(this.scale, this.scale, 1);
    this.updateHpLabel();
  }

  update(dt: number) {
    if (!this.isAlive || this.isPaused) return;

    const waypoints = GAME_CONFIG.PATH_WAYPOINTS;
    if (this.waypointIndex >= waypoints.length) {
      this.reachEnd();
      return;
    }

    const target = waypoints[this.waypointIndex];
    const targetPos = new Vec3(target.x, target.y, 0);
    const currentPos = this.node.position;

    const direction = new Vec3().subtract(targetPos, currentPos);
    const distance = direction.length();

    if (distance < 5) {
      this.waypointIndex++;
      if (this.waypointIndex >= waypoints.length) {
        this.reachEnd();
        return;
      }
    } else {
      direction.normalize();
      const moveDistance = this.speed * dt;
      const newPos = new Vec3(
        currentPos.x + direction.x * moveDistance,
        currentPos.y + direction.y * moveDistance,
        0
      );
      this.node.setPosition(newPos);

      // Rotate to face movement direction
      const angle = Math.atan2(direction.y, direction.x) * 180 / Math.PI;
      this.node.setRotationFromEuler(0, 0, angle);
    }
  }

  takeDamage(damage: number) {
    if (!this.isAlive) return;

    this.currentHp -= damage;
    this.updateHpLabel();

    this.stopColorTween();
    this.node.setColor({ r: 255, g: 100, b: 100 });
    this.colorTween = tween(this.node)
      .delay(0.1)
      .call(() => {
        if (this.isAlive) {
          this.node.setColor({ r: 255, g: 255, b: 255 });
        }
      })
      .start();

    if (this.currentHp <= 0) {
      this.die();
    }
  }

  private updateHpLabel() {
    if (this.hpLabel) {
      this.hpLabel.string = `${Math.ceil(this.currentHp)}/${this.maxHp}`;
    }
  }

  private die() {
    this.isAlive = false;
    EventBus.emit(GAME_EVENTS.ENEMY_KILLED, { reward: this.reward, enemy: this });
    EventBus.emit(GAME_EVENTS.ENEMY_DIED, this);
    this.despawn();
  }

  private reachEnd() {
    this.isAlive = false;
    EventBus.emit(GAME_EVENTS.ENEMY_ESCAPED);
    this.despawn();
  }

  private despawn() {
    // Fade out and remove
    tween(this.node)
      .to(0.3, { opacity: 0 })
      .call(() => {
        this.node.destroy();
      })
      .start();
  }

  pause() {
    this.isPaused = true;
  }

  resume() {
    this.isPaused = false;
  }

  getCurrentHp(): number {
    return this.currentHp;
  }

  getMaxHp(): number {
    return this.maxHp;
  }

  isEnemyAlive(): boolean {
    return this.isAlive;
  }
}