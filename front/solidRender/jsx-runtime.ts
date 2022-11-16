import * as PIXI from 'pixi.js';

export namespace JSX {
  export interface IntrinsicElements {
    cont: {};
  }

  export interface Element extends PIXI.Container {}
}
