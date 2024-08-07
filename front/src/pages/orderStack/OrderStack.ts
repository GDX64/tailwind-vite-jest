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

  add(obj: StackObject) {
    this.objects.set(obj.id, obj);
  }

  run() {
    const arr = Array.from(this.objects.values());
    arr.sort((a, b) => a.x - b.x);
    arr.forEach((obj, index) => {
      if (index === 0) {
        obj.calculatedX = clamp(obj.x, this.lowerLimit, this.upperLimit - obj.width);
      } else {
        const prevObj = arr[index - 1];
        const prevRight = prevObj.calculatedX + prevObj.width;
        const overlaps = prevRight > obj.x;
        if (overlaps) {
          obj.calculatedX = prevRight;
        } else {
          obj.calculatedX = obj.x;
        }
      }
    });
  }
}
