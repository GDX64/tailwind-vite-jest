import { render } from '@solidRender/CustomRender';

const CountingComponent = () => {
  return <div>hello</div>;
};

export function startSolidApp(el: HTMLElement) {
  const r = render(() => <CountingComponent />, el);
  return r;
}
