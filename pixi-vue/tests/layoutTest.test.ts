import { expect, describe, test } from "vitest";
import { LayoutBox } from "../src/renderer/Layout";

describe("layout tests", () => {
  test("trivial layout", () => {
    const box1 = new LayoutBox();
    const boxChild1 = new LayoutBox();
    boxChild1.width = 50;
    boxChild1.height = 50;
    box1.addChild(boxChild1);
    const result = box1.calculateLayout();
    expect(result.x).toBe(0);
    expect(result.width).toBe(50);
  });
  test("should pass", () => {
    const box1 = new LayoutBox();
    const boxChild1 = new LayoutBox();
    boxChild1.width = null;
    boxChild1.height = null;
    const boxChild2 = new LayoutBox();
    boxChild2.width = 50;
    boxChild2.height = 50;
    box1.addChild(boxChild1);
    box1.addChild(boxChild2);

    const boxChild3 = new LayoutBox();
    boxChild3.width = 100;
    boxChild3.height = 50;
    boxChild1.addChild(boxChild3);

    const result = box1.calculateLayout();
    expect(result.x).toBe(0);
    expect(result.width).toBe(150);
    expect(result.children[0].x).toBe(0);
    expect(result.children[1].x).toBe(100);
  });
});
