import * as PIXI from 'pixi.js';
import { animationFrames } from 'rxjs';

export function createRandomRow() {
  return {
    first: Math.random().toString(),
    sec: Math.random().toString(),
    third: Math.random().toString(),
    fourth: Math.random().toString(),
    fifty: Math.random().toString(),
  };
}
export type RandomRow = ReturnType<typeof createRandomRow>;

export function createRandomRows() {
  return [...Array(20)].map(createRandomRow);
}

export function tableTest(el: HTMLElement) {
  PIXI.settings.RESOLUTION = devicePixelRatio;
  PIXI.BitmapFont.from(
    'black',
    {
      fontFamily: 'Segoe Ui',
      fontSize: 12,
    },
    { chars: PIXI.BitmapFont.NUMERIC }
  );
  PIXI.BitmapFont.from(
    'red',
    {
      fontFamily: 'Segoe Ui',
      fontSize: 12,
      fill: 'red',
    },
    { chars: PIXI.BitmapFont.NUMERIC }
  );
  const app = new PIXI.Application({
    height: 1000,
    width: 1000,
    backgroundColor: 0xffffff,
  });
  el.appendChild(app.view);
  const rows = createRandomRows();
  const table = createTable(rows);
  app.stage.addChild(table.table);
  const sub = animationFrames().subscribe(() => {
    updateText(table);
  });
  return () => {
    sub.unsubscribe();
    app.view.remove();
    app.destroy();
  };
}

function updateText(table: TextTable) {
  createRandomRows().forEach((row, indexRow) => {
    table.configs.forEach(({ prop }, indexCol) => {
      const tex = table.rows[indexRow].texts[indexCol];
      tex.text = row[prop];
    });
  });
}

function createRow<T extends DataRow>(dataRow: T, ColConfigs: ColConfig<T>[]) {
  let initialPos = 0;
  let maxHeight = 0;
  const texts = ColConfigs.map((config) => {
    const text = new PIXI.BitmapText(dataRow[config.prop], {
      fontName: 'black',
    });
    text.x = initialPos;
    initialPos += config.width;
    maxHeight = Math.max(text.height);
    return text;
  });
  return new TextRow(texts);
}

function createTable(randomRows: RandomRow[]) {
  const configs = createConfigs();
  let accHeight = 0;
  const rows = randomRows.map(() => {
    const textRow = createRow(createRandomRow(), configs);
    textRow.row.y = accHeight;
    accHeight += textRow.row.height;
    return textRow;
  });
  return new TextTable(rows, configs);
}

export function createConfigs() {
  const configs: ColConfig<RandomRow>[] = [
    { prop: 'first', width: 130 },
    { prop: 'sec', width: 130 },
    { prop: 'third', width: 130 },
    { prop: 'fourth', width: 130 },
    { prop: 'fifty', width: 130 },
  ];
  return configs;
}

interface ColConfig<T extends DataRow> {
  width: number;
  prop: keyof T;
}

type DataRow = Record<string, string>;

class TextRow {
  row: PIXI.Container;
  constructor(public texts: PIXI.BitmapText[]) {
    const row = new PIXI.Container();
    row.addChild(...texts);
    this.row = row;
  }
}
class TextTable {
  table: PIXI.Container;
  constructor(public rows: TextRow[], public configs: ColConfig<RandomRow>[]) {
    const table = new PIXI.Container();
    table.addChild(...rows.map((row) => row.row));
    this.table = table;
  }
}
