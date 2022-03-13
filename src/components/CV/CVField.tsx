import { defineComponent, render } from 'vue';

export const Field = defineComponent({
  setup() {
    // return () => <div>Hello</div>;
  },
  render() {
    return <div onClick={() => console.log('hello')}>Hello</div>;
  },
});
