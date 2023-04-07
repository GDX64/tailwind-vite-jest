import { inject, provide } from 'vue';

export function provideData(drawData: {
  width: number;
  height: number;
  isVisible: boolean;
}) {
  provide('drawData', drawData);
}

export function useDrawData() {
  return inject('drawData', { width: 0, height: 0, isVisible: true });
}
