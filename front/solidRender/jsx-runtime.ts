import * as PIXI from 'pixi.js';

interface Cont extends PIXI.Container, CustomAttr<PIXI.Graphics> {
  children: any;
}

interface CustomAttr<T> {
  ref?: T | ((e: T) => void);
}

export namespace JSX {
  export interface IntrinsicElements {
    cont: Partial<Cont>;
    text: Partial<PIXI.Text>;
    Graphic: {};
  }

  export interface Element extends PIXI.Container {}

  export interface IntrinsicAttributes {
    ref?: unknown | ((e: unknown) => void);
  }

  export interface ElementChildrenAttribute {
    children?: any;
  }
}
