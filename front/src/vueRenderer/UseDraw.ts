import { Application } from 'pixi.js';
import { inject, provide } from 'vue';

export function provideData(drawData: {
  width: number;
  height: number;
  isVisible: boolean;
}) {
  provide('drawData', drawData);
}

export function createDrawData() {
  return {
    realWidth: 0,
    realHeight: 0,
    width: 0,
    height: 0,
    isVisible: true,
    roughness: 1,
    app: null as null | Application,
  };
}

export function useDrawData() {
  return inject('drawData', createDrawData());
}
