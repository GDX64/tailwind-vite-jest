import { mount } from '@vue/test-utils';
import { TickerData } from './interfaces';
import ticker from './ticker.vue';
describe('tickerform', () => {
  test('ticker sanity test', () => {
    const data: TickerData[] = [{ name: 'BTC', price: 10 }];
    const wrapper = mount(ticker, { props: { data } });
    expect(wrapper.html().includes('BTC')).toBeTruthy();
  });
});
