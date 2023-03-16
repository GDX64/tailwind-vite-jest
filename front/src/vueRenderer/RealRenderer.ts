import { createRenderer, Component, reactive, watchEffect } from 'vue';
import { renderRough, Geometry } from './CartesianCharts';
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

export const { createApp, render } = createRenderer<ChartNode, ChartNode>({
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
    el,
    key,
    prevValue,
    nextValue,
    isSVG,
    prevChildren,
    parentComponent,
    parentSuspense,
    unmountChildren
  ) {
    if (key.startsWith('on')) {
      (el.events as any)[key] = nextValue;
    }
    console.log(key, nextValue);
    (el.data as any)[key] = nextValue;
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

export function createRoot(canvas: HTMLCanvasElement, comp: Component) {
  const root = reactive(createGroup());
  const stage: Stage = { canvas, root };
  const app = createApp(comp);
  app.mount(root);
  let geo = renderRough(stage);
  const handler = watchEffect(() => {
    geo = renderRough(stage);
  });
  canvas.addEventListener('click', (event) => {
    function traverse(geo: Geometry) {
      console.log('traversing');
      if (geo.path && geo.events?.onClick) {
        if (
          canvas.getContext('2d')?.isPointInPath(geo.path, event.offsetX, event.offsetY)
        ) {
          geo.events.onClick();
        }
      }
      geo.children.forEach(traverse);
    }
    traverse(geo);
  });
  return () => {
    app.unmount();
    handler();
  };
}
