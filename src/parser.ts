import type { ApiContext } from './types'
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
        let req: string
        let res: string

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
              req = value
            }
            else if (type === 'response') {
              res = value

              if (url && req && res) {
                if (!whitelist.includes(url))
                  ctxs.push({ url, req, res })
                else
                  console.log(`[Skipped] url: ${url}`)

                url = ''
                req = '{}'
                res = ''
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
