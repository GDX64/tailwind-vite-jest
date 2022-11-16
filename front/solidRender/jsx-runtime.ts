import * as PIXI from 'pixi.js';

interface Cont extends PIXI.Container {
  children: any;
}

export namespace JSX {
  export interface IntrinsicElements {
    cont: Partial<Cont>;
    text: Partial<PIXI.Text>;
    Graphic: {};
  }

  export interface Element extends PIXI.Container {}

  export interface ElementChildrenAttribute {
    children?: any;
  }
}
