export interface ApiContext {
  url: string
  req: string
  res: string
}

export interface GenerateOptions {
  input: string
  output: string
  template: 'vite-plugin-mock'
  parser: 'apipost-markdown'
}
