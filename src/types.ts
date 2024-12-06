export interface ApiContext {
  url: string
  method: string
  request: string
  response: string
  requestType: string
  responseType: string
}

export interface GenerateOptions {
  content: string
  template: 'vite-plugin-mock'
  parser: 'apipost-markdown'
}
