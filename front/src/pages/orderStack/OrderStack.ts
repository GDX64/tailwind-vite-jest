export type StackObject = {
  width: number;
  x: number;
  calculatedX: number;
  id: number;
};

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

export class OrderStack {
  upperLimit = 0;
  lowerLimit = 0;
  objects = new Map<number, StackObject>();
  runingMode: 'force' | 'greedy' | 'greedyBlock' = 'greedyBlock';

  add(obj: StackObject) {
    this.objects.set(obj.id, obj);
  }

  hitsUpperLimit(obj: StackObject) {
    return obj.calculatedX + obj.width > this.upperLimit;
  }

  hitsLowerLimit(obj: StackObject) {
    return obj.calculatedX < this.lowerLimit;
  }

  runForce() {
    const arr = Array.from(this.objects.values());
    arr.sort((a, b) => a.x - b.x);

    arr.forEach((obj) => {
      obj.calculatedX = obj.x;
    });

    for (let i = 0; i < 50; i++) {
      let someOverlapping = false;
      arr.forEach((obj, index) => {
        const overlap = overlaping(obj, arr[index - 1]);
        if (overlap > 1) {
          someOverlapping = true;
          const [a, b] = leftRight(obj, arr[index - 1]);
          a.calculatedX -= Math.max(0.5, overlap / 2);
          b.calculatedX += Math.max(0.5, overlap / 2);
        }
        if (this.hitsUpperLimit(obj)) {
          someOverlapping = true;
          obj.calculatedX = this.upperLimit - obj.width;
        }
        if (this.hitsLowerLimit(obj)) {
          someOverlapping = true;
          obj.calculatedX = this.lowerLimit;
        }
      });
      if (!someOverlapping) {
        console.log('iterations', i);
        break;
      }
    }
    this.runGreedy(arr);
  }

  init() {
    this.objects.forEach((obj) => {
      obj.calculatedX = obj.x;
    });
  }

  run() {
    this.init();
    if (this.runingMode === 'force') {
      this.runForce();
    } else if (this.runingMode === 'greedyBlock') {
      this.runGreedyBlock();
    } else {
      this.runGreedy();
    }
  }

  runGreedyBlock() {
    const arr = this.runGreedy();
    const blocks: StackObject[][] = [];
    console.log(arr.map((obj) => obj.calculatedX));
    arr.forEach((obj) => {
      const currentBlock = blocks.at(-1);
      if (!currentBlock) {
        blocks.push([obj]);
        return;
      }
      const lastBlockElement = currentBlock.at(-1);
      if (!lastBlockElement) return;
      const blockRight = lastBlockElement.calculatedX + lastBlockElement.width;
      if (blockRight === obj.calculatedX) {
        currentBlock.push(obj);
      } else {
        blocks.push([obj]);
      }
    });

    blocks.forEach((block) => {
      const last = block.at(-1);
      if (last) {
        const lastDisplacement = last.calculatedX - last.x;
        const dividedDisplacement = lastDisplacement / 2;
        block.forEach((obj) => {
          obj.calculatedX -= dividedDisplacement;
        });
      }
    });
  }

  runGreedy(arr: StackObject[] = Array.from(this.objects.values())) {
    arr.sort((a, b) => a.calculatedX - b.calculatedX);
    arr.forEach((obj, index) => {
      if (index === 0) {
        obj.calculatedX = clamp(
          obj.calculatedX,
          this.lowerLimit,
          this.upperLimit - obj.width
        );
      } else {
        const prevObj = arr[index - 1];
        const prevRight = prevObj.calculatedX + prevObj.width;
        const overlaps = prevRight > obj.calculatedX;
        if (overlaps) {
          obj.calculatedX = prevRight;
        } else {
          obj.calculatedX = obj.calculatedX;
        }
      }
    });
    return arr;
  }
}

function overlaping(a?: StackObject, b?: StackObject) {
  if (a === b || !a || !b) return 0;
  const isOverlapping =
    a.calculatedX + a.width > b.calculatedX && a.calculatedX < b.calculatedX + b.width;
  if (!isOverlapping) return 0;

  const [left, right] = leftRight(a, b);
  return left.calculatedX + left.width - right.calculatedX;
}

function leftRight(a: StackObject, b: StackObject) {
  return a.calculatedX > b.calculatedX ? [b, a] : [a, b];
}
