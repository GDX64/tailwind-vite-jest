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
  arg: any;
  id: number;
};

export type FinishStream = {
  type: 'finish';
  id: number;
};

export type WorkerLike = Pick<Worker, 'addEventListener' | 'postMessage'>;
