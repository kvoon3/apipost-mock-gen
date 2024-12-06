import type { GenerateOptions } from './types'
import { vitePluginMockHandler } from './handlers/vite-plugin-mock'
import { apipostMarkdownParser } from './parser'

export async function generate(options?: GenerateOptions): Promise<string> {
  const {
    content = '',
    parser = 'apipost-markdown',
    template = 'vite-plugin-mock',
  } = options || {}

  const parsers = [
    apipostMarkdownParser,
  ]

  const handlers = [
    vitePluginMockHandler,
  ]

  const theParser = parsers.find(p => p.name === parser)
  const theHandler = handlers.find(handler => handler.name === template)

  console.info('Traversing markdown nodes...')
  const ctxs = await theParser?.parse(content) || []

  return theHandler?.handle(ctxs).join('\n') || ''
}
