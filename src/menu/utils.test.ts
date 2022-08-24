import { Item } from './interfaces';
import { findSelected, findSelectedPath } from './utils';

describe('findSelected', () => {
  it('simple find path', () => {
    const items = [item(), item([item(), item([item([], 'hi')])]), item()];
    const path = findSelectedPath((x) => x.text === 'hi', items);
    expect(path).toEqual([1, 1, 0]);
  });
  it('simple find', () => {
    const items = [item(), item([item(), item([item([], 'hi')])]), item()];
    const path = findSelectedPath((x) => x.text === 'hi', items);
    if (!path) throw Error('no path found');
    expect(findSelected(path, items)?.text).toEqual('hi');
  });
});

function item(items?: Item[], text = ''): Item {
  return { text, items };
}
