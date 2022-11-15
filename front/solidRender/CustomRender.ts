// example custom dom renderer
import { createRenderer } from 'solid-js/universal';

const PROPERTIES = new Set(['className', 'textContent']);

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
} = createRenderer({
  createElement(string) {
    return document.createElement(string);
  },
  createTextNode(value: string) {
    return document.createTextNode(value) as any;
  },
  replaceText(textNode, value) {
    textNode.data = value;
  },
  setProperty(node, name, value) {
    if (name === 'style') Object.assign(node.style, value);
    else if (name.startsWith('on')) node[name.toLowerCase()] = value;
    else if (PROPERTIES.has(name)) node[name] = value;
    else node.setAttribute(name, value);
  },
  insertNode(parent, node, anchor) {
    parent.insertBefore(node, anchor);
  },
  isTextNode(node) {
    return node.type === 3;
  },
  removeNode(parent, node) {
    parent.removeChild(node);
  },
  getParentNode(node) {
    return node.parentNode;
  },
  getFirstChild(node) {
    return node.firstChild;
  },
  getNextSibling(node) {
    return node.nextSibling;
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
