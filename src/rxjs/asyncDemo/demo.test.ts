import { flushPromises, mount } from '@vue/test-utils';
import Demo from './demo.vue';

describe('test ui', () => {
  test('typing', async () => {
    vi.useFakeTimers();
    mockRequester.getPlanets = (ok) => setTimeout(() => ok(['moon']));
    mockRequester.getMoonInfo = (ok) => {
      setTimeout(() => {
        ok({ distance: 100 });
      });
    };
    const wrapper = mount(Demo);
    await wrapper.get('input').setValue('earth');
    await wait(500);
    await wait(500);
    const results = wrapper.findAll('[data-test="moon"]');
    expect(results).toHaveLength(1);
    expect(results[0].text()).toMatch(/moon: 100/);
  });

  test('error handling', async () => {
    vi.useFakeTimers();
    mockRequester.getPlanets = (ok) => setTimeout(() => ok(['moon']));
    mockRequester.getMoonInfo = (ok, err) => setTimeout(() => err(Error('deu pau')));
    const wrapper = mount(Demo);
    await wrapper.get('input').setValue('earth');
    await wait(500);
    await wait(500);
    const results = wrapper.findAll('[data-test="moon"]');
    expect(results).toHaveLength(0);
    expect(wrapper.html()).toMatch(/deu pau/);
  });
});

vi.mock('./asyncDemoAPI', () => {
  const mockApi: typeof import('./asyncDemoAPI') = {
    getPlanets: (_: any, ok: any, err: any) => mockRequester.getPlanets(ok, err),
    getMoonInfo: (_: any, ok: any, err: any) => mockRequester.getMoonInfo(ok, err),
  };
  return mockApi;
});

const mockRequester = {
  getPlanets: (ok: any, err: any) => {},
  getMoonInfo: (ok: any, err: any) => {},
};

function wait(time?: number) {
  if (!time) {
    vi.runAllTimers();
  } else {
    vi.advanceTimersByTime(time);
  }
  return flushPromises();
}
