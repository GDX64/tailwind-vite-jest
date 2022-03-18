import { processLinks } from './processText';

describe('process links', () => {
  it('should have a link', () => {
    const result = processLinks('hello there [blabla](google.com) the angel');
    console.log(result);
  });
});
