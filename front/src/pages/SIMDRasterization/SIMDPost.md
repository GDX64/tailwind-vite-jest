## WASM SIMD

<br >

It has been a while a wanted to mess with some SIMD instructions in webassembly and
native. But one of the things that kind of stopped me of doing things with SIMD is
the lack of portablility. If you want to write SIMD code you usually need to use
platform specific code. But recently I found [this article](https://mcyoung.xyz/2023/11/27/simd-base64/) about the portable SIMD rust library.

<br >

This is part of the standard library of rust, but it is still in a very early stage
and needs to be used with the nightly compiler. But I found it to work pretty well
and it is very easy to use. It really improves performance and the same code can
targer ARM, x86 and WASM.

## Some steps to get SIMD working in rust native and wasm

<br >
This is what the code looks like when you use those SIMD functions:

<div class="text-sm my-10">

```rust
use wasm_bindgen::prelude::*;
use std::simd::num::SimdFloat;

#[wasm_bindgen]
pub fn test_simd(to_add: f32) -> f32 {
    use std::simd;
    let v = simd::f32x4::from_array([1.0, 2.0, 3.0, 4.0]);
    let inc = simd::f32x4::splat(to_add);
    let v = v + inc;
    let s = v.reduce_sum();
    s
}

```

</div>


In the code above we create a SIMD vector with 128bits, that is going to be translated into a v128 in wasm,
in fact, we can easily look into the webassembly and see the instructions that are being generated:

<div class="text-sm my-10">

```wasm
(module
  (type (;0;) (func (param f32) (result f32)))
  (func (;0;) (type 0) (param f32) (result f32)
    (local v128)
    local.get 0
    f32x4.splat
    v128.const i32x4 0x3f800000 0x40000000 0x40400000 0x40800000
    f32x4.add
    local.tee 1
    f32x4.extract_lane 0
    f32.const 0x0p+0 (;=0;)
    f32.add
    local.get 1
    f32x4.extract_lane 1
    f32.add
    local.get 1
    f32x4.extract_lane 2
    f32.add
    local.get 1
    f32x4.extract_lane 3
    f32.add)
  (memory (;0;) 17)
  (export "memory" (memory 0))
  (export "test_simd" (func 0)))
```
</div>

<triangle-example /><triangle-example>
