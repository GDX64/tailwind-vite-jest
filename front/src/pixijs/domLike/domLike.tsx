import { faker } from '@faker-js/faker';
import { render, For } from '@solidRender/CustomRender';
import * as PIXI from 'pixi.js';
import { range } from 'ramda';
import { Accessor, createEffect, createSignal, onCleanup, Signal } from 'solid-js';

interface TableData {
  values: Signal<{ text: Signal<string>; birth: Signal<Date> }[]>;
  height: Signal<number>;
}

function dataGen(): TableData {
  const cats = range(0, 10).map(() => {
    return randomCat();
  });
  return { height: createSignal(20), values: createSignal(cats) };
}

function randomCat() {
  const text = faker.animal.cat();
  return { text: createSignal(text), birth: createSignal(faker.date.birthdate()) };
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
  return render(() => <CreateTable data={data[0]}></CreateTable>, app.stage);
}

function CreateTable(args: { data: Accessor<TableData> }) {
  createBitMapFonts(devicePixelRatio);
  return (
    <cont x={100} y={100} cacheAsBitmap={false}>
      <Btn
        value="height +"
        onClick={() =>
          args.data().height[1]((other) => {
            console.log('click');
            return other + 1;
          })
        }
        y={0}
      ></Btn>
      <Btn
        value="cat +"
        onClick={() =>
          args.data().values[1]((other) => {
            console.log('click');
            return [randomCat(), ...other];
          })
        }
        y={20}
      ></Btn>
      <cont y={40}>
        <For each={args.data().values[0]()}>
          {(item, index) => (
            <Row
              text={item.text}
              y={index() * args.data().height[0]()}
              birth={item.birth}
            ></Row>
          )}
        </For>
      </cont>
    </cont>
  );
}

function Btn(props: { value: string; onClick: () => void; y: number }) {
  const txt = new PIXI.Text(props.value);
  txt.style.fontSize = 12;
  txt.interactive = true;
  txt.addListener('click', props.onClick);
  txt.y = props.y;
  return txt;
}

function Row(args: { text: Signal<string>; birth: Signal<Date>; y: number }) {
  return (
    <cont y={args.y}>
      <NameCell text={args.text[0]()} x={0}></NameCell>
      <NameCell text={args.birth[0]().toUTCString()} x={100}></NameCell>
    </cont>
  );
}

function NameCell(args: { text: string; x: number }) {
  const tx = new PIXI.BitmapText(args.text, { fontName: 'black' });
  tx.interactive = true;
  tx.addListener('mouseenter', () => (tx.alpha = 0.5));
  tx.addListener('mouseleave', () => (tx.alpha = 1));
  console.log('montei');
  createEffect(() => {
    console.log('update');
    tx.text = args.text;
    tx.x = args.x;
  });
  onCleanup(() => console.log('clean'));
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
