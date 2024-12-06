export function pascalCase(input: string): string {
  return input
    .replace(/^\w|[A-Z]|\b\w/g, (word) => {
      return word.toUpperCase()
    })
    .replace(/\W+/g, '')
}

export function pad(count: number, input = ''): string {
  return input.padStart(count)
}
