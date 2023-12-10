<template>
  <div class="px-1 bg-stone-800 text-prime-100 py-1">
    <div class="my-blog-post" v-html="parsed"></div>
    <CodeFormat :code="code1"></CodeFormat>
    <BigTriangleExample></BigTriangleExample>
  </div>
</template>

<script setup lang="ts">
import CodeFormat from '../../components/CodeFormat.vue';
import BigTriangleExample from './BigTriangleExample.vue';
import { marked } from 'marked';
import postMD from './SIMDPost.md?raw';

const parsed = marked(postMD, { breaks: true, async: false });
console.log(parsed);
const code1 = ` 
use raytracer::simd::Vec3;
use raytracer::simd::Vec3;
use raytracer::simd::Vec3;

fn main(){
    println!("Hello, world!")
}`;
</script>
