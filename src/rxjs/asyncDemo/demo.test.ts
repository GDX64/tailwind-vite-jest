import { flushPromises, mount } from '@vue/test-utils';
import Demo from './demo.vue';

describe('test ui', () => {
  test('typing', async () => {
    vi.useFakeTimers();
    mockRequester.getPlanets = (ok) => setTimeout(() => ok(['moon']));
    mockRequester.getMoonInfo = (ok) => setTimeout(() => ok({ distance: 100 }));
    const wrapper = mount(Demo);
    await wrapper.get('input').setValue('earth');
    await wait(1000);
    const results = wrapper.findAll('[data-test="moon"]');
    expect(results).toHaveLength(1);
    expect(results[0].text()).toMatch(/moon: 100/);
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

async function wait(time: number) {
  vi.advanceTimersByTime(time);
  return flushPromises();
}
