export type StackObject = {
  width: number;
  x: number;
  id?: number;
};

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

export class OrderStack {
  upperLimit = 0;
  lowerLimit = 0;
  objects = new Map<number | undefined, StackObject>();
  runingMode: 'force' | 'greedy' | 'greedyBlock' = 'greedyBlock';

  add(obj: StackObject) {
    this.objects.set(obj.id, obj);
  }

  run() {
    const groups = [...this.objects.values()]
      .sort((a, b) => a.x - b.x)
      .map((obj) => Group.from([obj]));

    function merge(groups: Group[]): Group[] {
      if (groups.length <= 1) return groups;
      if (groups.length === 2) {
        const [a, b] = groups;
        if (isOverlapping(a, b)) {
          return [a.merge(b)];
        }
        return groups;
      }
      const [head, ...tail] = groups;
      const tailMerged = merge(tail);
      const tryMergeHead = merge([head, tailMerged[0]]);
      if (tryMergeHead.length === 1) {
        return merge([...tryMergeHead, ...tailMerged.slice(1)]);
      }
      return [head, ...tailMerged];
    }

    return merge(groups).flatMap((group) => {
      return group.objects.map((obj, i) => {
        return {
          x: clamp(group.x + obj.width * i, this.lowerLimit, this.upperLimit),
          original: obj,
        };
      });
    });
  }
}

function isOverlapping(a?: StackObject, b?: StackObject) {
  if (a === b || !a || !b) return false;
  return a.x + a.width > b.x && a.x < b.x + b.width;
}

class Group implements StackObject {
  objects: StackObject[] = [];
  width = 0;
  x = 0;

  static from(objects: StackObject[]) {
    const average =
      objects.reduce((acc, obj) => acc + obj.x + obj.width / 2, 0) / objects.length;
    const width = objects.reduce((acc, obj) => acc + obj.width, 0);
    const x = average - width / 2;
    const group = new Group();
    group.objects = objects;
    group.width = width;
    group.x = x;
    return group;
  }

  add(obj: StackObject) {
    this.objects.push(obj);
  }

  merge(other: Group) {
    return Group.from([...this.objects, ...other.objects]);
  }

  average() {}
}
