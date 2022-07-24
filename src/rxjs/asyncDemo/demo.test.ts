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

  test('switch', async () => {
    vi.useFakeTimers();
    const shouldNotBeCalled = vi.fn();
    mockRequester.getPlanets = (ok) => setTimeout(() => ok(['moon']), 300);
    mockRequester.getMoonInfo = () => setTimeout(() => shouldNotBeCalled(), 300);
    const wrapper = mount(Demo);
    await wrapper.get('input').setValue('ear');
    await wait(50);
    await wrapper.get('input').setValue('earth');
    await wait(250);
    mockRequester.getPlanets = (ok) => setTimeout(() => ok(['fobos']));
    mockRequester.getMoonInfo = (ok) => setTimeout(() => ok({ distance: 120 }));
    await wrapper.get('input').setValue('mars');
    await wait(250);
    await wait(100);
    console.log(wrapper.html());
    expect(wrapper.html()).toMatch(/fobos: 120/);
    expect(shouldNotBeCalled).toHaveBeenCalledTimes(0);
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
