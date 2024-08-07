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
  runingMode: 'force' | 'greedy' = 'force';

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

  run() {
    if (this.runingMode === 'force') {
      this.runForce();
    } else {
      this.runGreedy();
    }
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
