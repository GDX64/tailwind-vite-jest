import { mount } from '@vue/test-utils';
import Demo from './demo.vue';

describe('test ui', () => {
  test('typing', async () => {
    vi.useFakeTimers();
    const fn = vi.fn().mockReturnValue(['moon']);
    mockRequester.getPlanets = (ok) => setTimeout(() => ok(fn()));
    const wrapper = mount(Demo);
    await wrapper.get('input').setValue('ear');
    await wrapper.get('input').setValue('earth');

    await wait(1000);
    const radios = wrapper.findAll('[type="radio"]');
    expect(radios).toHaveLength(1);
    expect(fn).toBeCalledTimes(1);
  });
  test('error handling', async () => {
    vi.useFakeTimers();
    mockRequester.getPlanets = (ok, err) => {
      setTimeout(() => err(Error('Conection Error')));
      mockRequester.getPlanets = (ok) => ok(['moon']); //a próxima vai dar certo
    };
    const wrapper = mount(Demo);
    await wrapper.get('input').setValue('earth');
    await wait(1000);
    const radios = wrapper.findAll('[type="radio"]');
    expect(radios).toHaveLength(1);
  });
  test('handling delay', async () => {
    vi.useFakeTimers();
    mockRequester.getPlanets = (ok, err) => {
      setTimeout(() => ok(['moon']), 1000);
    };
    const wrapper = mount(Demo);
    await wrapper.get('input').setValue('earth');
    vi.advanceTimersByTime(800);

    await wrapper.get('input').setValue('ear');
    await wait(1000);
    expect(wrapper.findAll('[type="radio"]')).toHaveLength(0);
  });
});

vi.mock('./asyncDemoAPI', () => {
  return {
    getPlanets: (_: any, ok: any, err: any) => mockRequester.getPlanets(ok, err),
  };
});

const mockRequester = {
  getPlanets: (ok: any, err: any) => {},
};

async function wait(time: number) {
  vi.advanceTimersByTime(time);
  vi.useRealTimers();
  await new Promise((resolve) => setTimeout(resolve));
  vi.useFakeTimers();
}
