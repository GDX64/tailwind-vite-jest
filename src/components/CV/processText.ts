export function processLinks(text: string) {
  return [...text.matchAll(/\[([^\(\)]*)\]\(([^\(\)]*)\)/g)];
}
