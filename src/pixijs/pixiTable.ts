import * as PIXI from 'pixi.js';

function createRandomRow() {
  return {
    first: Math.random().toFixed(4),
    second: Math.random().toFixed(4),
    third: Math.random().toFixed(4),
  };
}

export function tableTest(el: HTMLElement) {
  const app = new PIXI.Application();
  el.appendChild(app.view);
  app.stage.addChild(createFrame());
  app.stage.addChild(createTable(10));
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
  const row = new PIXI.Container();
  row.addChild(...texts);
  return row;
}

function createTable(size: number) {
  const configs = createConfigs();
  let accHeight = 0;
  const rows = [...Array(size)].map(() => {
    const row = createRow(createRandomRow(), configs);
    row.y = accHeight;
    accHeight += row.height;
    return row;
  });
  const table = new PIXI.Container();
  table.addChild(...rows);
  console.log(table);
  return table;
}

function createConfigs() {
  const configs: ColConfig<ReturnType<typeof createRandomRow>>[] = [
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
