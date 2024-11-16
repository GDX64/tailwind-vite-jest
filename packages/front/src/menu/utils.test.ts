import { Item } from './interfaces';
import { findSelected, findSelectedPath, MenuTree } from './utils';

describe('findSelected', () => {
  it('simple find path', () => {
    const items = setupItems();
    const path = findSelectedPath((x) => x.text === 'hi', items);
    expect(path).toEqual([1, 1, 0]);
  });
  it('simple find', () => {
    const items = setupItems();
    const path = findSelectedPath((x) => x.text === 'hi', items);
    if (!path) throw Error('no path found');
    expect(findSelected(path, items)?.text).toEqual('hi');
  });

  it('tests navigation down', () => {
    const items = setupItems();
    const menuTree = new MenuTree(items);
    menuTree.goDown();
    expect(menuTree.path).toEqual([0]);
    menuTree.goDown();
    expect(menuTree.path).toEqual([1]);
    menuTree.goDown();
    expect(menuTree.path).toEqual([2]);
    menuTree.goDown();
    expect(menuTree.path).toEqual([2]);
  });

  it('tests navigation', () => {
    const items = setupItems();
    const menuTree = new MenuTree(items);
    menuTree.goDown();
    expect(menuTree.path).toEqual([0]);
    menuTree.goRight();
    expect(menuTree.path).toEqual([0]);
    menuTree.goDown();
    menuTree.goRight();
    expect(menuTree.path).toEqual([1, 0]);
    menuTree.goDown();
    expect(menuTree.path).toEqual([1, 1]);
    menuTree.goRight();
    expect(menuTree.path).toEqual([1, 1, 0]);
    menuTree.goRight();
    expect(menuTree.path).toEqual([1, 1, 0]);
    menuTree.goLeft();
    expect(menuTree.path).toEqual([1, 1]);
    menuTree.goUp();
    expect(menuTree.path).toEqual([1, 0]);
    menuTree.goUp();
    expect(menuTree.path).toEqual([1, 0]);
  });
});

function setupItems() {
  return [item(), item([item(), item([item([], 'hi')])]), item()];
}

function item(items?: Item[], text = ''): Item {
  return { text, items };
}
