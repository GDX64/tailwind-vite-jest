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
