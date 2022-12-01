export function randomColor() {
  const randByte = () => Math.floor(Math.random() * 256);
  return randByte() | (randByte() << 8) | (randByte() << 16);
}

export function randRange(start: number, finish: number): number {
  return Math.random() * (finish - start) + start;
}
