import { processLinks } from './processText';

describe('process links', () => {
  it('should have a link', () => {
    const result = processLinks('hello [blabla](google.com) angel [hi](hi.com) end');
    expect(result).toBe(
      'hello <a href="google.com">blabla</a> angel <a href="hi.com">hi</a> end'
    );
  });
  it('has no link', () => {
    const result = processLinks('hello there');
    expect(result).toBe('hello there');
  });
});
