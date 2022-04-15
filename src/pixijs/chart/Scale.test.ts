import { YScale } from './Scale';

describe('Y Scale', () => {
  test('transform', () => {
    const yScale = new YScale({ from: [0, 10], to: [5, 10] });
    expect(yScale.transform(5)).toBe(7.5);
  });
  test('draw', () => {
    const yScale = new YScale({ from: [0, 10], to: [100, 0], quantity: 3 });
    expect(yScale.draw()).toMatchObject([
      { text: '0', y: 100 },
      { text: '5', y: 50 },
      { text: '10', y: 0 },
    ]);
  });
});
