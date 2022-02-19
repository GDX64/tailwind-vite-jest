import { interval, map, scan, animationFrames, range } from 'rxjs';

function random(max: number) {
  return animationFrames().pipe(map(() => boxMullerTransform() * max));
}

export function createLiveHist(bucketSize: number, max: number) {
  return random(max).pipe(
    scan(
      (acc, num) => {
        return adjustBucketRange(num, { ...acc, bucketSize });
      },
      { min: Infinity, max: -Infinity, histObj: {} as HistObj }
    ),
    map((obj) => histListFromObj(obj.histObj))
  );
}

function histListFromObj(histObj: HistObj) {
  return Object.keys(histObj)
    .map(Number)
    .sort((a, b) => a - b)
    .map((key) => histObj[key] as Bucket);
}

function calcBucket(bucketSize: number, value: number) {
  return Math.floor(value / bucketSize);
}

function boxMullerTransform() {
  const u1 = Math.random();
  const u2 = Math.random();
  return Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
}

type HistObj = {
  [key: number]: Bucket | undefined;
};

export type Bucket = { label: number; count: number };

function adjustBucketRange(
  newValue: number,
  {
    min,
    max,
    histObj,
    bucketSize,
  }: { min: number; max: number; histObj: HistObj; bucketSize: number }
) {
  const bucket = calcBucket(bucketSize, newValue);
  const newMin = bucket < min ? bucket : min;
  const newMax = bucket > max ? bucket : max;
  for (let i = newMin; i <= newMax; i++) {
    histObj[i] = histObj[i] ?? defaultBucket(i * bucketSize);
  }
  const bucketObj = histObj[bucket * bucketSize] ?? defaultBucket(bucket);
  bucketObj.count += 1;
  return { histObj, min: newMin, max: newMax };
}

function defaultBucket(bucket: number) {
  return { label: bucket, count: 0 };
}
