import { range } from 'ramda';
import { animationFrames } from 'rxjs';
import { createSignal, JSX, For, onCleanup, batch } from 'solid-js';
import { render } from 'solid-js/web';

const CountingComponent = () => {
  const sigs = range(0, 100).map(() => createSignal(1));
  const sub = animationFrames().subscribe(() => {
    batch(() => {
      sigs.forEach(([, set]) => {
        set(Math.random());
      });
    });
  });
  onCleanup(() => sub.unsubscribe());
  return (
    <div class="grid grid-cols-5">
      <For each={sigs}>
        {(item) => (
          <div class={item[0]() > 0.5 ? 'text-red-500' : 'text-green-400'}>
            {item[0]()}
          </div>
        )}
      </For>
    </div>
  );
};

export function startSolidApp(el: HTMLElement) {
  const r = render(() => <CountingComponent />, el);
  return r;
}
