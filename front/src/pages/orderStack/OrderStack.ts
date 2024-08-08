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

  add(obj: StackObject) {
    this.objects.set(obj.id, obj);
  }

  run() {
    const result = this._run();
    if (!result) {
      return null;
    }
    const objects = result.newGroups.flatMap((group) => {
      let acc = group.x;
      return group.objects.map((obj, i) => {
        const final = {
          x: acc,
          original: obj,
        };
        acc += obj.width;
        return final;
      });
    });
    return { objects, iterations: result.iterations };
  }

  private _run() {
    let groups = [...this.objects.values()]
      .sort((a, b) => a.x - b.x)
      .map((obj) => Group.from([obj], this.upperLimit, this.lowerLimit));

    const MAX_ITERATIONS = groups.length + 1;

    for (let i = 0; i < MAX_ITERATIONS; i++) {
      let overlap = false;
      const newGroups: Group[] = [];
      for (let i = 0; i < groups.length; i += 1) {
        const currentNewGroup = newGroups.at(-1);
        if (!currentNewGroup) {
          newGroups.push(groups[i]);
          continue;
        }
        if (currentNewGroup.overlaps(groups[i])) {
          overlap = true;
          currentNewGroup.merge(groups[i]);
        } else {
          newGroups.push(groups[i]);
        }
      }
      if (!overlap) {
        return { newGroups, iterations: i };
      }
      groups = newGroups;
    }
    return null;
  }
}

class Group implements StackObject {
  objects: StackObject[] = [];
  width = 0;
  x = 0;

  constructor(private uppperLimit: number, private lowerLimit: number) {}

  overlaps(other?: Group) {
    if (!other) return false;
    return this.x + this.width > other.x && this.x < other.x + other.width;
  }

  static from(objects: StackObject[], upper: number, lower: number) {
    const posSum = objects.reduce(
      (acc, obj) => acc + (obj.x + obj.width / 2) * obj.width,
      0
    );
    const L = objects.length;
    const width = objects.reduce((acc, obj) => acc + obj.width, 0);
    let x = posSum / width - width / 2;
    x = clamp(x, lower, upper - width);
    const group = new Group(upper, lower);
    group.objects = objects;
    group.width = width;
    group.x = x;
    return group;
  }

  merge(other: Group) {
    const newGroup = Group.from(
      [...this.objects, ...other.objects],
      this.uppperLimit,
      this.lowerLimit
    );
    this.objects = newGroup.objects;
    this.width = newGroup.width;
    this.x = newGroup.x;
  }

  average() {}
}
