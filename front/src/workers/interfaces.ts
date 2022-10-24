export type GenericGet = {
  response: any;
  id: number;
  type: 'get';
  last: boolean;
  transfer?: Transferable[];
};

export type GenericRequest = {
  type: 'func';
  prop: string;
  args: any[];
  id: number;
};

export type FinishStream = {
  type: 'finish';
  id: number;
};

export type StartStream = {
  type: 'start';
  id: number;
  arg: any;
};

export type WorkerLike = Pick<Worker, 'addEventListener' | 'terminate' | 'postMessage'>;
