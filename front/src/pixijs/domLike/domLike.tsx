import { faker } from '@faker-js/faker';
import * as PIXI from 'pixi.js';
import { allPass, clamp, range, values } from 'ramda';
import { animationFrames, bufferTime, mergeAll } from 'rxjs';
import { render, For } from '@solidRender/CustomRender';
import { batch, createMemo, createSignal } from 'solid-js';
import { createMutable } from 'solid-js/store';
import { NameCell, Btn, Graphic } from './Components';

type Animal = {
  text: string;
  birth: Date;
  breed: 'dog' | 'cat';
};

interface TableData {
  values: Animal[];
  height: number;
}

const store = dataGen();

function dataGen(): TableData {
  const cats = range(0, 300).map(() => {
    return randomCat();
  });
  const store = createMutable({ height: 20, values: cats });
  return store;
}

export function randomCat(): Animal {
  const breed = Math.random() > 0.5 ? 'dog' : 'cat';
  const text = breed === 'cat' ? faker.animal.cat() : faker.animal.dog();
  const birth = faker.date.birthdate();
  return {
    text,
    birth,
    breed,
  };
}

export function setupDomTest(view: HTMLCanvasElement, resolution: number) {
  const app = new PIXI.Application({
    view,
    height: 1000,
    width: 650,
    resolution: devicePixelRatio,
    backgroundColor: 0xffffff,
  });
  view.addEventListener('wheel', (event) => event.preventDefault());
  return render(() => {
    return <CreateTable></CreateTable>;
  }, app.stage);
}

function calcAge(date: Date) {
  return new Date().getFullYear() - date.getFullYear();
}

function CreateTable() {
  createBitMapFonts(devicePixelRatio);
  const sliceSize = 50;
  const [slice, setSlice] = createSignal([0, sliceSize] as [number, number]);
  const scrollPercent = createMemo(() => {
    return Math.max(slice()[1] - sliceSize, 0) / (store.values.length - sliceSize) || 0;
  });
  function onScroll({ deltaY }: { deltaY: number }) {
    const validateValues = ([begin, end]: [number, number]) => {
      const beginClamp = clamp(0, Math.max(store.values.length - sliceSize), begin);
      const endClamp = clamp(
        beginClamp + sliceSize,
        Math.max(store.values.length, beginClamp + sliceSize),
        end
      );
      return [beginClamp, endClamp] as [number, number];
    };
    if (deltaY > 0) {
      setSlice((prev) => validateValues([(prev[0] += 5), (prev[1] += 5)]));
    } else {
      setSlice((prev) => validateValues([(prev[0] -= 5), (prev[1] -= 5)]));
    }
  }
  const [columnsSize] = createSignal([0, 200, 350, 450, 550] as ColsSize);
  const statistics = createMemo(() => {
    let oldest = new Date();
    let totalAge = 0;
    store.values.forEach((item) => {
      oldest = oldest < item.birth ? oldest : item.birth;
      totalAge += calcAge(item.birth);
    });
    return { oldest: calcAge(oldest), avgAge: totalAge / store.values.length || 0 };
  });
  const sliced = createMemo(() => {
    return store.values.slice(...slice());
  });
  animationFrames()
    // .pipe(bufferTime(100))
    .subscribe(() => {
      const oldCat = store.values.pop();
      if (oldCat) {
        Object.assign(oldCat, randomCat());
        store.values = [oldCat, ...store.values].slice(0, 50);
      }
    });
  return (
    <cont
      x={10}
      y={100}
      cacheAsBitmap={false}
      interactive={true}
      ref={(el) => {
        el.addListener('wheel', (event) => onScroll(event));
      }}
    >
      <Graphic color={0x0000}>
        {[
          new PIXI.Rectangle(
            600,
            80 + (sliceSize * store.height - 30) * scrollPercent(),
            10,
            30
          ),
        ]}
      </Graphic>
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
      <cont y={55}>
        <Header pos={columnsSize()}></Header>
      </cont>
      <cont y={80}>
        <For each={sliced()}>
          {(item, index) => (
            <Row
              animal={item}
              y={index() * store.height}
              stats={statistics()}
              positions={columnsSize()}
              height={store.height}
              even={index() % 2 === 0}
            ></Row>
          )}
        </For>
      </cont>
    </cont>
  );
}

type ColsSize = [number, number, number, number, number];

function Header(args: { pos: ColsSize }) {
  return (
    <cont>
      <NameCell p_x={args.pos[0]} p_text="Cat breed" p_fontName="bold-black"></NameCell>
      <NameCell p_x={args.pos[1]} p_text="Birth" p_fontName="bold-black"></NameCell>
      <NameCell p_x={args.pos[2]} p_text="Age" p_fontName="bold-black"></NameCell>
      <NameCell p_x={args.pos[3]} p_text="Proportion" p_fontName="bold-black"></NameCell>
    </cont>
  );
}

function Row(args: {
  animal: Animal;
  stats: {
    oldest: number;
    avgAge: number;
  };
  y: number;
  positions: ColsSize;
  height: number;
  even: boolean;
}) {
  const age = createMemo(() => calcAge(args.animal.birth));
  const proportion = createMemo(() => (100 * age()) / args.stats.oldest);
  const hitArea = createMemo(() => {
    const area = new PIXI.Rectangle(
      0,
      0,
      args.positions[4] - args.positions[0] + 50,
      args.height
    );
    return area;
  });
  return (
    <cont y={args.y}>
      <Graphic p_x={0} color={args.even ? 0xeeeeee : 0xdddddd}>
        {[hitArea()]}
      </Graphic>
      <NameCell p_text={args.animal.text} p_x={args.positions[0]}></NameCell>
      <NameCell
        p_text={args.animal.birth.toDateString()}
        p_x={args.positions[1]}
      ></NameCell>
      <NameCell
        p_text={String(age())}
        p_x={args.positions[2]}
        p_fontName={age() < args.stats.avgAge ? 'red' : 'black'}
      ></NameCell>
      <Graphic p_x={args.positions[3]} color={Math.round((1 - proportion() / 100) * 255)}>
        {[new PIXI.Rectangle(0, 0, proportion(), 10)]}
      </Graphic>
      <text
        text={args.animal.breed === 'cat' ? '🐱' : '🐶'}
        style={{ fontSize: 11 }}
        x={args.positions[4]}
      ></text>
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
    'bold-black',
    {
      fontFamily: 'Segoe Ui',
      fontSize: 12,
      fill: 0x000000,
      fontWeight: 'bold',
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
