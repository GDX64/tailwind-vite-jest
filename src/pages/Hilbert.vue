<template>
  <div class="flex justify-center">
    <canvas ref="canvas" :width="width" :height="width"></canvas>
  </div>
</template>

<script lang="ts" setup>
import { onMounted, ref } from 'vue';
import init, { all_hilbert } from 'wordle';
const canvas = ref<HTMLCanvasElement>();
const width = 512;
type Pair = [number, number];
function getPairs(n: number, amount: number): Pair[] {
  const v = all_hilbert(2 ** n + 1, amount);
  const arr: Pair[] = Array(v.length / 2);
  for (let i = 0; i < v.length; i += 2) {
    arr[i / 2] = [v[i] * 10 + 0.5, v[i + 1] * 10 + 0.5];
  }
  console.log(arr);
  return arr;
}

function drawHilbert(pairs: Pair[]) {
  const ctx = canvas.value?.getContext('2d')!;
  ctx.strokeStyle = 'black';
  ctx.beginPath();
  pairs.forEach(([x, y]) => ctx.lineTo(x, y));
  ctx.stroke();
}

onMounted(async () => {
  await init();
  console.log();
  drawHilbert(getPairs(5, 2000));
});
</script>
