import { DefineComponent } from 'vue';
import { Line } from './RealRenderer';
import { Graphics } from 'pixi.js';
type Prop = Line['data'];
type FlatTypes<T> = { [K in keyof T]: T[K] };
export type GLineType = DefineComponent<Prop>;
export type PGraphics = DefineComponent<Partial<FlatTypes<Graphics>>>;
