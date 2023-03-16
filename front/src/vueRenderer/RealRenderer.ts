import { createRenderer, Component, reactive, watchEffect } from 'vue';
import { renderRough } from './CartesianCharts';
import { ChartNode, ChartType, GroupNode, TextNode, RectNode, Stage } from './interfaces';

function createText(txt: string): TextNode {
  return { type: ChartType.TEXT, data: { color: 'black', text: txt }, events: {} };
}

function createGroup(): GroupNode {
  return {
    type: ChartType.GROUP,
    data: { matrix: new DOMMatrix() },
    children: [],
    events: {},
  };
}

function createSquare(): RectNode {
  return {
    type: ChartType.RECT,
    data: { color: 'black', height: 100, width: 100, x: 0, y: 0 },
    events: {},
  };
}

function appRenderer(canvas: HTMLCanvasElement) {
  const ctx = canvas.getContext('2d');
  const { createApp } = createRenderer<ChartNode, ChartNode>({
    createComment(text) {
      return createText(text);
    },
    createElement(type, isSVG, isCustomizedBuiltIn, vnodeProps) {
      // console.log('create', type);
      if (type === ChartType.TEXT) {
        return createText('txt');
      }
      if (type === ChartType.RECT) {
        return createSquare();
      }
      return createGroup();
    },
    createText(text) {
      // console.log('create text');
      return createText(text);
    },
    insert(el, parent, anchor) {
      parent.children?.push(el);
    },
    nextSibling(node) {
      return null;
    },
    parentNode(node) {
      return node?.parent ?? null;
    },
    patchProp(
      _el,
      key,
      prevValue,
      nextValue,
      isSVG,
      prevChildren,
      parentComponent,
      parentSuspense,
      unmountChildren
    ) {
      const el = reactive(_el);
      if (key.startsWith('on')) {
        const eventName = key.slice(2).toLowerCase();
        canvas.removeEventListener(eventName, prevValue);
        console.log(eventName);
        canvas.addEventListener(eventName, (event) => {
          if (
            event instanceof MouseEvent &&
            el.path &&
            ctx?.isPointInPath(el.path, event.offsetX, event.offsetY)
          ) {
            nextValue(event);
          }
        });
        (el.events as any)[key] = nextValue;
      } else {
        console.log(key, nextValue);
        (el.data as any)[key] = nextValue;
      }
    },
    remove(el) {
      if (el.parent?.children) {
        el.parent.children = el.parent.children.filter((item) => item !== el);
      }
    },
    setElementText(node, text) {
      if (node.type === ChartType.TEXT) {
        node.data.text = text;
      }
    },
    setText(node, text) {
      if (node.type === ChartType.TEXT) {
        node.data.text = text;
      }
    },
  });
  return { createApp };
}

export function createRoot(canvas: HTMLCanvasElement, comp: Component) {
  const root = reactive(createGroup());
  const stage: Stage = { canvas, root };
  const app = appRenderer(canvas).createApp(comp);
  app.mount(root);
  const handler = watchEffect(() => {
    renderRough(stage);
  });
  return () => {
    app.unmount();
    handler();
  };
}
