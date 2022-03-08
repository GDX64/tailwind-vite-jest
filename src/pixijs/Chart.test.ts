import { Scale } from './Chart';

describe('test scale', () => {
  test('should map range', () => {
    const scale = new Scale(0, 10, 20, 40);
    expect(scale.transform(0)).toBe(20);
    expect(scale.transform(10)).toBe(40);
    expect(scale.transform(5)).toBe(30);
  });
});
