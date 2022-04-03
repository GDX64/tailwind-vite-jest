import { defineComponent, h } from 'vue';

export function processLinks(text: string) {
  const linkRegex = /\[(.*?)\]\((.*?)\)/g;
  const matches = [...text.matchAll(linkRegex)];
  const splited = text.split(/\[.*?\]\(.*?\)/g);
  return splited.flatMap((text, index) =>
    [text, matches[index]].filter((item) => item != null)
  );
}

export default defineComponent({
  props: { text: String },
  setup(props) {
    console.log('text', props.text);
    return () => {
      const arr = processLinks(props.text ?? '').map((item) => {
        if (typeof item === 'string') {
          return h('span', null, item);
        }
        const [, name, link] = item;
        return h('a', { href: link }, name);
      });
      return h('span', null, arr);
    };
  },
});
