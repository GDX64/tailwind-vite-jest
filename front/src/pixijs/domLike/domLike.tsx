import { faker } from '@faker-js/faker';
import * as PIXI from 'pixi.js';
import { range } from 'ramda';
import { animationFrames } from 'rxjs';
import { render, For } from '@solidRender/CustomRender';
import { createMemo } from 'solid-js';
import { createMutable } from 'solid-js/store';
import { NameCell, Btn, Graphic } from './Components';

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
  const sortedByAge = createMemo(() => {
    return [...store.values].sort((a, b) => (a.birth > b.birth ? -1 : 1));
  });
  const median = createMemo(
    () => sortedByAge()[Math.floor(sortedByAge().length / 2)]?.birth ?? new Date()
  );
  animationFrames().subscribe(() => {
    const index = Math.floor(store.values.length * Math.random());
    store.values[index].birth = faker.date.birthdate();
  });
  return (
    <cont x={10} y={100} cacheAsBitmap={false}>
      <Btn
        p_text="height +"
        withNode={(txt) => {
          return () => txt.removeAllListeners();
        }}
        listenTo={{ click: () => (store.height += 1) }}
        p_y={0}
      ></Btn>
      <Btn
        p_text="cat +"
        p_style={{ fill: 'green', fontSize: 12 }}
        withNode={(txt) => {
          txt.addListener('click', () => {
            store.values = [randomCat(), ...store.values];
          });
        }}
        p_y={20}
      ></Btn>
      <cont y={40}>
        <For each={sortedByAge()}>
          {(item, index) => (
            <Row
              text={item.text}
              y={index() * store.height}
              birth={item.birth}
              oldest={oldest()}
              median={median()}
            ></Row>
          )}
        </For>
      </cont>
    </cont>
  );
}

function Row(args: {
  text: string;
  birth: Date;
  oldest: number;
  y: number;
  median: Date;
}) {
  const age = createMemo(() => calcAge(args.birth));
  const proportion = createMemo(() => (100 * age()) / args.oldest);
  return (
    <cont y={args.y}>
      <NameCell p_text={args.text} p_x={0}></NameCell>
      <NameCell p_text={args.birth.toDateString()} p_x={150}></NameCell>
      <NameCell
        p_text={String(age())}
        p_x={300}
        p_fontName={args.birth < args.median ? 'red' : 'black'}
      ></NameCell>
      <Graphic x={350} color={Math.round((1 - proportion() / 100) * 255)}>
        {[new PIXI.Rectangle(0, 0, proportion(), 10)]}
      </Graphic>
    </cont>
  );
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
