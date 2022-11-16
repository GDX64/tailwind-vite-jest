// example custom dom renderer
import { createRenderer } from 'solid-js/universal';
import * as PIXI from 'pixi.js';
import { BitmapText } from 'pixi.js';
export * from './jsx-runtime';

export const {
  render,
  effect,
  memo,
  createComponent,
  createElement,
  createTextNode,
  insertNode,
  insert,
  spread,
  setProp,
  mergeProps,
} = createRenderer<PIXI.Container>({
  createElement(kind) {
    if (kind === 'graphics') {
      return new PIXI.Graphics();
    }
    if (kind === 'text') {
      return new PIXI.Text();
    }
    return new PIXI.Container();
  },
  createTextNode(value: string) {
    return new PIXI.Text(value);
  },
  replaceText(textNode, value) {
    const txt = textNode as PIXI.Text;
    txt.text = value;
  },
  setProperty(node: any, name: any, value: any) {
    console.log(node, name, value);
    if (name in node) {
      node[name] = value;
    }
    // if (name === 'style') Object.assign(node.style, value);
    // else if (name.startsWith('on')) node[name.toLowerCase()] = value;
    // else if (PROPERTIES.has(name)) node[name] = value;
    // else node.setAttribute(name, value);
  },
  insertNode(parent, node, anchor) {
    parent.addChild(node);
  },
  isTextNode(node) {
    return node instanceof PIXI.Text;
  },
  removeNode(parent, node) {
    parent.removeChild(node);
  },
  getParentNode(node) {
    return node.parent;
  },
  getFirstChild(node) {
    return node.children[0] as PIXI.Container;
  },
  getNextSibling(node) {
    return node.parent?.children[0] as PIXI.Container;
  },
});

// Forward Solid control flow
export {
  For,
  Show,
  Suspense,
  SuspenseList,
  Switch,
  Match,
  Index,
  ErrorBoundary,
} from 'solid-js';
