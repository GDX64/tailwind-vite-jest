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
    let groups = [...this.objects.values()]
      .sort((a, b) => a.x - b.x)
      .map((obj) => Group.from([obj], this.upperLimit, this.lowerLimit));

    const MAX_ITERATIONS = 100;

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
        console.log('Iterations', i);
        break;
      }
      groups = newGroups;
    }

    return groups.flatMap((group) => {
      return group.objects.map((obj, i) => {
        return {
          x: clamp(group.x + obj.width * i, this.lowerLimit, this.upperLimit),
          original: obj,
        };
      });
    });
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
    const average =
      objects.reduce((acc, obj) => acc + obj.x + obj.width / 2, 0) / objects.length;
    const width = objects.reduce((acc, obj) => acc + obj.width, 0);
    let x = average - width / 2;
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
