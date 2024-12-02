import type { GenerateOptions } from './types'
import fs from 'node:fs'
import { vitePluginMockHandler } from './handlers/vite-plugin-mock'
import { apipostMarkdownParser } from './parser'

export async function generate(options?: GenerateOptions): Promise<void> {
  const {
    input = 'mock/input.md',
    output = 'mock/output.ts',
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

  const content = fs.readFileSync(input, 'utf-8')

  console.info('Traversing markdown nodes...')
  const ctxs = await theParser?.parse(content) || []

  /**
   * Generating mock file
   */

  console.info(`Writing file...`)
  fs.writeFileSync(output, theHandler?.handle(ctxs).join('\n') || '')

  console.info(`Mock file created at: ${output}`)
}
