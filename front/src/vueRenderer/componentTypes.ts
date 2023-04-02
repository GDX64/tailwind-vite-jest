import { DefineComponent } from 'vue';
import { Line } from './RealRenderer';
type Prop = Line['data'];

export type GLineType = DefineComponent<Prop>;
