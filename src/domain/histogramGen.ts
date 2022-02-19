import { map, scan, animationFrames, Observable } from 'rxjs';
import { reactive } from 'vue';

function random(max: number) {
  return animationFrames().pipe(map(() => boxMullerTransform() * max));
}

export function createLiveHist(bucketSize: number, from: Observable<number> = random(5)) {
  return from.pipe(
    scan(
      (acc, num) => {
        return adjustBucketRange(num, { ...acc, bucketSize });
      },
      { min: Infinity, max: -Infinity, histObj: {} as HistObj, maxCount: 0 }
    ),
    scan(
      (acc, obj) => {
        if (Object.keys(obj.histObj).length === acc.histList.length) {
          return { histList: acc.histList, maxCount: obj.maxCount };
        }
        return { histList: histListFromObj(obj.histObj), maxCount: obj.maxCount };
      },
      { histList: [] as Bucket[], maxCount: 0 }
    )
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
    maxCount,
  }: { min: number; max: number; histObj: HistObj; bucketSize: number; maxCount: number }
) {
  const bucket = calcBucket(bucketSize, newValue);
  const newMin = Math.min(bucket, min);
  const newMax = Math.max(bucket, max);
  for (let i = newMin; i <= newMax; i++) {
    histObj[i] = histObj[i] ?? defaultBucket(i * bucketSize);
  }
  const bucketObj = histObj[bucket] ?? defaultBucket(bucket);
  bucketObj.count += 1;
  return {
    histObj,
    min: newMin,
    max: newMax,
    maxCount: Math.max(bucketObj.count, maxCount),
  };
}

function defaultBucket(bucket: number) {
  return reactive({ label: bucket, count: 0 });
}
