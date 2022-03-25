import { EMPTY, Subject } from 'rxjs';
import { Chart, ChartApplication } from './Chart';
import { Scale } from './Scale';
import { Stick, StickPlot } from './StickPlot';

const stick = (pos: number, min: number, max: number) => ({ pos, min, max });

describe('test scale', () => {
  test('should map range', () => {
    const scale = new Scale(0, 10, 20, 40);
    expect(scale.transform(0)).toBe(20);
    expect(scale.transform(10)).toBe(40);
    expect(scale.transform(5)).toBe(30);
  });
});
describe('Test StickPlot', () => {
  test('Should have the right min and max', () => {
    const plot = new StickPlot({
      clear() {},
      lineTo() {},
      moveTo() {},
    } as any);
    expect(plot.getMinMax()).toMatchObject({ min: 0, max: 0 });
    plot.setRange(5, 10);
    expect(plot.getMinMax()).toMatchObject({ min: 0, max: 0 });
    plot.setData([stick(0, 1, 5), stick(5, 2, 3), stick(9, 4, 4), stick(11, 5, 7)]);
    expect(plot.getMinMax()).toMatchObject({ min: 2, max: 4 });
  });
});
describe('Test Chart', () => {
  test('Should transform data correctly', () => {
    const plot = mockPlot([
      stick(0, 1, 5),
      stick(5, 2, 3),
      stick(9, 4, 4),
      stick(11, 5, 7),
    ]);
    const chart = new Chart(mockApp());
    chart.addPlot(plot);
    chart.setRange(5, 10);
    expect(chart.draw()).toMatchObject([
      {
        data: [
          { pos: 0, min: 100, max: 50 },
          { pos: 80, min: 0, max: 0 },
        ],
      },
    ]);
  });

  test('chart wheel', () => {
    const wheelInput = new Subject<number>();
    const chart = new Chart(mockApp({ wheelInput }));
    chart.addPlot(mockPlot([stick(0, 0, 0), stick(100, 0, 0)]));
    chart.setRange(20, 40);
    wheelInput.next(0.05);
    expect(chart.getRange()).toMatchObject([21, 41]);
  });
});

function mockPlot(data: Stick[]) {
  const plot = new StickPlot({
    clear() {},
    lineTo() {},
    moveTo() {},
    lineStyle() {},
  } as any);
  plot.setData(data);
  return plot;
}

function mockApp(options = {} as Partial<ChartApplication>): ChartApplication {
  return { screen: { width: 100, height: 100 }, wheelInput: EMPTY, ...options };
}
