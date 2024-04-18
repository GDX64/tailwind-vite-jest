export class Scale2D {}

class Scale {
  alpha: number;
  k: number;
  constructor(alpha: number, k: number) {
    this.alpha = alpha;
    this.k = k;
  }

  static fromDomainImage(domain: [number, number], image: [number, number]) {
    const k = image[0] / domain[0];
    const alpha = image[1] / domain[1];
    return new Scale(alpha, k);
  }
}
