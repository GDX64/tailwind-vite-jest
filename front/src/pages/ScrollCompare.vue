<template>
  <table class="table-fixed">
    <tbody>
      <tr v-for="cat of cats" class="text-xs odd:bg-slate-100 even:bg-slate-200">
        <td style="width: 200px">{{ cat.text }}</td>
        <td style="width: 100px">{{ cat.birth.toDateString() }}</td>
        <td style="width: 50px">{{ calcAge(cat.birth) }}</td>
        <td style="width: 100px">
          <div
            class=""
            :style="{
              width: (calcAge(cat.birth) / stats.oldest) * 100 + 'px',
              backgroundColor:
                '#' + '0000' + ((calcAge(cat.birth) / stats.oldest) * 255).toString(16),
              height: '15px',
            }"
          ></div>
        </td>
        <td style="width: 100px">{{ cat.breed === 'cat' ? '🐱' : '🐶' }}</td>
      </tr>
    </tbody>
  </table>
</template>

<script setup lang="ts">
import { range } from 'ramda';
import { animationFrames } from 'rxjs';
import { computed, reactive, ref } from 'vue';
import { randomCat } from '../pixijs/domLike/domLike';

const cats = ref(range(0, 50).map(() => randomCat()));
const stats = computed(() => {
  let oldest = new Date();
  let totalAge = 0;
  cats.value.forEach((item) => {
    oldest = oldest < item.birth ? oldest : item.birth;
    totalAge += calcAge(item.birth);
  });
  return { oldest: calcAge(oldest), avgAge: totalAge / cats.value.length || 0 };
});
console.log(stats.value.oldest);

function calcAge(date: Date) {
  return new Date().getFullYear() - date.getFullYear();
}

animationFrames().subscribe(() => {
  cats.value = [randomCat(), ...cats.value].slice(0, 50);
});
</script>
