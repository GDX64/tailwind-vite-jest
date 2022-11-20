import { faker } from '@faker-js/faker';
import * as PIXI from 'pixi.js';
import { clamp, range } from 'ramda';
import { animationFrames } from 'rxjs';
import { render, For } from '@solidRender/CustomRender';
import { createMemo, createSignal } from 'solid-js';
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
  const cats = range(0, 30).map(() => {
    return randomCat();
  });
  const store = createMutable({ height: 20, values: cats });
  return store;
}

function randomCat(): Animal {
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
    width: 500,
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
  const [slice, setSlice] = createSignal([0, 10] as [number, number]);
  function onScroll({ deltaY }: { deltaY: number }) {
    const validateValues = ([begin, end]: [number, number]) => {
      const beginClamp = clamp(0, Math.max(store.values.length - 10), begin);
      const endClamp = clamp(
        beginClamp + 10,
        Math.max(store.values.length, beginClamp + 10),
        end
      );
      console.log([beginClamp, endClamp]);
      return [beginClamp, endClamp] as [number, number];
    };
    if (deltaY > 0) {
      setSlice((prev) => validateValues([(prev[0] += 1), (prev[1] += 1)]));
    } else {
      setSlice((prev) => validateValues([(prev[0] -= 1), (prev[1] -= 1)]));
    }
  }
  const [columnsSize] = createSignal([0, 150, 280, 320, 450] as ColsSize);
  const oldest = createMemo(() => {
    const oldest = store.values.reduce((a, b) => (a < b.birth ? a : b.birth), new Date());
    return calcAge(oldest);
  });
  const sortedByAge = createMemo(() => {
    return [...store.values]
      .sort((a, b) => (a.birth > b.birth ? -1 : 1))
      .slice(...slice());
  });
  const median = createMemo(
    () => sortedByAge()[Math.floor(sortedByAge().length / 2)]?.birth ?? new Date()
  );
  // animationFrames().subscribe(() => {
  //   const index = Math.floor(store.values.length * Math.random());
  //   Object.assign(store.values[index], randomCat());
  //   // store.values[index] = randomCat();
  // });
  return (
    <cont
      x={10}
      y={100}
      cacheAsBitmap={false}
      ref={(el) => {
        el.interactive = true;
        // requestAnimationFrame(() => console.log(el.width, el.height));
        // el.interactiveChildren = false;
        el.addListener('wheel', (event) => {
          onScroll(event);
        });
      }}
    >
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
        <For each={sortedByAge()}>
          {(item, index) => (
            <Row
              animal={item}
              y={index() * store.height}
              oldest={oldest()}
              median={median()}
              positions={columnsSize()}
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
  oldest: number;
  y: number;
  median: Date;
  positions: ColsSize;
}) {
  const age = createMemo(() => calcAge(args.animal.birth));
  const proportion = createMemo(() => (100 * age()) / args.oldest);
  return (
    <cont y={args.y}>
      <NameCell p_text={args.animal.text} p_x={args.positions[0]}></NameCell>
      <NameCell
        p_text={args.animal.birth.toDateString()}
        p_x={args.positions[1]}
      ></NameCell>
      <NameCell
        p_text={String(age())}
        p_x={args.positions[2]}
        p_fontName={args.animal.birth < args.median ? 'red' : 'black'}
      ></NameCell>
      <Graphic x={args.positions[3]} color={Math.round((1 - proportion() / 100) * 255)}>
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
