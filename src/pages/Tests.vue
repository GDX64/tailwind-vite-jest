<template>
  <BackGroundVue>
<<<<<<< HEAD
    <CTableVue :rows="list" :col-config="colConfig">
      <template #row="{ row, cols }">
        <CRow
          :row="row"
          :col-config="cols"
          class="hover:bg-purple-900 even:bg-slate-800"
          :draggable="true"
          :ondragstart="() => events.emit('dragStart', row)"
          :ondragover="(event: DragEvent) => dragOver(event, row)"
          :ondrop="() => events.emit('drop')"
          :ondragend="() => events.emit('dragEnd')"
        ></CRow>
      </template>
    </CTableVue>
=======
    <HistogramVue :list="list" :max-count="maxCount"></HistogramVue>
    <button @click="restart">Restart</button>
>>>>>>> 7fb2a8f8b47723b728b7239aff38a58a421f8612
  </BackGroundVue>
</template>

<script lang="ts" setup>
import BackGroundVue from './BackGround.vue';
<<<<<<< HEAD
import CTableVue from '../components/Table/CTable.vue';
import CRow from '../components/Table/CRow.vue';
import {
  fromEventPattern,
  map,
  merge,
  mergeMap,
  of,
  switchMap,
  takeWhile,
  tap,
} from 'rxjs';
import { ref } from 'vue';
import mitt from 'mitt';

const randInt = () => Math.floor(Math.random() * 1000);
const lot = [...Array(10)].map(() => ({ a: randInt(), b: randInt(), c: randInt() }));
const list = ref(Object.freeze(lot));
const colConfig = [
  { prop: 'a', header: 'a' },
  { prop: 'b', header: 'b' },
  { prop: 'c', header: 'c' },
];

type Row = typeof lot[0];
type Events = {
  dragStart: Row;
  dragOver: Row;
  dragEnd: void;
  drop: void;
};
const events = mitt<Events>();

const listenTo = <T extends keyof Events>(key: T) =>
  fromEventPattern<Events[T]>(
    (handler) => events.on(key, handler),
    (handler) => events.off(key, handler)
  );
=======
import HistogramVue from '../components/Histogram.vue';
import { ref } from 'vue';
import { createLiveHist, Bucket } from '../domain/histogramGen';
import { Subscription } from 'rxjs';
const list = ref([] as Bucket[]);
const maxCount = ref(0);
let subscription = null as null | Subscription;
function restart() {
  subscription?.unsubscribe();
  subscription = createLiveHist(3).subscribe((histInfo) => {
    list.value = histInfo.histList;
    maxCount.value = histInfo.maxCount;
  });
}

// (window as any).setList = (newList: number[]) => (list.value = newList);
</script>
>>>>>>> 7fb2a8f8b47723b728b7239aff38a58a421f8612

listenTo('dragStart')
  .pipe(
    switchMap((dragged) => {
      const initialState = [...list.value];
      const dragOver = listenTo('dragOver').pipe(
        map((over) => ({ list: swap(dragged, over, list.value), finish: false })),
        tap(() => console.log('over'))
      );
      const drop = listenTo('drop').pipe(
        mergeMap(() => of({ list: [], finish: true })),
        tap(() => console.log('drop'))
      );
      const mouseUp = listenTo('dragEnd').pipe(
        mergeMap(() =>
          of({ list: initialState, finish: false }, { list: [], finish: true })
        ),
        tap(() => console.log('end'))
      );
      return merge(dragOver, drop, mouseUp).pipe(takeWhile(({ finish }) => !finish));
    })
  )
  .subscribe(({ list: state }) => {
    list.value = state;
  });

function dragOver(event: DragEvent, row: any) {
  event.preventDefault();
  events.emit('dragOver', row);
}

function swap<T>(el1: T, el2: T, arr: Readonly<T[]>) {
  if (el1 === el2) {
    return arr;
  }
  const i1 = list.value.findIndex((el) => el === el1);
  const i2 = list.value.findIndex((el) => el === el2);
  if (i2 === -1 || i1 === -1) {
    return arr;
  }
  const arrCopy = [...arr];
  arrCopy[i2] = el1;
  arrCopy[i1] = el2;
  return arrCopy;
}
</script>
