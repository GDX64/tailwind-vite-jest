import { faker } from '@faker-js/faker';
import { render, For } from '@solidRender/CustomRender';
import * as PIXI from 'pixi.js';
import { range } from 'ramda';
import { Accessor, createEffect, createSignal, onCleanup, Signal } from 'solid-js';

interface TableData {
  values: Signal<{ text: string }>[];
  height: number;
}

function dataGen(): TableData {
  const cats = range(0, 10).map(() => {
    const text = faker.animal.cat();
    return createSignal({ text });
  });
  return { height: 20, values: cats };
}

export function setupDomTest(view: HTMLCanvasElement, resolution: number) {
  const data = createSignal(dataGen());
  (window as any).data = data;
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
    <cont x={100} y={100} cacheAsBitmap={true}>
      <For each={args.data().values}>
        {(item, index) =>
          (<Row text={item[0]().text} y={index() * args.data().height}></Row>) as any
        }
      </For>
    </cont>
  );
}

function Row(arg: { text: string; y: number }) {
  const tx = new PIXI.BitmapText(arg.text, { fontName: 'black' });
  tx.interactive = true;
  tx.addListener('mouseenter', () => (tx.alpha = 0.5));
  tx.addListener('mouseleave', () => (tx.alpha = 1));
  console.log('montei');
  createEffect(() => {
    console.log('update');
    tx.text = arg.text;
    tx.y = arg.y;
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
