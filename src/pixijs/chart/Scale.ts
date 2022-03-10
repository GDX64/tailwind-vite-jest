export class Scale {
  alpha: number;
  k: number;
  constructor(
    fromInitial: number,
    fromFinal: number,
    toInitial: number,
    toFinal: number
  ) {
    this.alpha = (toFinal - toInitial) / (fromFinal - fromInitial);
    this.k = toInitial - fromInitial * this.alpha;
  }
  transform(value: number) {
    return this.alpha * value + this.k;
  }
}
