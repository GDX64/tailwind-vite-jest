import { inject, InjectionKey, provide, reactive, toRefs } from 'vue';

export function makeStore<
  T extends {},
  A extends { [key: string]: (this: T, ...args: any[]) => void }
>({ state, actions }: { state: () => T; actions: A }) {
  function makeContext() {
    const stateObj = reactive(state());
    const bindedActions = mapObj(actions, (action) => action.bind(stateObj as any));
    return {
      state: stateObj,
      ...bindedActions,
    };
  }
  const contextKey: InjectionKey<ReturnType<typeof makeContext>> = Symbol('context');
  return {
    provideIt() {
      const context = makeContext();
      provide(contextKey, context);
      return context;
    },
    useIt() {
      const ctx = inject(contextKey, makeContext());
      const result = { ...toRefs(ctx.state), ...ctx };
      return result as Identity<typeof result>;
    },
    makeContext,
  };
}

type Identity<T> = T extends object
  ? {} & {
      [P in keyof T]: T[P];
    }
  : T;

export function mapObj<T extends { [key: string]: any }, K>(
  obj: T,
  fn: (x: T[keyof T]) => K
): { [key in keyof T]: K } {
  return Object.fromEntries(Object.keys(obj).map((key) => [key, fn(obj[key])])) as any;
}
