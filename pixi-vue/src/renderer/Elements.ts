import * as PIXI from "pixi.js";

export enum ElTags {
  TEXT = "g-text",
  RECT = "g-rect",
  CONTAINER = "g-container",
}

export type LayoutBox = {
  width: number;
  height: number;
  x: number;
  y: number;
};

declare global {
  interface WeakRef<T> {
    deref(): T | undefined;
  }

  interface WeakRefConstructor {
    prototype: WeakRef<any>;
    new <T extends Object>(target: T): WeakRef<T>;
  }

  const WeakRef: WeakRefConstructor;
}

export class GElement {
  pixiRef: PIXI.Container = new PIXI.Container();
  parent = null as WeakRef<GElement> | null;
  children: GElement[] = [];
  x = 0;
  y = 0;
  width = 0;
  height = 0;
  isDirty = true;

  redraw() {
    if (!this.isDirty) return;
    this.children.forEach((child) => child.redraw());
    this.isDirty = false;
  }

  static text(str: string) {
    return new GText(str);
  }

  patch(prop: string, prev: any, next: any) {
    switch (prop) {
      case "x":
        this.x = next;
        this.pixiRef.x = next;
        break;
      case "y":
        this.y = next;
        this.pixiRef.y = next;
        break;
      default:
    }
  }

  addChild(child: GElement) {
    child.parent = new WeakRef(this);
    this.children.push(child);
    this.pixiRef.addChild(child.pixiRef);
  }

  markDirty() {
    this.isDirty = true;
    this.parent?.deref()?.markDirty();
  }

  setText(str: string) {
    console.log("set text", str);
  }

  addChildAt(child: GElement, index: number) {
    child.parent = new WeakRef(this);
    this.children.splice(index, 0, child);
    this.pixiRef.addChildAt(child.pixiRef, index);
  }

  removeChild(child: GElement) {
    const index = this.children.findIndex((item) => item === child);
    if (index === -1) return;
    this.children.splice(index, 1);
    this.pixiRef.removeChild(child.pixiRef);
  }
}

export class GRect extends GElement {
  fill = 0xffffff;
  pixiRef: PIXI.Graphics = new PIXI.Graphics();
  drawfn: (pixiRef: PIXI.Graphics) => void | null;

  redraw() {
    if (!this.isDirty) return;
    if (this.drawfn) {
      this.drawfn(this.pixiRef);
    } else {
      this.pixiRef.clear();
      const { height, width, x, y } = this;
      const rect = this.pixiRef.rect(0, 0, width, height);
      rect.fillStyle = this.fill;
      rect.fill();
      this.pixiRef.x = x;
      this.pixiRef.y = y;
    }
    this.isDirty = false;
  }

  patch(prop: string, prev: any, next: any) {
    switch (prop) {
      case "drawfn":
        this.pixiRef.clear();
        this.drawfn = next;
        this.markDirty();
        break;
      case "onClick":
        this.pixiRef.interactive = true;
        this.pixiRef.onclick = next;
        break;
      case "onPointerdown":
        this.pixiRef.interactive = true;
        this.pixiRef.onpointerdown = next;
        break;
      case "onPointerup":
        this.pixiRef.interactive = true;
        this.pixiRef.onpointerup = next;
        break;
      case "onPointermove":
        this.pixiRef.interactive = true;
        this.pixiRef.onpointermove = (event) => next(event.nativeEvent);
        break;
      case "width":
        this.width = next;
        this.markDirty();
        break;
      case "height":
        this.height = next;
        this.markDirty();
        break;
      case "x":
        this.x = next;
        this.pixiRef.x = next;
        break;
      case "y":
        this.y = next;
        this.pixiRef.y = next;
        break;
      case "fill":
        this.fill = next;
        this.markDirty();
        break;
      default:
        break;
    }
  }
}

export class GText extends GElement {
  pixiRef: PIXI.Text;
  constructor(str: string) {
    super();
    this.pixiRef = new PIXI.Text({ text: str, renderMode: "bitmap" });
  }

  setText(str: string) {
    this.pixiRef.text = str;
  }

  patch(prop: string, prev: any, next: any) {
    switch (prop) {
      case "fill":
        this.pixiRef.style.fill = next;
        break;
      case "x":
        this.pixiRef.x = next;
        break;
      case "y":
        this.pixiRef.y = next;
        break;
      case "fontSize":
        this.pixiRef.style.fontSize = next;
        break;
      default:
        break;
    }
  }
}
