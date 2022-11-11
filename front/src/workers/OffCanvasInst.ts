import {
  animationFrames,
  of,
  defer,
  map,
  Subject,
  combineLatest,
  BehaviorSubject,
  tap,
} from 'rxjs';
import { canvasRendering, TableEl } from './CanvasRendering';
import * as PIXI from 'pixi.js';
export type MousePos = null | [number, number];
export function createOffCanvasInst(off: OffscreenCanvas) {
  const ctx = getContext2D(off);

  const mousePos$ = new BehaviorSubject(null as MousePos);
  return {
    mousePos(pos: MousePos) {
      mousePos$.next(pos);
      return of(true);
    },
    pixi() {
      new PIXI.Application({ view: off as any, backgroundColor: 0xff0000 });
      return of(true);
    },
    startCanvas() {
      const animated = combineLatest([mousePos$, animationFrames()]);
      return animated.pipe(
        tap({
          unsubscribe: () => console.log('unsub frames'),
          subscribe: () => console.log('sub frames'),
        }),
        map(([mousePos]) => {
          canvasRendering(createData(), ctx);
          mousePos && ctx.fillRect(mousePos[0], mousePos[1], 10, 10);
        })
      );
    },
  };
}

export function createData() {
  const N = 100;
  const other = Array(N) as TableEl[];
  for (let i = 0; i < N; i++) {
    const value = Math.random();
    other[i] = {
      text: String(value),
      style: { color: value > 0.5 ? 'black' : 'red' },
    };
  }
  return other;
}

function getContext2D(off: OffscreenCanvas): OffscreenCanvasRenderingContext2D {
  return off.getContext('2d' as any) as any;
}
