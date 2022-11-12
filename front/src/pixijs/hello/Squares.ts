import * as PIXI from 'pixi.js';

export function squaresTest(view: HTMLCanvasElement, resolution: number) {
  const app = new PIXI.Application({ view, width: 500, height: 500, resolution });
  const g = new PIXI.Graphics();
  app.stage.addChild(g);
  square(g);
  app.ticker.add(() => (g.rotation += 0.01));
  return () => app.destroy();
}

function square(g: PIXI.Graphics) {
  // const randByte = () => Math.floor(Math.random() * 256);
  [...Array(10_000)].forEach(() => {
    const rand = (n: number) => Math.round(Math.random() * n);
    g.beginFill(0xff0000)
      .drawRect(rand(500) - 250, rand(500) - 250, rand(50), rand(50))
      .endFill();
  });
}
