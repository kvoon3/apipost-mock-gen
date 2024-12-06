import type { ApiContext } from './types'
import { objectEntries } from '@antfu/utils'
import { parse } from 'jsonc-parser'
import remarkParse from 'remark-parse'
import remarkStringify from 'remark-stringify'
import { parseURL } from 'ufo'
import { unified } from 'unified'
import { visit } from 'unist-util-visit'

export const apipostMarkdownParser = {
  name: 'apipost-markdown',
  parse: async (content: string): Promise<ApiContext[]> => {
    const ctxs: ApiContext[] = []
    const whitelist: string[] = []
    await unified()
      .use(remarkParse)
      .use(() => (tree) => {
        let url: any // string
        let request: string
        let response: string
        let requestType: string
        let responseType: string

        visit(tree, (node) => {
          const { value } = (node || { value: '' }) as any

          if (node.type === 'text'
            && value.startsWith('http')
          ) {
            const { pathname } = parseURL(value)
            url = pathname
          }

          if (node.type === 'code') {
            const type = !value.includes('errcode') && value.includes('{')
              ? 'request'
              : value.includes('"errcode": 0')
                ? 'response'
                : 'unknown'

            if (type === 'request') {
              request = value
              requestType = typeInfer(parse(value))
            }
            else if (type === 'response') {
              response = value
              responseType = typeInfer(parse(value))

              if (url && request && response) {
                if (!whitelist.includes(url))
                  ctxs.push({ url, request, response, requestType, responseType })
                else
                  console.log(`[Skipped] url: ${url}`)

                url = ''
                request = '{}'
                response = ''
              }
            }
          }
        })
      })
      .use(remarkStringify)
      .process(content)

    return ctxs
  },
}

function typeInfer(val: any, indent = 0): string {
  const type = typeof val
  if (type === 'object') {
    if (Array.isArray(val)) {
      return `Array<${Array.from(new Set(val.map(i => typeInfer(i, indent)))).join(' | ')}>`
    }
    else {
      return [
        `{`,
        ...objectEntries(val)
          .map(([key, value]): string => {
            return `${String(key)}: ${typeInfer(value)};`
          }),
        `}`,
      ].join(' ')
    }
  }
  else {
    return type
  }
}
