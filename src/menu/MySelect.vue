<template>
  <div class="w-min">
    <div class="header bg-pink-200" @click="open">
      <slot
        name="header"
        :data="dataMap.get(cursorValue)"
        :selectedData="dataMap.get(selectedValue)"
      ></slot>
    </div>
    <div class="flex-col w-full" v-show="isOpen">
      <slot></slot>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { BehaviorSubject, EMPTY, fromEvent, map, switchMap, tap } from 'rxjs';
import { computed, provide, reactive, ref } from 'vue';
import { cursorKey, registerKey, selectedKey } from './SelectThings';

const props = defineProps<{ selectedValue: number }>();
const emit = defineEmits<{ (event: 'selected', value: number): void }>();
const options = ref([] as number[]);
const cursorValue = ref(-1);
const index = computed(() =>
  options.value.findIndex((item) => item === cursorValue.value)
);
const dataMap = reactive(new Map());
const valueAt = (x: number): number | null => options.value[x] ?? null;
const isOpen = ref(false);
const open$ = new BehaviorSubject(false);

open$
  .pipe(
    tap((value) => (isOpen.value = value)),
    switchMap((value) => {
      if (value) {
        return fromEvent<KeyboardEvent>(window, 'keydown');
      }
      return EMPTY;
    }),
    map((event) => {
      if (event.key.toLowerCase() === 'arrowdown') {
        return 1;
      }
      if (event.key.toLowerCase() === 'arrowup') {
        return -1;
      }
      return 0;
    })
  )
  .subscribe((num) => {
    const newSelected = valueAt(index.value + num);
    if (newSelected != null) {
      cursorValue.value = newSelected;
    }
  });

function onRegister(value: number, data: any) {
  options.value.push(value);
  dataMap.set(value, data);
}

function open() {
  open$.next(!open$.value);
}

provide(registerKey, onRegister);
provide(cursorKey, cursorValue);
provide(selectedKey, (x) => {
  emit('selected', x);
  open$.next(false);
});
</script>
