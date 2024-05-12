import { Vec2 } from "../utils/Vec2";

const SPEED = 2;

class Boid {
  position = new Vec2(0, 0);
  velocity = new Vec2(0, 0);

  get rotation() {
    return Math.atan2(this.velocity.y, this.velocity.x);
  }

  isTooClose(other: Boid) {
    return this.position.sub(other.position).length() < 2;
  }

  isNear(other: Boid) {
    return this.position.sub(other.position).length() < 5;
  }
}

export class BoidsWorld {
  boids: Boid[] = [];
  dt = 0.016;
  sceneWidth = 1;
  sceneHeight = 1;

  create(n: number) {
    for (let i = 0; i < n; i++) {
      this.boids.push(this.createBoid());
    }
  }

  private createBoid() {
    const boid = new Boid();
    boid.position.x = Math.random() * this.sceneWidth - this.sceneWidth / 2;
    boid.position.y = Math.random() * this.sceneHeight - this.sceneHeight / 2;
    boid.velocity.set(Math.random() * 2 - 1, Math.random() * 2 - 1);
    boid.velocity = boid.velocity.normalize().scale(SPEED);
    return boid;
  }

  update() {
    const dt = this.dt;
    const boids = this.boids;
    boids.forEach((boid) => {
      let velocity = boid.velocity;
      let posSum = new Vec2(0, 0);
      let nearCount = 0;
      boids.forEach((other) => {
        if (boid !== other && boid.isTooClose(other)) {
          velocity = other.position
            .sub(boid.position)
            .normalize()
            .scale(-0.05 * boid.velocity.length())
            .add(boid.velocity);
        } else if (boid !== other && boid.isNear(other)) {
          velocity = velocity.add(other.velocity.scale(0.01));
          posSum = posSum.add(other.position);
          nearCount += 1;
        }
      });
      const nearAverage = posSum.scale(nearCount ? 1 / nearCount : 0);
      velocity = velocity.add(
        nearAverage.sub(boid.position).normalize().scale(0.01)
      );
      boid.velocity = velocity.normalize().scale(SPEED);
    });
    boids.forEach((boid) => {
      boid.position = boid.position.add(boid.velocity.scale(dt));
      boid.position.x = (boid.position.x + this.sceneWidth) % this.sceneWidth;
      boid.position.y = (boid.position.y + this.sceneHeight) % this.sceneHeight;
    });
  }
}
