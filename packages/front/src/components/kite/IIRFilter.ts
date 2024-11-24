export class IIRHighPassFilter {
  private a: number[];
  private b: number[];
  private x: number[];
  private y: number[];

  constructor(cutoffFrequency: number, sampleRate: number) {
    const omega = (2 * Math.PI * cutoffFrequency) / sampleRate;
    const alpha = Math.sin(omega) / 2;

    this.b = [
      (1 + Math.cos(omega)) / 2,
      -(1 + Math.cos(omega)),
      (1 + Math.cos(omega)) / 2,
    ];

    this.a = [1 + alpha, -2 * Math.cos(omega), 1 - alpha];

    // Normalize the coefficients
    for (let i = 0; i < this.b.length; i++) {
      this.b[i] /= this.a[0];
    }
    for (let i = 1; i < this.a.length; i++) {
      this.a[i] /= this.a[0];
    }
    this.a[0] = 1;

    this.x = [0, 0, 0];
    this.y = [0, 0, 0];
  }

  public process(sample: number): number {
    this.x[2] = this.x[1];
    this.x[1] = this.x[0];
    this.x[0] = sample;

    this.y[2] = this.y[1];
    this.y[1] = this.y[0];
    this.y[0] =
      this.b[0] * this.x[0] +
      this.b[1] * this.x[1] +
      this.b[2] * this.x[2] -
      this.a[1] * this.y[1] -
      this.a[2] * this.y[2];

    return this.y[0];
  }
}

export class IIRLowPassFilter {
  private a: number[];
  private b: number[];
  private x: number[];
  private y: number[];

  constructor(cutoffFrequency: number, sampleRate: number) {
    const omega = (2 * Math.PI * cutoffFrequency) / sampleRate;
    const alpha = Math.sin(omega) / 2;

    this.b = [(1 - Math.cos(omega)) / 2, 1 - Math.cos(omega), (1 - Math.cos(omega)) / 2];

    this.a = [1 + alpha, -2 * Math.cos(omega), 1 - alpha];

    // Normalize the coefficients
    for (let i = 0; i < this.b.length; i++) {
      this.b[i] /= this.a[0];
    }
    for (let i = 1; i < this.a.length; i++) {
      this.a[i] /= this.a[0];
    }
    this.a[0] = 1;

    this.x = [0, 0, 0];
    this.y = [0, 0, 0];
  }

  public process(sample: number): number {
    this.x[2] = this.x[1];
    this.x[1] = this.x[0];
    this.x[0] = sample;

    this.y[2] = this.y[1];
    this.y[1] = this.y[0];
    this.y[0] =
      this.b[0] * this.x[0] +
      this.b[1] * this.x[1] +
      this.b[2] * this.x[2] -
      this.a[1] * this.y[1] -
      this.a[2] * this.y[2];

    return this.y[0];
  }
}
