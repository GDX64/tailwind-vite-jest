export enum LayoutKind {
  HORIZONTAL = "HORIZONTAL",
  VERTICAL = "VERTICAL",
  ABSOLUTE = "ABSOLUTE",
}

export class LayoutBox {
  width: number | null = null;
  height: number | null = null;
  x: number = 0;
  y: number = 0;
  kind: LayoutKind = LayoutKind.HORIZONTAL;
  children: LayoutBox[] = [];

  addChild(child: LayoutBox) {
    this.children.push(child);
  }

  removeChild(child: LayoutBox) {
    const index = this.children.findIndex((item) => item === child);
    if (index === -1) return;
    this.children.splice(index, 1);
  }

  calculateLayout(): LayoutResult {
    if (this.kind === LayoutKind.HORIZONTAL) {
      return this.calculateSizesHorizontal();
    }
    return null!;
  }

  calculateSizesHorizontal(): LayoutResult {
    const result = new LayoutResult();
    let x = 0;
    let finalWidth = 0;
    let maxHeight = 0;
    for (const child of this.children) {
      const childResult = child.calculateLayout();
      childResult.x = x;
      childResult.y = 0;
      x += childResult.width;
      finalWidth += childResult.width;
      result.children.push(childResult);
      maxHeight = Math.max(maxHeight, childResult.height);
    }
    if (this.width == null) {
      result.width = finalWidth;
    } else {
      result.width = this.width;
    }
    if (this.height == null) {
      result.height = maxHeight;
    } else {
      result.height = this.height;
    }
    return result;
  }
}

export class LayoutResult {
  width = 0;
  height = 0;
  x = 0;
  y = 0;
  children: LayoutResult[] = [];
  parent: LayoutResult | null = null;
}
