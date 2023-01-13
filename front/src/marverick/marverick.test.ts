import { signal, computed, root } from '@maverick-js/signals';
import { range } from 'ramda';

describe('tree sum', () => {
  test('simple sum', () => {
    root((dispose) => {
      const arr = [...Array(15)].map((_, v) => v);
      const tree = Tree.fromArr(arr, sumTreeFn);
      expect(tree.value).toBe(105);
      dispose();
    });
  });
});

function sumTreeFn(left: number | null, right: number | null) {
  return (left ?? 0) + (right ?? 0);
}

type Agregator<T> = (x: T | null, y: T | null) => T;

class Tree<T> {
  constructor(
    public left: Tree<T> | null,
    public right: Tree<T> | null,
    public value: T,
    public agregator: Agregator<T>,
    public size: number
  ) {}

  sliceValue(begin: number, end: number) {}

  static value<T>(x: T, agregator: Agregator<T>) {
    return new Tree(null, null, x, agregator, 0);
  }

  static fromArr<T>(arr: T[], agregator: (x: T | null, y: T | null) => T) {
    const powerOf2 = Math.ceil(Math.log2(arr.length));
    const diff = 2 ** powerOf2 - arr.length;
    const completedArr: (T | null)[] = [...arr, ...Array(diff).fill(null)];
    function buildTree(arr: (T | null)[]): Tree<T> {
      if (arr.length <= 2) {
        return Tree.value(agregator(arr[0], arr[1]), agregator);
      }
      const left = buildTree(arr.slice(0, Math.floor(arr.length / 2)));
      const right = buildTree(arr.slice(Math.floor(arr.length / 2)));
      return new Tree(
        left,
        right,
        agregator(left.value, right.value),
        agregator,
        arr.length
      );
    }
    return buildTree(completedArr);
  }
}
