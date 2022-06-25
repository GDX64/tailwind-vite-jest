import { mount } from '@vue/test-utils';
import tickerFormDemo from './tickeFormDemo.vue';
describe('tickerform', () => {
  test('hahah2', () => {
    mount(tickerFormDemo, { props: { data: [] } });
  });
});
