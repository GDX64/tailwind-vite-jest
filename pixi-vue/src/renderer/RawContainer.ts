import { Container, View } from "pixi.js";
import { GElement } from "./Elements";

export default class RawContainer extends GElement {
  constructor() {
    super();
  }

  patch(prop: string, prev: any, next: any) {
    switch (prop) {
      case "pixiEl":
        this.pixiRef.removeChildren().forEach((child) => child.destroy());
        this.pixiRef.addChild(next);
        break;
      case "x":
        this.pixiRef.x = next;
        break;
      case "y":
        this.pixiRef.y = next;
        break;
      default:
        break;
    }
  }
}
