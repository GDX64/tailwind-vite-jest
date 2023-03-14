import { bilinearInterpolation } from './math';

describe('tests math utils', () => {
  test('bilinear basics', () => {
    const bil = bilinearInterpolation(
      [
        [0, 1],
        [0, 1],
      ],
      [0, 3, 4, 5]
    );

    expect(bil(0, 0)).toBe(0);
    expect(bil(1, 0)).toBe(3);
    expect(bil(0, 1)).toBe(4);
    expect(bil(1, 1)).toBe(5);
  });
});
