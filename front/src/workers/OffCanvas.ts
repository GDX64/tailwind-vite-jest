import { createOffCanvasInst } from './OffCanvasInst';
import { expose } from './ProxyWorker';

const worker = self as any as Worker;

expose(createOffCanvasInst, worker);
