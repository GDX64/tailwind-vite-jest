import * as PIXI from 'pixi.js';
import { watchEffect } from 'vue';

function createRandomRow() {
  return {
    first: Math.random().toFixed(4),
    second: Math.random().toFixed(4),
    third: Math.random().toFixed(4),
  };
}
type RandomRow = ReturnType<typeof createRandomRow>;

function createRandomRows() {
  return [...Array(10)].map(createRandomRow);
}

export function tableTest(el: HTMLElement) {
  const app = new PIXI.Application();
  el.appendChild(app.view);
  app.stage.addChild(createFrame());
  const rows = createRandomRows();
  const table = createTable(rows);
  app.stage.addChild(table.table);
  setInterval(() => updateText(table), 1000);
}

function updateText(table: TextTable) {
  createRandomRows().forEach((row, indexRow) => {
    table.configs.forEach(({ prop }, indexCol) => {
      table.rows[indexRow].texts[indexCol].text = row[prop];
    });
  });
}

function createFrame() {
  const frame = new PIXI.Graphics();
  frame.beginFill(0xffffff);
  frame.lineStyle({ color: 0xffffff, width: 4, alignment: 0 });
  frame.drawRect(0, 0, 1000, 1000);
  return frame;
}

function createRow<T extends DataRow>(dataRow: T, ColConfigs: ColConfig<T>[]) {
  let initialPos = 0;
  let maxHeight = 0;
  const texts = ColConfigs.map((config) => {
    const text = new PIXI.Text(dataRow[config.prop], { fontSize: 14 });
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

function createConfigs() {
  const configs: ColConfig<RandomRow>[] = [
    { prop: 'first', width: 50 },
    { prop: 'second', width: 70 },
    { prop: 'third', width: 50 },
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
  constructor(public texts: PIXI.Text[]) {
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
