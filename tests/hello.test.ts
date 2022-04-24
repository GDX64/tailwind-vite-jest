import { mount } from '@vue/test-utils';
import BtnTest from '../src/components/BtnTest.vue';

describe('hello', () => {
  test('nothing on list', async () => {
    const wrapper = mount(BtnTest, { props: { list: [] } });
    const list = wrapper.findAll('[test-data="todo"]');
    expect(list.length).toBe(0);
  });
  test('one element on the list', async () => {
    const childText = 'hello';
    const wrapper = mount(BtnTest, { props: { list: [childText] } });
    const list = wrapper.findAll('[test-data="todo"]');
    expect(list[0]?.text()).toBe(childText);
  });
  test('two elements on the list', async () => {
    const wrapper = mount(BtnTest, { props: { list: ['hello', 'there'] } });
    const list = wrapper.findAll('[test-data="todo"]');
    expect(list).toHaveLength(2);
  });
  test('insert element on the list, and the input field should be cleared. Should not insert when the input is empty', async () => {
    const inputContent = 'the angel';
    const wrapper = mount(BtnTest, { props: { list: ['hello', 'there'] } });
    const input = wrapper.get({ ref: 'input' });
    await input.setValue(inputContent);
    const addBtn = wrapper.get({ ref: 'add-btn' });
    await addBtn.trigger('click');
    const list = wrapper.findAll('[test-data="todo"]');
    expect(list[list.length - 1]?.text()).toBe(inputContent);
    expect(input.text()).toBe('');
    await addBtn.trigger('click');
    expect(wrapper.findAll('[test-data="todo"]')).toHaveLength(3);
  });
  test('should remove a todo element', async () => {
    const wrapper = mount(BtnTest, { props: { list: ['hello', 'there', 'the'] } });
    const list = wrapper.findAll('[test-data="remove-btn"]');
    await list[1].trigger('click');
    const listAfterRemove = wrapper.findAll('[test-data="todo"]');
    expect(listAfterRemove).toHaveLength(2);
  });
});
