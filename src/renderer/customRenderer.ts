import { createRenderer, h, defineComponent, compile } from 'vue';

class Node {
  id: number;
  children: Node[];
  parent: null | Node;
  text: string;
  root: boolean;

  constructor({
    id = Math.random(),
    children = [] as Node[],
    parent = null as null | Node,
    text = '',
    root = false,
  } = {}) {
    this.id = id;
    this.children = children;
    this.parent = parent;
    this.text = text;
    this.root = root;
  }

  appendChild(node: Node) {
    this.children.push(node);
  }

  removeChild(node: Node) {
    this.children = this.children.filter((item) => item !== node);
  }
}

const view = defineComponent({
  inheritAttrs: false,
  name: 'view',
  render() {
    return h('view', this.$attrs, this.$slots?.default?.() || []);
  },
});
const root = new Node({ root: true });
createCustom(new Node({ parent: root }));

function createCustom(root: Node) {
  const { createApp } = createRenderer<Node, Node>({
    insert(el, parent, anchor) {
      console.log('====insert====');
      el.parent = parent;
      parent.appendChild(el);
    },
    createComment() {
      console.log('============comment======');
      return new Node();
    },
    createElement(type) {
      console.log('==============creating=============', type);
      return new Node();
    },
    createText(text) {
      console.log({ addText: text }, '======================');
      const node = new Node();
      node.text = text;
      return node;
    },
    nextSibling(el) {
      console.log('======sibling=====');
      const index = el.parent?.children.findIndex((item) => item.id === el.id);
      return index == null ? null : el.parent?.children[index] ?? null;
    },
    parentNode(node) {
      console.log('======parent=====');
      return node.parent;
    },
    patchProp(node, key, value) {
      console.log('=====patch====');
    },
    remove(el) {
      console.log('===remove===');
      el.parent?.removeChild(el);
    },
    setElementText(el, txt) {
      console.log('setText', txt);
      el.text = txt;
    },
    setText() {
      console.log('setText');
    },
  });

  const app = createApp({
    components: { view },
    data() {
      return { msg: 'hello', show: true };
    },
    render: compile(`
    <view :prop-hi="'thiskey'">
      <view v-if="show">
        {{msg}}
      </view>
    </view>`),
  });
  const inst = app.mount(root) as any;

  setTimeout(() => (inst.msg = 'Hi'));
  setTimeout(() => (inst.show = false), 10);
  setTimeout(() => (inst.show = true), 20);
}
