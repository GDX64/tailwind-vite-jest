import { Sprite, Texture } from "pixi.js";
import { GElement } from "./Elements";

export default class GSprite extends GElement {
  pixiRef: Sprite = new Sprite();
  width = 0;
  height = 0;

  constructor() {
    super();
  }

  patch(prop: string, prev: any, next: any): void {
    super.patch(prop, prev, next);
    switch (prop) {
      case "width":
        this.pixiRef.width = next;
        this.width = next;
        break;
      case "height":
        this.pixiRef.height = next;
        this.height = next;
        break;
      case "url":
        this.pixiRef.texture = Texture.from(next);
        break;
      case "texture":
        if (next) {
          this.pixiRef.texture = next;
          this.pixiRef.pivot.set(
            this.pixiRef.texture.width / 2,
            this.pixiRef.texture.height / 2
          );
        }
        break;
      default:
        break;
    }
    this.pixiRef.width = this.width;
    this.pixiRef.height = this.height;
  }
}
