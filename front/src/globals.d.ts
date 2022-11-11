interface HTMLCanvasElement {
  transferControlToOffscreen?(): OffscreenCanvas;
}

interface OffscreenCanvasRenderingContext2D extends CanvasRenderingContext2D {
  commit?(): void;
}

interface OffscreenCanvas extends HTMLCanvasElement {}

interface Something {}
