import { Item } from './interfaces';
import { findSelectedPath } from './utils';

describe('findSelected', () => {
  it('simple find', () => {
    const items = [item(), item([item(), item([item([], 'hi')])]), item()];
    const path = findSelectedPath((x) => x.text === 'hi', items);
    expect(path).toEqual([1, 1, 0]);
  });
});

function item(items?: Item[], text = ''): Item {
  return { text, items };
}
