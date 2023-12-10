## WASM SIMD
<br />

It has been a while a wanted to mess with some SIMD instructions in webassembly and
native. But one of the things that kind of stopped me of doing things with SIMD is
the lack of portablility. If you want to write SIMD code you usually need to use
platform specific code. But recently I found [this article](https://mcyoung.xyz/2023/11/27/simd-base64/) about the portable SIMD rust library.
<br />
This is part of the standard library of rust, but it is still in a very early stage
and needs to be used with the nightly compiler. But I found it to work pretty well
and it is very easy to use. It really improves performance and the same code can
targer ARM, x86 and WASM.
<br />
This is what the code looks like when you use those SIMD functions:
