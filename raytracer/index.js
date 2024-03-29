import init, { raster_triangle } from "./pkg/raytracer.js";
init().then(() => {
  const canvas = document.createElement("canvas");
  document.body.appendChild(canvas);
  const width = Math.floor(canvas.offsetWidth * devicePixelRatio);
  const height = Math.floor(canvas.offsetHeight * devicePixelRatio);
  canvas.width = width;
  canvas.height = height;
  const array = new Uint32Array(width * height);
  const elapsed = raster_triangle(
    {
      width,
      height,
      p1: [width / 2, 0, 0],
      p2: [0, height, 0],
      p3: [width, height, 0],
    },
    array
  );
  const ctx = canvas.getContext("2d");
  const imageData = ctx.createImageData(width, height);
  imageData.data.set(new Uint8ClampedArray(array.buffer));
  ctx.putImageData(imageData, 0, 0);
  ctx.font = "32px serif";
  ctx.textBaseline = "top";
  ctx.fillText(`simd: ${elapsed.simd}, no simd: ${elapsed.no_simd}`, 10, 10);
});
