import { faker } from '@faker-js/faker';
import { render, For, JSX } from '@solidRender/CustomRender';
import * as PIXI from 'pixi.js';
import { range } from 'ramda';
import { animationFrames } from 'rxjs';
import { createEffect, createMemo, createSignal, Signal } from 'solid-js';
import { createMutable, createStore } from 'solid-js/store';

type Cat = {
  text: string;
  birth: Date;
};

interface TableData {
  values: Cat[];
  height: number;
}

const store = dataGen();

function dataGen(): TableData {
  const cats = range(0, 30).map(() => {
    return randomCat();
  });
  const store = createMutable({ height: 20, values: cats });
  return store;
}

function randomCat() {
  const text = faker.animal.cat();
  const birth = faker.date.birthdate();
  return {
    text: text,
    birth,
  };
}

export function setupDomTest(view: HTMLCanvasElement, resolution: number) {
  const app = new PIXI.Application({
    view,
    height: 1000,
    width: 500,
    resolution: devicePixelRatio,
    backgroundColor: 0xffffff,
  });
  return render(() => {
    return <CreateTable></CreateTable>;
  }, app.stage);
}

function calcAge(date: Date) {
  return new Date().getFullYear() - date.getFullYear();
}

function CreateTable() {
  createBitMapFonts(devicePixelRatio);
  const oldest = createMemo(() => {
    const oldest = store.values.reduce((a, b) => (a < b.birth ? a : b.birth), new Date());
    return calcAge(oldest);
  });
  function sortByAge(cats: Cat[]) {
    return [...cats].sort((a, b) => (a.birth > b.birth ? -1 : 1));
  }
  animationFrames().subscribe(() => {
    const index = Math.floor(store.values.length * Math.random());
    store.values[index].birth = faker.date.birthdate();
  });
  return (
    <cont x={10} y={100} cacheAsBitmap={false}>
      <Btn
        value="height +"
        onClick={() => {
          store.height += 1;
        }}
        y={0}
      ></Btn>
      <Btn
        value="cat +"
        onClick={() => {
          store.values = [randomCat(), ...store.values];
        }}
        y={20}
      ></Btn>
      <cont y={40}>
        <For each={sortByAge(store.values)}>
          {(item, index) => (
            <Row
              text={item.text}
              y={index() * store.height}
              birth={item.birth}
              oldest={oldest()}
            ></Row>
          )}
        </For>
      </cont>
    </cont>
  );
}

function Graphic(
  args: PosProps & { children: PIXI.IShape[] } & { color: number; alpha?: number }
) {
  const g = new PIXI.Graphics();
  createEffect(() => {
    g.clear();
    args.children.forEach((shape) => {
      g.beginFill(args.color).drawShape(shape).endFill();
    });
    g.alpha = args.alpha || 1;
  });
  posWatcher(g, args);
  return g;
}

type PosProps = { x?: number; y?: number };

function posWatcher(el: JSX.Element, pos: PosProps) {
  createEffect(() => {
    el.x = pos.x ?? el.x;
    el.y = pos.y ?? el.y;
  });
}

function Btn(props: { value: string; onClick: () => void } & PosProps) {
  const txt = new PIXI.Text(props.value);
  txt.style.fontSize = 12;
  txt.interactive = true;
  txt.addListener('click', props.onClick);
  posWatcher(txt, props);
  return txt;
}

function Row(args: { text: string; birth: Date; oldest: number; y: number }) {
  const age = createMemo(() => calcAge(args.birth));
  const proportion = createMemo(() => (100 * age()) / args.oldest);
  return (
    <cont y={args.y}>
      <NameCell text={args.text} x={0}></NameCell>
      <NameCell text={args.birth.toUTCString()} x={100}></NameCell>
      <NameCell text={String(age())} x={300}></NameCell>
      <Graphic x={350} color={Math.round((1 - proportion() / 100) * 255)}>
        {[new PIXI.Rectangle(0, 0, proportion(), 10)]}
      </Graphic>
    </cont>
  );
}

function NameCell(args: { text: string; x: number }) {
  const tx = new PIXI.BitmapText(args.text, { fontName: 'black' });
  tx.interactive = true;
  tx.addListener('mouseenter', () => (tx.alpha = 0.5));
  tx.addListener('mouseleave', () => (tx.alpha = 1));
  createEffect(() => {
    tx.text = args.text;
    tx.x = args.x;
  });
  return tx;
}

function createBitMapFonts(resolution: number) {
  PIXI.BitmapFont.from(
    'black',
    {
      fontFamily: 'Segoe Ui',
      fontSize: 12,
      fill: 0x000000,
    },
    { chars: PIXI.BitmapFont.ALPHANUMERIC, resolution }
  );
  PIXI.BitmapFont.from(
    'red',
    {
      fontFamily: 'Segoe Ui',
      fontSize: 12,
      fill: 'red',
    },
    { chars: PIXI.BitmapFont.ALPHANUMERIC, resolution }
  );
}
