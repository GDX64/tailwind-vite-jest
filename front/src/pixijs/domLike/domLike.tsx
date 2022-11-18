import { faker } from '@faker-js/faker';
import { render, For, JSX } from '@solidRender/CustomRender';
import * as PIXI from 'pixi.js';
import { range } from 'ramda';
import {
  Accessor,
  createEffect,
  createSignal,
  onCleanup,
  Signal,
  createMemo,
} from 'solid-js';

type Cat = {
  text: Signal<string>;
  birth: Signal<Date>;
  age: () => number;
};

interface TableData {
  values: Signal<Cat[]>;
  oldest: () => number;
  height: Signal<number>;
}

function dataGen(): TableData {
  const cats = createSignal(
    range(0, 10).map(() => {
      return randomCat();
    })
  );
  const oldest = createMemo(() =>
    cats[0]().reduce((a, b) => (a > b.age() ? a : b.age()), 0)
  );
  return { height: createSignal(20), values: cats, oldest };
}

function randomCat() {
  const text = faker.animal.cat();
  const birth = createSignal(faker.date.birthdate());
  return {
    text: createSignal(text),
    birth,
    age: createMemo(() => new Date().getFullYear() - birth[0]().getFullYear()),
  };
}

export function setupDomTest(view: HTMLCanvasElement, resolution: number) {
  const data = createSignal(dataGen());
  const app = new PIXI.Application({
    view,
    height: 500,
    width: 500,
    resolution: devicePixelRatio,
    backgroundColor: 0xffffff,
  });
  return render(() => <CreateTable data={data[0]()}></CreateTable>, app.stage);
}

function CreateTable(args: { data: TableData }) {
  createBitMapFonts(devicePixelRatio);
  function sortByAge(cats: Cat[]) {
    return [...cats].sort((a, b) => (a.birth[0]() > b.birth[0]() ? -1 : 1));
  }
  return (
    <cont x={10} y={100} cacheAsBitmap={false}>
      <Btn
        value="height +"
        onClick={() =>
          args.data.height[1]((other) => {
            return other + 1;
          })
        }
        y={0}
      ></Btn>
      <Btn
        value="cat +"
        onClick={() =>
          args.data.values[1]((other) => {
            return [randomCat(), ...other];
          })
        }
        y={20}
      ></Btn>
      <cont y={40}>
        <For each={sortByAge(args.data.values[0]())}>
          {(item, index) => (
            <Row
              text={item.text}
              y={index() * args.data.height[0]()}
              birth={item.birth}
              age={item.age()}
              oldest={args.data.oldest()}
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

function Row(args: {
  text: Signal<string>;
  birth: Signal<Date>;
  oldest: number;
  y: number;
  age: number;
}) {
  return (
    <cont y={args.y}>
      <NameCell text={args.text[0]()} x={0}></NameCell>
      <NameCell text={args.birth[0]().toUTCString()} x={100}></NameCell>
      <NameCell text={String(args.age)} x={300}></NameCell>
      <Graphic x={350} color={0xff0000}>
        {[new PIXI.Rectangle(0, 0, (100 * args.age) / args.oldest, 10)]}
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
