export type TableEl = { text: string; style: { color: string } };
const width = 600;
export function canvasRendering(
  table: TableEl[],
  ctx: OffscreenCanvasRenderingContext2D
) {
  ctx.clearRect(0, 0, width, 500);
  ctx.font = '12px serif';
  const colWidth = width / 5;
  const rowHeight = 25;
  table.forEach(({ text, style: { color } }, index) => {
    const colIndex = index % 5;
    const rowIndex = Math.floor(index / 5);
    const x = colIndex * colWidth;
    const y = rowHeight * rowIndex;
    ctx!.fillStyle = color;
    ctx!.fillText(text, x, y);
  });
}
