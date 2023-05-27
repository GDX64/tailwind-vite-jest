import { DefineComponent } from 'vue';
import { Line } from './RealRenderer';
import { Container, Graphics, Text } from 'pixi.js';
type Prop = Line['data'];
type FlatTypes<T> = { [K in keyof T]: T[K] };
export type GLineType = DefineComponent<Prop>;
export type PGraphics = DefineComponent<Partial<FlatTypes<Graphics>>>;
export type PContainer = DefineComponent<Partial<FlatTypes<Container>>>;
export type PText = DefineComponent<Partial<FlatTypes<Text>>>;
