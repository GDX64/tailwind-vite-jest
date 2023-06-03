import { Application } from 'pixi.js';
import { inject, provide, reactive } from 'vue';
import { ScaleXY } from './interfaces';

export function provideData(drawData: DrawData) {
  provide('drawData', drawData);
}

export function provideScale(scaleData: { scale: ScaleXY }) {
  provide('scaleData', scaleData);
}

export function useScaleData() {
  const scaleData: { scale: ScaleXY } = {
    scale: {
      alphaX: 1,
      alphaY: 1,
      x: (value) => value,
      y: (value) => value,
    },
  };
  return inject('scaleData', scaleData);
}

export function createDrawData() {
  return reactive({
    realWidth: 0,
    realHeight: 0,
    width: 0,
    devicePixelRatio: self.devicePixelRatio ?? 1,
    height: 0,
    isVisible: true,
    isPageActive: true,
    roughness: 1,
    app: null as null | Application,
  });
}

export function useDrawData() {
  return inject('drawData', createDrawData());
}

export type DrawData = ReturnType<typeof createDrawData>;
