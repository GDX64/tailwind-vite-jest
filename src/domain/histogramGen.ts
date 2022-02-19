import { interval, map, scan, animationFrames, range } from 'rxjs';

function random(max: number) {
  return animationFrames().pipe(map(() => boxMullerTransform() * max));
}

export function createLiveHist(bucketSize: number, max: number) {
  return random(max).pipe(
    scan((acc, num) => {
      const bucket = calcBucket(bucketSize, num);
      acc[bucket] = (acc[bucket] ?? 0) + 1;
      return acc;
    }, {} as { [key: number]: number | undefined }),
    map((obj) => histListFromObj(obj, bucketSize))
  );
}

function calcBucket(bucketSize: number, value: number) {
  return Math.floor(value / bucketSize);
}

function boxMullerTransform() {
  const u1 = Math.random();
  const u2 = Math.random();
  return Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
}

function histListFromObj(obj: { [key: number]: number | undefined }, bucketSize: number) {
  const keys = Object.keys(obj).map(Number);
  const [max, min] = [Math.max(...keys), Math.min(...keys)];
  for (let i = min; i <= max; i += bucketSize) {
    obj[i] = obj[i] ?? 0;
  }
  return Object.keys(obj)
    .map(Number)
    .sort((a, b) => a - b)
    .map((key) => obj[key])
    .filter(Boolean) as number[];
}
