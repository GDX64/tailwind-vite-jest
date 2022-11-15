import { faker } from '@faker-js/faker';
import * as PIXI from 'pixi.js';
import { range } from 'ramda';
import {
  Accessor,
  createEffect,
  createMemo,
  createRoot,
  createSignal,
  mapArray,
  onCleanup,
  Signal,
} from 'solid-js';

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
  return createRoot((dispose) => {
    <CreateTable view={view} data={data[0]}></CreateTable>;
    return dispose;
  });
}

function CreateTable({
  view,
  data,
}: {
  view: HTMLCanvasElement;
  data: Accessor<TableData>;
}) {
  createBitMapFonts(devicePixelRatio);
  const compRows = mapArray(
    () => data().values,
    (row, index) => {
      return createMemo(() => {
        console.log('row calc');
        const tx = new PIXI.BitmapText(row[0]().text, { fontName: 'black' });
        tx.y = index() * data().height;
        tx.cacheAsBitmap = true;
        return tx;
      });
    }
  );
  const rows = createMemo(() => {
    const container = new PIXI.Container();
    container.x = 50;
    container.y = 50;
    container.addChild(...compRows().map((row) => row()));
    return container;
  });

  const app = new PIXI.Application({
    view,
    height: 500,
    width: 500,
    resolution: devicePixelRatio,
    backgroundColor: 0xffffff,
  });
  createEffect(() => {
    const rowsDisplay = rows();
    app.stage.addChild(rowsDisplay);
    onCleanup(() => app.stage.removeChild(rowsDisplay));
  });
  onCleanup(() => app.destroy());
  return '';
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
