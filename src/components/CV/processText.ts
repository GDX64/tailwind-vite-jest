export function processLinks(text: string) {
  return [...text.matchAll(/\[(.*?)\]\((.*?)\)/g)].reduce((acc, match) => {
    const [textToReplace, label, link] = match;
    if (textToReplace && label && link) {
      return acc.replace(textToReplace, `<a href="${link}">${label}</a>`);
    }
    return acc;
  }, text);
}
