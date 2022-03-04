import * as PIXI from 'pixi.js';

export function createRandomRow() {
  return {
    first: Math.random().toFixed(4),
    second: Math.random().toFixed(4),
    third: Math.random().toFixed(4),
  };
}
export type RandomRow = ReturnType<typeof createRandomRow>;

export function createRandomRows() {
  return [...Array(50)].map(createRandomRow);
}

export function tableTest(el: HTMLElement) {
  const font = PIXI.BitmapFont.from(
    'myFont',
    {
      fontFamily: 'Segoe Ui',
      fontSize: 14,
    },
    { chars: PIXI.BitmapFont.ASCII }
  );
  debugger;
  const app = new PIXI.Application({
    height: 1000,
    width: 1000,
    backgroundColor: 0xffffff,
  });
  el.appendChild(app.view);
  const rows = createRandomRows();
  const table = createTable(rows);
  app.stage.addChild(table.table);
  setInterval(() => updateText(table), 20);
}

function updateText(table: TextTable) {
  createRandomRows().forEach((row, indexRow) => {
    table.configs.forEach(({ prop }, indexCol) => {
      table.rows[indexRow].texts[indexCol].text = row[prop];
    });
  });
}

function createRow<T extends DataRow>(dataRow: T, ColConfigs: ColConfig<T>[]) {
  let initialPos = 0;
  let maxHeight = 0;
  const texts = ColConfigs.map((config) => {
    const text = new PIXI.BitmapText(dataRow[config.prop], {
      fontName: 'myFont',
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
    { prop: 'first', width: 50 },
    { prop: 'second', width: 70 },
    { prop: 'third', width: 50 },
    { prop: 'second', width: 70 },
    { prop: 'third', width: 50 },
    { prop: 'first', width: 50 },
    { prop: 'second', width: 70 },
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
