import { mount } from '@vue/test-utils';
import { nextTick } from 'vue';
import FakeDemo from './fakeDemo.vue';

describe('fake', () => {
  test('timer problem', async () => {
    vi.useFakeTimers();
    const wrapper = mount(FakeDemo);
    console.log(wrapper.html());
    vi.advanceTimersByTime(10_000);
    console.log(wrapper.html());
    await nextTick();
    await nextTick();
    console.log(wrapper.html());
  });
});
