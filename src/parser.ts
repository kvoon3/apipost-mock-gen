import type { ApiContext } from './types'
import { isNull, objectEntries } from '@antfu/utils'
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
        let url: any = '' // string
        let method: string = ''
        let request: string = '{}'
        let response: string = '{}'
        let requestType: string = '{}'
        let responseType: string = '{}'

        const reset = (): void => {
          url = ''
          method = ''
          request = '{}'
          response = '{}'
          requestType = '{}'
          responseType = '{}'
        }

        visit(tree, (node) => {
          const { value } = (node || { value: '' }) as any

          if (node.type === 'text') {
            if (value.startsWith('http')) {
              const { pathname } = parseURL(value)
              url = pathname
            }

            if ([
              'GET',
              'POST',
              'PUT',
              'DELETE',
              'PATCH',
              'HEAD',
              'OPTIONS',
              'TRACE',
            ].includes(value)) {
              method = value
            }
          }

          if (node.type === 'code') {
            const type = !value.includes('errcode') && value.includes('{')
              ? 'request'
              : value.includes('"errcode": 0')
                ? 'response'
                : 'unknown'

            if (type === 'request') {
              const requestObject = parse(value)
              request = JSON.stringify(requestObject)
              requestType = typeInfer(requestObject)
            }
            else if (type === 'response') {
              const responseObject = parse(value)
              response = JSON.stringify(responseObject)
              responseType = typeInfer(responseObject)

              if (url && request && response) {
                if (!whitelist.includes(url))
                  ctxs.push({ url, method, request, response, requestType, responseType })
                else
                  console.log(`[Skipped] url: ${url}`)

                reset()
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
    if (isNull(val))
      return 'null'

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
