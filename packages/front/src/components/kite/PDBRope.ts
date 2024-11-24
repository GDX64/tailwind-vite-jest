import { vec3 } from 'gl-matrix';

const FIXED_MASS = 1000_000_000;

export class PBDRope {
  nodesPos: vec3[] = [];
  private nodesV: vec3[] = [];
  private masses: number[] = [];
  private nodeLength = 0.1;
  private force = vec3.create();
  private constructor() {}

  static fromLength(
    length: number,
    nodeLen: number,
    mass: number,
    initial: vec3
  ): PBDRope {
    const rope = new PBDRope();
    const N = Math.ceil(length / nodeLen);
    for (let i = 0; i < N; i++) {
      const delta = vec3.fromValues(0, -i * nodeLen, 0);
      const pos = vec3.clone(initial);
      vec3.add(pos, pos, delta);
      rope.nodesPos.push(pos);
      rope.nodesV.push(vec3.create());
      rope.masses.push(mass);
    }
    rope.nodeLength = nodeLen;
    return rope;
  }

  updateFirstPosition(pos: vec3) {
    this.nodesPos[0] = pos;
    this.masses[0] = FIXED_MASS;
  }

  updateLastPosition(pos: vec3) {
    this.nodesPos[this.nodesPos.length - 1] = pos;
    this.masses[this.nodesPos.length - 1] = FIXED_MASS;
  }

  setConstForce(force: vec3) {
    this.force = force;
  }

  evolve(dt: number) {
    const force = this.force;
    const l0 = this.nodeLength;
    const nodes = this.nodesPos;
    const initialPositions = nodes.map((v) => vec3.clone(v));
    for (let i = 0; i < nodes.length; i++) {
      if (this.masses[i] === FIXED_MASS) {
        continue;
      }
      const nodePos = nodes[i];
      const nodeV = this.nodesV[i];
      const nodeDelta = vec3.create();
      //first we update the velocity
      nodeV[0] += force[0] * dt;
      nodeV[1] += force[1] * dt;
      nodeV[2] += force[2] * dt;
      //then we update the position as if there were no constraints
      nodeDelta[0] = nodeV[0] * dt;
      nodeDelta[1] = nodeV[1] * dt;
      nodeDelta[2] = nodeV[2] * dt;
      vec3.add(nodePos, nodePos, nodeDelta);
    }

    //now we apply the constraints
    for (let i = 0; i < nodes.length - 1; i++) {
      const thisNode = nodes[i];
      const nextNode = nodes[i + 1];
      const thisMass = this.masses[i];
      const nextMass = this.masses[i + 1];

      //diff is a vector pointing from thisNode to nextNode
      const diff = vec3.create();
      vec3.subtract(diff, nextNode, thisNode);
      const diffLen = vec3.length(diff);
      if (diffLen === 0 || isNaN(diffLen)) {
        continue;
      }
      const deltaLen = diffLen - l0;

      const thisDisplacement = (nextMass / (thisMass + nextMass)) * deltaLen;
      const nextDisplacement = (thisMass / (thisMass + nextMass)) * deltaLen;

      const diffNorm = vec3.normalize(vec3.create(), diff);

      //move thisNode and nextNode in opposite directions
      const thisAdjustVector = vec3.scale(vec3.create(), diffNorm, thisDisplacement);
      const nextAdjustVector = vec3.scale(vec3.create(), diffNorm, nextDisplacement);

      vec3.add(thisNode, thisNode, thisAdjustVector);
      vec3.sub(nextNode, nextNode, nextAdjustVector);
    }

    //the last step is to update the velocities
    for (let i = 0; i < nodes.length; i++) {
      const initialPos = initialPositions[i];
      const nodePos = nodes[i];
      const nodeV = this.nodesV[i];
      vec3.subtract(nodeV, nodePos, initialPos);
      vec3.scale(nodeV, nodeV, 1 / dt);
    }
  }
}
