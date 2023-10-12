import * as PIXI from "pixi.js";
import { LayoutKind } from "./Layout";

export enum ElTags {
  TEXT = "g-text",
  RECT = "g-rect",
}

export type LayoutBox = {
  width: number;
  height: number;
  x: number;
  y: number;
};

export class GElement {
  pixiRef: PIXI.Container = new PIXI.Container();
  parent: null | GElement = null;
  children: GElement[] = [];
  width = null as null | number;
  height = null as null | number;
  position = LayoutKind.ABSOLUTE;
  dirtyLayout = true;
  layout = {
    width: 0,
    height: 0,
    x: 0,
    y: 0,
  };

  marklayoutDirty() {
    this.dirtyLayout = true;
    this.parent?.marklayoutDirty();
  }

  static text(str: string) {
    return new GText(str);
  }

  updateLayout(result: LayoutBox) {
    this.layout = result;
    this.dirtyLayout = false;
  }

  patch(prop: string, prev: any, next: any) {}

  addChild(child: GElement) {
    child.parent = this;
    this.children.push(child);
    this.pixiRef.addChild(child.pixiRef);
  }

  setText(str: string) {}

  addChildAt(child: GElement, index: number) {
    child.parent = this;
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

  updateLayout(result: LayoutBox): void {
    this.dirtyLayout = false;
    this.layout = result;
    this.redraw();
  }

  redraw() {
    this.pixiRef.clear();
    const { height, width, x, y } = this.layout;
    const rect = this.pixiRef.rect(0, 0, width, height);
    rect.fillStyle = this.fill;
    rect.fill();
    this.pixiRef.x = x;
    this.pixiRef.y = y;
  }

  patch(prop: string, prev: any, next: any) {
    switch (prop) {
      case "position":
        this.position = next;
        break;
      case "onClick":
        this.pixiRef.interactive = true;
        this.pixiRef.on("click", next);
        break;
      case "width":
        this.width = next;
        this.marklayoutDirty();
        break;
      case "height":
        this.height = next;
        this.marklayoutDirty();
        break;
      case "x":
        this.pixiRef.x = next;
        break;
      case "y":
        this.pixiRef.y = next;
        break;
      case "fill":
        this.fill = next;
        this.marklayoutDirty();
        break;
      default:
        break;
    }
  }
}

export class GText extends GElement {
  pixiRef: PIXI.Text = new PIXI.Text({});
  constructor(str: string) {
    super();
    this.pixiRef.text = str;
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
