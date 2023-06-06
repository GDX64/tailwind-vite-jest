import { clamp } from 'ramda';

export function speedMomentum(target: number, deltaT: number, speedNow: number) {
  const error = target - speedNow;
  return target - error * 0.95;
}

export enum SquareStates {
  DRAG,
  NORMAL,
}

export type EstimatorConstructor = {
  new (): {
    onPositionChange(pos: number, deltaT: number): void;
    getSpeed(): number;
  };
};

export class DragSquare {
  estimator;
  state = SquareStates.NORMAL;
  position = 0;
  speedNow = 0;
  constructor(Create: EstimatorConstructor, private maxLimit: number) {
    this.estimator = new Create();
  }

  private clampPosition() {
    this.position = clamp(0, this.maxLimit, this.position);
  }

  drag(x: number, delta: number) {
    this.position = x;
    this.clampPosition();
    this.estimator.onPositionChange(x, delta);
    this.speedNow = this.estimator.getSpeed();
  }

  private reflectSpeed() {
    if (this.position <= 0 || this.position >= this.maxLimit) {
      this.speedNow = -this.speedNow;
    }
  }

  getSpeed() {
    return this.estimator.getSpeed();
  }

  onTick(dt: number) {
    this.speedNow = speedMomentum(0, dt, this.speedNow);
    this.position = this.speedNow * dt + this.position;
    this.reflectSpeed();
    this.clampPosition();
    this.estimator.onPositionChange(this.position, dt);
  }
}
