import { signal, computed, root } from '@maverick-js/signals';
import { range } from 'ramda';

describe('tree sum', () => {
  test('simple sum', () => {
    const arr = [...Array(15)].map((_, v) => v);
    const tree = Tree.fromArr(arr, sumTreeFn);
    expect(tree.value).toBe(105);
  });
  test('simple slice', () => {
    const arr = [...Array(7)].map((_, v) => v);
    const tree = Tree.fromArr(arr, sumTreeFn);
    //1,2
    expect(tree.sliceValue(1, 3)).toBe(3);
    //0,1,2
    expect(tree.sliceValue(0, 3)).toBe(3);
    //2,3
    expect(tree.sliceValue(2, 4)).toBe(5);
    //2,3,4
    expect(tree.sliceValue(2, 5)).toBe(9);
    //3,4
    expect(tree.sliceValue(3, 5)).toBe(7);
    //3,4,5,6,null
    expect(tree.sliceValue(3, 7)).toBe(18);
    //6,null
    expect(tree.sliceValue(6, 7)).toBe(6);
  });
  test('random slice', () => {
    const N = 500;
    const arr = [...Array(N)].map((_, v) => v);
    const tree = Tree.fromArr(arr, sumTreeFn);
    const rand = () => Math.floor(Math.random() * N);
    const [begin, end] = [rand(), rand()].sort((a, b) => a - b);
    expect(tree.sliceValue(begin, end)).toBe(
      arr.slice(begin, end).reduce((a, b) => a + b)
    );
  });
  test('minmax slice', () => {
    const N = 100;
    const rand = () => Math.floor(Math.random() * N);
    const arr = [...Array(N)].map(rand).map((v) => ({ min: v, max: v, sum: v }));
    const tree = Tree.fromArr(arr, (v1, v2) => {
      if (!v1 || !v2) {
        return v1 ?? v2 ?? { min: Infinity, max: -Infinity, sum: 0 };
      }
      return {
        min: Math.min(v1.min, v2.min),
        max: Math.max(v2.max, v1.max),
        sum: v1.sum + v2.sum,
      };
    });
    const [begin, end] = [rand(), rand()].sort((a, b) => a - b);
    const result = tree.sliceValue(begin, end);
    console.log(result, { begin, end });
    expect(result).toEqual(arr.slice(begin, end).reduce(tree.agregator));
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

  asLeft(right: Tree<T>, size: number) {
    return new Tree(
      this,
      right,
      this.agregator(this.value, right.value),
      this.agregator,
      size
    );
  }

  sliceValue(begin: number, end = this.size): T | null {
    if ((begin === 0 && end >= this.size) || this.size === 0) {
      return this.value;
    }
    if (end - begin <= 0) {
      return null;
    }
    let leftSlice;
    if (begin < this.size / 2) {
      leftSlice = this.left?.sliceValue(begin, Math.min(end, this.size / 2));
    } else {
      leftSlice = null;
    }
    let rightSlice;
    if (end > this.size / 2) {
      rightSlice = this.right?.sliceValue(
        Math.max(0, begin - this.size / 2),
        end - this.size / 2
      );
    } else {
      rightSlice = null;
    }
    return this.agregator(rightSlice ?? null, leftSlice ?? null);
  }

  static value<T>(x: T, agregator: Agregator<T>) {
    return new Tree(null, null, x, agregator, 0);
  }

  static fromArr<T>(arr: T[], agregator: Agregator<T>) {
    const powerOf2 = Math.ceil(Math.log2(arr.length));
    const diff = 2 ** powerOf2 - arr.length;
    const completedArr: (T | null)[] = [...arr, ...Array(diff).fill(null)];
    function buildTree(arr: (T | null)[]): Tree<T> {
      if (arr.length <= 2) {
        const left = Tree.value(agregator(arr[0], null), agregator);
        const right = Tree.value(agregator(null, arr[1]), agregator);
        return left.asLeft(right, 2);
      }
      const left = buildTree(arr.slice(0, Math.floor(arr.length / 2)));
      const right = buildTree(arr.slice(Math.floor(arr.length / 2)));
      return left.asLeft(right, arr.length);
    }
    return buildTree(completedArr);
  }
}
