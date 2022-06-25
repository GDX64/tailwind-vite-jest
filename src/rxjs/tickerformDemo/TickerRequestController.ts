import { map, Observable, Subject } from 'rxjs';
import { ref, Ref } from 'vue';
import { Requester, TickerData } from './interfaces';

export default class TickerRequestController {
  private ticker$ = new Subject<string>();
  private coin$ = new Subject<string>();
  private data$: Observable<TickerData[]>;
  constructor(private requester: Requester) {
    this.data$ = this.ticker$.pipe(map(() => []));
  }

  ticker(input: string) {
    this.ticker$.next(input);
  }

  coin(input: string) {
    this.coin$.next(input);
  }

  getReference(): Ref<TickerData[]> {
    const dataRef = ref([] as TickerData[]);
    this.data$.subscribe((data) => {
      dataRef.value = data;
    });
    return dataRef;
  }
}
