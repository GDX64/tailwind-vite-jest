// import { GPU } from 'gpu.js';

// const gpu = new GPU();
// const multiplyMatrix = gpu
//   .createKernel(function (big: number[][], filter: number[][]) {
//     let sum = 0;
//     for (let i = 0; i < 10; i++) {
//       for (let j = 0; j < 10; j++) {
//         sum += big[this.thread.x + i][this.thread.y! + j] * filter[i][j];
//       }
//     }
//     this.color(sum, sum, sum);
//   })
//   .setOutput([900, 900])
//   .setGraphical(true);

// const matrixGen = (size: number, factor = 1) => {
//   const matrix: number[][] = [];
//   for (let y = 0; y < size; y++) {
//     matrix.push([]);
//     for (let x = 0; x < size; x++) {
//       matrix[y].push(Math.random() * factor);
//     }
//   }
//   return matrix;
// };

// export function test() {
//   multiplyMatrix.debug = true;
//   console.log(multiplyMatrix(matrixGen(1000), matrixGen(10, 0.01)));
//   console.log(multiplyMatrix.getPixels());
//   // console.log(filter(matrixGen(1000), matrixGen(2)));
//   document.body.appendChild(multiplyMatrix.canvas);
// }

// function filter(matrix: number[][], filter: number[][]) {
//   const result: number[][] = [];
//   for (let i = 0; i < matrix.length - 2; i++) {
//     result.push([]);
//     for (let j = 0; j < matrix.length - 2; j++) {
//       let sum = 0;
//       sum += matrix[i][j!] * filter[0][0];
//       sum += matrix[i + 1][j!] * filter[1][0];
//       sum += matrix[i + 1][j! + 1] * filter[1][1];
//       sum += matrix[i][j! + 1] * filter[0][1];
//       result[i].push(sum);
//     }
//   }
//   return result;
// }
