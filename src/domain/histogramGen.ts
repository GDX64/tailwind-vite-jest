import { interval, map, scan, animationFrames } from 'rxjs';

function random(max: number) {
  return animationFrames().pipe(map(() => Math.random() * max));
}

export function createLiveHist(bucketSize: number, max: number) {
  return random(max).pipe(
    scan((acc, num) => {
      const bucket = calcBucket(bucketSize, num);
      const histCopy = [...acc];
      histCopy[bucket] += 1;
      return histCopy;
    }, Array(max / bucketSize).fill(0))
  );
}

function calcBucket(bucketSize: number, value: number) {
  return Math.floor(value / bucketSize);
}
