import { faker } from '@faker-js/faker';
import * as PIXI from 'pixi.js';
import { range } from 'ramda';
import { computed, effectScope, ref, Ref, watchEffect } from 'vue';

interface TableData {
  values: { text: string }[];
  height: number;
}

function dataGen(): TableData {
  const cats = range(0, 10).map(() => {
    const text = faker.animal.cat();
    return { text };
  });
  return { height: 20, values: cats };
}

export function setupDomTest(view: HTMLCanvasElement, resolution: number) {
  const data = ref(dataGen());
  const effect = effectScope();
  (window as any).data = data;
  const clear = effect.run(() => createTable(view, data));
  return () => {
    effect.stop();
    clear?.();
  };
}

function createTable(view: HTMLCanvasElement, data: Ref<TableData>) {
  createBitMapFonts(devicePixelRatio);

  const compRows = computed(() => {
    return data.value.values.map((row, index) => {
      return computed(() => {
        console.log('row calc');
        const tx = new PIXI.BitmapText(row.text, { fontName: 'black' });
        tx.y = index * data.value.height;
        tx.cacheAsBitmap = true;
        return tx;
      });
    });
  });
  const rows = computed(() => {
    const container = new PIXI.Container();
    container.x = 50;
    container.y = 50;
    container.addChild(...compRows.value.map((row) => row.value));
    return container;
  });

  const app = new PIXI.Application({
    view,
    height: 500,
    width: 500,
    resolution: devicePixelRatio,
    backgroundColor: 0xffffff,
  });
  watchEffect((clear) => {
    const rowsDisplay = rows.value;
    app.stage.addChild(rowsDisplay);
    clear(() => app.stage.removeChild(rowsDisplay));
  });
  return () => app.destroy();
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
