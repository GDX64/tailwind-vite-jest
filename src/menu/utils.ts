import { Item } from './interfaces';

export function findSelectedPath(
  target: (x: Item) => boolean,
  items: Item[]
): number[] | null {
  for (let i = 0; i < items.length; i++) {
    const item = items[i];
    if (target(item)) {
      return [i];
    }
    if (item.items) {
      const path = findSelectedPath(target, item.items);
      if (path) {
        return [i, ...path];
      }
    }
  }
  return null;
}

export function findSelected(path: number[], items: (Item | undefined)[]): Item | null {
  const [head, ...tail] = path;
  if (tail.length === 0 && items[head]) {
    return items[head]!;
  }
  if (head != null && items[head]?.items) {
    return findSelected(tail, items[head]!.items!);
  }
  return null;
}

class MenuTree {
  path: number[] = [];
  constructor(private items: Item[]) {}
}
