export function pascalCase(input: string): string {
  return input
    .replace(/^\w|[A-Z]|\b\w/g, (word) => {
      return word.toUpperCase()
    })
    .replace(/\W+/g, '')
}
