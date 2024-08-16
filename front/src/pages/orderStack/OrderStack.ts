export type StackObject = {
  size: number;
  weight: number;
  position: number;
};

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

export class OrderStack<T extends StackObject> {
  upperLimit = 0;
  lowerLimit = 0;

  run(arr: T[]) {
    const result = this._run(arr);
    if (!result) {
      return null;
    }
    const objects = result.newGroups.flatMap((group) => {
      let acc = group.position;
      return group.objects.map((obj) => {
        const final = {
          x: acc,
          original: obj,
        };
        acc += obj.size;
        return final;
      });
    });
    return { objects, iterations: result.iterations };
  }

  private _run(arr: T[]) {
    if (arr.length === 0) return { newGroups: [], iterations: 0 };

    let groups = arr
      .map((obj) => Group.from([obj], this.upperLimit, this.lowerLimit))
      .sort((a, b) => a.position - b.position);

    const MAX_ITERATIONS = groups.length + 1;

    for (let i = 0; i < MAX_ITERATIONS; i++) {
      let overlap = false;
      const newGroups: Group<T>[] = [];
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
    return { newGroups: groups, iterations: MAX_ITERATIONS };
  }
}

class Group<T extends StackObject> {
  objects: T[] = [];
  size = 0;
  position = 0;

  constructor(private uppperLimit: number, private lowerLimit: number) {}

  overlaps(other?: Group<T>) {
    if (!other) return false;
    return (
      this.position + this.size > other.position &&
      this.position < other.position + other.size
    );
  }

  static from<T extends StackObject>(objects: T[], upper: number, lower: number) {
    let posSum = 0;
    objects.forEach((obj) => {
      posSum += (obj.position + obj.size / 2) * obj.size * obj.weight;
    });
    const weight = objects.reduce((acc, obj) => acc + obj.size * obj.weight, 0);
    const width = objects.reduce((acc, obj) => acc + obj.size, 0);
    //This is the center of mass
    const cm = posSum / weight;
    //The group will be placed behind the center of mass

    let psum = 0;
    let distSum = 0;
    for (let i = 1; i < objects.length; i++) {
      const obj = objects[i];
      distSum += obj.size;
      psum += distSum * obj.size * obj.weight;
    }

    const x1 = cm - psum / weight - objects[0].size / 2;

    const x = clamp(x1, lower, upper - width);
    const group = new Group<T>(upper, lower);
    group.objects = objects;
    group.size = width;
    group.position = x;
    return group;
  }

  merge(other: Group<T>) {
    const newGroup = Group.from(
      [...this.objects, ...other.objects],
      this.uppperLimit,
      this.lowerLimit
    );
    this.objects = newGroup.objects;
    this.size = newGroup.size;
    this.position = newGroup.position;
  }

  average() {}
}
