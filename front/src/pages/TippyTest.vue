<template>
  <BackGround>
    <div class="flex">
      <TippyWrap>
        <template #default="{}">
          <div class="text-black w-10 h-8 bg-slate-400">hello</div>
        </template>
        <template #content="{}">
          <div
            class="bg-slate-300 rounded-sm w-36 h-36 text-black flex-col content-evenly"
          >
            <span>
              {{ val }}
            </span>
            <input v-model="val" class="bg-yellow-100 w-32" />
          </div>
        </template>
      </TippyWrap>
    </div>
  </BackGround>
</template>

<script lang="ts" setup>
import { onMounted, ref } from 'vue';
import TippyWrap from '../TippyWrapper/TippyWrap.vue';
import BackGround from './BackGround.vue';
const val = ref('');
</script>
