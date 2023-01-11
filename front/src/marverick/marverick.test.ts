import { signal, computed, root } from '@maverick-js/signals';
import { memoizeWith } from 'ramda';

describe('tree sum', () => {
  test('simple sum', () => {
    root((dispose) => {
      const arr = [...Array(15)].map((_, v) => signal(v));
      const { tree, searchSlice } = makeFrom(arr);
      expect(tree.value()).toBe(105);
      arr[0].set(10);
      expect(tree.value()).toBe(115);
      const slice = searchSlice([2, 4], tree);
      console.log(slice);
      expect(slice).toBeTruthy();
      dispose();
    });
  });
});

type Fn<T> = () => T;
function sumTreeFn(left?: Fn<number>, right?: Fn<number>) {
  return computed(() => {
    return (left?.() ?? 0) + (right?.() ?? 0);
  });
}

interface Tree {
  value: Fn<number>;
  range: [number, number];
  left?: Tree;
  right?: Tree;
}

function makeFrom(arr: Fn<number>[]) {
  function searchSlice(range: [number, number], tree?: Tree): Tree | undefined {
    if (!tree) {
      return undefined;
    }
    if (tree.range[0] === range[0] && tree.range[1] === range[1]) {
      return tree;
    }
    if (range[0] < tree.range[0]) {
      return undefined;
    }
    if (range[0] === tree.range[0]) {
      return searchSlice(range, tree.left);
    }
    return searchSlice(range, tree.right);
  }

  function buildTree(range: [number, number]): Tree {
    const elements = range[1] - range[0];
    if (elements === 1) {
      const value = sumTreeFn(arr[range[0]]);
      return {
        value,
        range,
      };
    }
    const toRealRange = (virtual: number[]): [number, number] => [
      virtual[0] + range[0],
      virtual[1] + range[0],
    ];
    const twoPower = Math.log2(elements);
    let virtualRange1, virtualRange2;
    if (Number.isInteger(twoPower)) {
      virtualRange1 = [0, elements / 2];
      virtualRange2 = [elements / 2, elements];
    } else {
      const divider = 2 ** Math.floor(twoPower);
      virtualRange1 = [0, divider];
      virtualRange2 = [divider, elements];
    }
    const left = buildTree(toRealRange(virtualRange1));
    const right = buildTree(toRealRange(virtualRange2));
    return {
      value: sumTreeFn(left.value, right.value),
      range,
      left,
      right,
    };
  }

  const tree = buildTree([0, arr.length]);
  return { tree, searchSlice };
}
