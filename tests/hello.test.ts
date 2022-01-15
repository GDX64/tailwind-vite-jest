/**
 * @jest-environment jsdom
 */
import { mount } from '@vue/test-utils';
import BtnTest from '../src/components/BtnTest.vue';

describe('hello', () => {
  test('btn does not show', async () => {
    const wrapper = mount(BtnTest, { props: { showBTN: false } });
    expect(wrapper.find('button').isVisible()).toBe(false);
  });
  test('btn shows up', async () => {
    const wrapper = mount(BtnTest, { props: { showBTN: true } });
    expect(wrapper.find('button').isVisible()).toBe(true);
  });
  test('window test', async () => {
    const el = window.document.createElement('div');
    el.classList.add('testeo');
    document.body.appendChild(el);
    expect(document.querySelector('.testeo')).toBeTruthy();
  });
});
