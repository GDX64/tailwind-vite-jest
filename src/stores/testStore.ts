import { makeStore } from './storeUtils';

const { provideIt: provideTestStore, useIt: useTestStore } = makeStore({
  state: () => ({ message: 'hello' }),
  actions: {
    update(other: string) {
      this.message = other;
    },
  },
});

export { provideTestStore, useTestStore };
