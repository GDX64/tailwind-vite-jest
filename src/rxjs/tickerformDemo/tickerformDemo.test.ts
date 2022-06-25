import { mount } from '@vue/test-utils';
import { TickerData } from './interfaces';
import ticker from './ticker.vue';
describe('tickerform', () => {
  test('ticker sanity test', () => {
    const data: TickerData[] = [{ name: 'BTC', price: 10 }];
    const wrapper = mount(ticker, { props: { data } });
    const inputCoin = wrapper.find('[test-data="coin-input"]');
    const inputTicker = wrapper.find('[test-data="ticker-input"]');
    inputTicker.setValue('ETH');
    inputTicker.setValue('BTC');
    inputCoin.setValue('USD');
    const emisions = wrapper.emitted();
    expect(emisions['change-ticker']).toMatchObject([['ETH'], ['BTC']]);
    expect(emisions['change-coin']).toMatchObject([['USD']]);
    expect(wrapper.html().includes('BTC')).toBeTruthy();
  });
});
