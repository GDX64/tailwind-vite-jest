import * as PIXI from "pixi.js";

export enum ElTags {
  TEXT = "g-text",
  RECT = "g-rect",
  GRAPHICS = "g-graphics",
  CONTAINER = "g-container",
  RAW = "g-raw",
  SPRITE = "g-sprite",
  ANIMATED_SPRITE = "g-animated-sprite",
}

export type LayoutBox = {
  width: number;
  height: number;
  x: number;
  y: number;
};

export type ELKey = string | number | null;

export class GElement {
  pixiRef: PIXI.Container = new PIXI.Container();
  parent = null as any;
  children: GElement[] = [];
  x = 0;
  y = 0;
  width = 0;
  height = 0;
  isDirty = true;
  elKey = null as ELKey;

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
      case "visible": {
        this.pixiRef.visible = next;
        break;
      }
      case "alpha":
        this.pixiRef.alpha = next;
        break;
      case "onClick":
        this.pixiRef.interactive = true;
        this.pixiRef.onclick = (event) => next(event, this);
        break;
      case "onPointerdown":
        this.pixiRef.interactive = true;
        this.pixiRef.onpointerdown = (event) => next(event, this);
        break;
      case "onPointerup":
        this.pixiRef.interactive = true;
        this.pixiRef.onpointerup = (event) => next(event, this);
        break;
      case "onPointermove":
        this.pixiRef.interactive = true;
        this.pixiRef.onpointermove = (event) => next(event, this);
        break;
      case "blendMode":
        this.pixiRef.blendMode = next;
        break;
      case "scale":
        this.pixiRef.scale.set(next, next);
        break;
      case "rotation":
        this.pixiRef.rotation = next;
        break;
      case "originX":
        this.pixiRef.pivot.x = next;
        break;
      case "originY":
        this.pixiRef.pivot.y = next;
        break;
      case "x":
        this.x = next;
        this.pixiRef.x = next;
        break;
      case "elKey":
        this.elKey = next;
      case "y":
        this.y = next;
        this.pixiRef.y = next;
        break;
      default:
    }
  }

  addChild(child: GElement) {
    child.parent = createWeakRef(this);
    this.children.push(child);
    this.pixiRef.addChild(child.pixiRef);
    this.markDirty();
  }

  markDirty() {
    this.isDirty = true;
    this.parent?.deref()?.markDirty();
  }

  setText(str: string) {
    console.log("set text", str);
  }

  addChildAt(child: GElement, index: number) {
    child.parent = createWeakRef(this as GElement);
    this.children.splice(index, 0, child);
    this.pixiRef.addChildAt(child.pixiRef, index);
    this.markDirty();
  }

  removeChild(child: GElement) {
    const index = this.children.findIndex((item) => item === child);
    if (index === -1) return;
    this.children.splice(index, 1);
    this.pixiRef.removeChild(child.pixiRef);
    this.markDirty();
  }

  replacePixiChild(oldNode: PIXI.Container, newNode: PIXI.Container) {
    this.pixiRef.swapChildren(oldNode, newNode);
  }

  destroy() {
    this.pixiRef.destroy({ children: true });
  }
}

export class GGraphics extends GElement {
  fill = 0xffffff;
  pixiRef: PIXI.Graphics = new PIXI.Graphics();
  drawfn: ((pixiRef: PIXI.GraphicsContext) => void) | null = null;

  redraw() {
    if (!this.isDirty) return;
    if (this.drawfn) {
      this.drawfn(this.pixiRef.context);
    }
    this.isDirty = false;
  }

  patch(prop: string, prev: any, next: any) {
    super.patch(prop, prev, next);
    switch (prop) {
      case "drawfn":
        this.pixiRef.clear();
        this.drawfn = next;
        this.markDirty();
        break;
      default:
        break;
    }
  }
}

export class GText extends GElement {
  pixiRef: PIXI.BitmapText;
  constructor(str: string) {
    super();
    this.pixiRef = new PIXI.BitmapText({ text: str });
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

function createWeakRef<T>(obj: T): any {
  const that = self as any;
  return new that.WeakRef(obj);
}
