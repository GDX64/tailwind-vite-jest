import { Sprite, Texture } from "pixi.js";
import { GElement } from "./Elements";

export default class GSprite extends GElement {
  pixiRef: Sprite = new Sprite();
  patch(prop: string, prev: any, next: any): void {
    super.patch(prop, prev, next);
    switch (prop) {
      case "width":
        this.pixiRef.width = next;
        break;
      case "height":
        this.pixiRef.height = next;
        break;
      case "url":
        this.pixiRef.texture = Texture.from(next);
        break;
      case "texture":
        if (next) {
          this.pixiRef.texture = next;
        }
        break;
      default:
        break;
    }
  }
}
