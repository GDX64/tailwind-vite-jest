import { InjectionKey, Ref } from 'vue';

export const registerKey = Symbol() as InjectionKey<(x: number, data: any) => void>;
export const cursorKey = Symbol() as InjectionKey<Ref<number>>;
export const selectedKey = Symbol() as InjectionKey<(select: number) => void>;
