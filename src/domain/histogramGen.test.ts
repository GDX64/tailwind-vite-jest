import { of, lastValueFrom } from 'rxjs';
import { Bucket, createLiveHist } from './histogramGen';

describe('test histogram', () => {
  test('should agragate data correctly', async () => {
    const histInfo = await lastValueFrom(createLiveHist(3, of(1, 2, 3, 4, 5)));
    expect(histInfo.histList).toMatchObject([
      { label: 0, count: 2 },
      { label: 3, count: 3 },
    ] as Bucket[]);
  });
});
