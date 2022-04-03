import { mount } from '@vue/test-utils';
import processText, { processLinks } from './LinkProcess';

describe('process links', () => {
  it('should split in two', () => {
    const result = processLinks('hello [blabla](google.com) angel [hi](hi.com) end');
    console.log(result);
  });
  it('should render the links', () => {
    const wrapper = mount(processText, {
      props: { text: 'hello [blabla](google.com) angel [hi](hi.com) end' },
    });
    expect(wrapper.html()).toBe(
      '<span><span>hello </span><a href="google.com">blabla</a><span> angel </span><a href="hi.com">hi</a><span> end</span></span>'
    );
  });
});
