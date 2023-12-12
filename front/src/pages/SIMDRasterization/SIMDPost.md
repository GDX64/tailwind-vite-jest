## WASM SIMD


It has been a while a wanted to mess with some SIMD instructions in webassembly and
native. But one of the things that kind of stopped me of doing things with SIMD is
the lack of portablility. If you want to write SIMD code you usually need to use
platform specific code. But recently I found [this article](https://mcyoung.xyz/2023/11/27/simd-base64/) about the portable SIMD rust library.


This is part of the standard library of rust, but it is still in a very early stage
and needs to be used with the nightly compiler. But I found it to work pretty well
and it is very easy to use. It really improves performance and the same code can
targer ARM, x86 and WASM.


## Some steps to get SIMD working in rust native and wasm


* You need to add `#![feature(stdsimd)]` to the top of your lib.rs file. Remember, this is a nightly feature
* You need to create a `.cargo/config.toml` file and put this for wasm to be converted to SIMD instructions, if you don't do this, the wasm will be converted to scalar instructions:
  

```toml
[target.wasm32-unknown-unknown]
rustflags = ["-C", "target-feature=+simd128"]
```


This is what the code looks like when you use those SIMD functions:


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

In the code above we create a SIMD vector with 128bits, that is going to be translated into a **v128** in wasm,
in fact, we can easily look into the webassembly and see the instructions that are being generated:


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


We can see that a single **f32x4.add** is being executed, but later we have 4 f32.add, this is because wasm SIMD does not support horizontal operations, so we need to extract the lanes and add them together.

In my tests I found native SIMD to be 2x as fast as wasm SIMD, and in both native and wasm, SIMD was around 3x faster than scalar instructions. 

## Triangle Rasterization

To test SIMD I decided to implement a triangle rasterizer, because it is simple and is highly parallelizable. To rasterize a triangle we need to find out what pixels are inside the triangle to fill them with a color. I used the method providede by Gustavo in [this video](https://youtu.be/k5wtuKWmV48?si=3VRidhYVkLBwYfZ4).

The method is basicaly to interpret the triangle as 3 vectors and test each of the vectors against the point you want to test if is inside the triangle, you do the cross product of those two and if the result is positive, it means the point is from the right of the vector you tested. If all 3 results are positive, the point is inside the triangle.

With this method each pixel has nothing to do with the other pixels, so it is very easy to parallelize. this is what the code looks like:

```rust
struct NormalTriangle {
    abc: [V3D; 3],
    v012: [V3D; 3],
}

impl NormalTriangle {
    fn is_inside(&self, p: &V3D) -> bool {
        let cross0 = (*p - self.abc[0]).cross_z(&self.v012[0]);
        let cross1 = (*p - self.abc[1]).cross_z(&self.v012[1]);
        let cross2 = (*p - self.abc[2]).cross_z(&self.v012[2]);
        cross0.is_sign_positive() && cross1.is_sign_positive() && cross2.is_sign_positive()
    }
}
```

When I first tried to use SIMD to speed up the computations my first thought was to represent the vectos as 4 **f32x4** and speed up the cross product and point difference calculation, this gave me some 30%, wich is not that much. The problem with this aproach is that you need to use horizontal operations to get the final result, wich makes the process slower. The best approach I've found is to calculate 4 pixels at once like this:

```rust
struct SimdTriangle {
    x1: simd::f32x4,
    x2: simd::f32x4,
    x3: simd::f32x4,
    y1: simd::f32x4,
    y2: simd::f32x4,
    y3: simd::f32x4,
    vx1: simd::f32x4,
    vx2: simd::f32x4,
    vx3: simd::f32x4,
    vy1: simd::f32x4,
    vy2: simd::f32x4,
    vy3: simd::f32x4,
}

impl SimdTriangle {
    fn is_inside(&self, x: simd::f32x4, y: simd::f32x4) -> simd::Mask<i32, 4> {
        let zeros = simd::f32x4::splat(0.0);
        let cross0 = (x - self.x1) * self.vy1 - (y - self.y1) * self.vx1;
        let cross1 = (x - self.x2) * self.vy2 - (y - self.y2) * self.vx2;
        let cross2 = (x - self.x3) * self.vy3 - (y - self.y3) * self.vx3;
        let sign0 = cross0.simd_ge(zeros);
        let sign1 = cross1.simd_ge(zeros);
        let sign2 = cross2.simd_ge(zeros);
        let mask = sign0 & sign1 & sign2;
        mask
    }
}
```

The idea is we store on the triangle 4 times the data we would normaly need, each point is repeated 4 times. The `is_inside` function takes 4 points at once and calculates the cross product for all of them at once, using the same triangle data. For this to work we need to unroll the loop that goes through all the pixels and calculate 4 pixels at once, steping in chunks of 4.

This is the normal loop without SIMD:
    
```rust
pub fn rasterize(&self, triangle: &Triangle, canvas: &mut [u32], width: usize) {
    //find triangle boundaries so we don't have to check all the canvas
    let (min, max) = triangle.as_slice().min_max();
    let normal_triangle = NormalTriangle::from_triangle(triangle);
    for y in min.y as usize..=max.y as usize {
        let index_start = y * width + min.x as usize;
        let index_end = y * width + max.x as usize;
        if index_end >= canvas.len() {
            break;
        }
        let mut x = min.x;
        canvas[index_start..index_end].iter_mut().for_each(|color| {
            let p = V3D::new(x as f64, y as f64, 0.0);
            if normal_triangle.is_inside(&p) {
                *color = PAINT_COLOR;
            }
            x += 1.0;
        });
    }
}
```

This one looks uglier, but don't bother. You can see that the structure is the same as the simple one, the only changed the **iter_mut** for a **chunks_exact_mut**, and we are using vectors instead of normal scalars.

```rust
pub fn rasterize_simd(&self, triangle: &Triangle, canvas: &mut [u32], width: usize) {
    let (min, max) = triangle.as_slice().min_max();
    let simd_triangle = SimdTriangle::from_triangle(triangle);
    let vx0 = simd::f32x4::from_array([0.0, 1.0, 2.0, 3.0]);
    let vx0 = vx0 + simd::f32x4::splat(min.x as f32);
    let add_four = simd::f32x4::splat(4.0);
    let paint_values = simd::u32x4::splat(0xff0000ff);
    let not_paint_values = simd::u32x4::splat(0xaaaaaaaa);

    for y in min.y as usize..=max.y as usize {
        let mut vx = vx0;
        let vy = simd::f32x4::splat(y as f32);
        let index_start = y * width + min.x as usize;
        let index_end = y * width + max.x as usize;
        if index_end >= canvas.len() {
            break;
        }

        //we use chunks exact because the compiler makes it much more efficient skiping the bounds check
        let mut chunks = canvas[index_start..index_end].chunks_exact_mut(4);
        chunks.borrow_mut().for_each(|chunk| {
            let mask = simd_triangle.is_inside(vx, vy);
            vx = vx + add_four;
            let painted = mask.select(paint_values, not_paint_values);
            painted.copy_to_slice(chunk);
        });

        //then we paint the remainder
        let remainder = chunks.into_remainder();
        if remainder.len() > 0 {
            let mask = simd_triangle.is_inside(vx, vy);
            let painted = mask.select(paint_values, not_paint_values).to_array();
            remainder
                .iter_mut()
                .zip(painted.into_iter())
                .for_each(|(c, p)| {
                    *c = p;
                });
        }
    }
}
```

Unrolling the loop comes with the problem that we need to deal with the remainder, so it duplicates the code a bit. But the performance is worth it. This is the result of the benchmark:

<triangle-example /><triangle-example>

## Conclusion

Even in my old android phone (a galaxy m30) the SIMD is taken place and speeding up around 3x the rendering. The code is not that much more complex. SIMD instructions can be a valid way of improving the performance of critical parts of your code.
