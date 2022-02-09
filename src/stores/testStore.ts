import {
  defineComponent,
  inject,
  InjectionKey,
  provide,
  reactive,
  ref,
  Ref,
  toRefs,
} from 'vue';

function addState<T extends {}>(state: () => T) {
  return {
    addActions<A extends { [key: string]: (this: { state: T }, ...args: any[]) => void }>(
      actions: A
    ) {
      function makeContext() {
        const stateObj = reactive(state());
        return {
          state: stateObj,
          ...actions,
        };
      }
      const context = makeContext();
      const contextKey: InjectionKey<typeof context> = Symbol('context');
      return {
        provideIt(customState?: T) {
          provide(contextKey, customState ? { ...context, state: customState } : context);
        },
        useIt() {
          const ctx = inject(contextKey, makeContext());
          return { ...toRefs(ctx.state as Readonly<T>), ...ctx };
        },
      };
    },
  };
}

const { provideIt: provideTestStore, useIt: useTestStore } = addState(() => ({
  message: 'hello',
})).addActions({
  update(other: string) {
    this.state.message = other;
  },
});

export { provideTestStore, useTestStore };
