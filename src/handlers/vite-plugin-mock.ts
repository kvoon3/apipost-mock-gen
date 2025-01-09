import type { ApiContext } from '../types'
import { name } from '../../package.json'
import { pascalCase } from '../utils'

interface Handler {
  name: string
  handle: (ctxs: ApiContext[]) => string[]
}

/* eslint-disable no-template-curly-in-string */
export const vitePluginMockHandler: Handler = {
  name: 'vite-plugin-mock',
  handle(ctxs: ApiContext[]): string[] {
    return [
      '/* eslint-disable */',
      '/* prettier-ignore */',
      '// @ts-nocheck',
      '// noinspection JSUnusedGlobalSymbols',
      `// Generated by ${name}`,
      '// biome-ignore lint: disable',
      '',
      'export default [',
      ...ctxs.flatMap(({ url, method, response, request }) => {
        return [
          '  {',
          `    url: '${url}',`,
          `    method: \'${method}\',`,
          '    response: (res: any) => {',
          '      const { body = {} } = res',
          `      return Object.assign(${response}, check(body, ${request}))`,
          `    }`,
          '  },',
        ]
      }),
      '] as const',
      ...ctxs.flatMap(({ url, requestType, responseType }) => {
        return [
          '',
          `export interface ${pascalCase(`${url.split('/').at(-1)}Payload`)} ${requestType}`,
          '',
          `export interface ${pascalCase(`${url.split('/').at(-1)}Model`)} ${responseType}`,
        ]
      }),
      '',
      'export function check(obj1: object, obj2: object) {',
      '  const keys = Object.keys(obj1);',
      '  const keys2 = Object.keys(obj2);',
      '  ',
      '  if(keys.length !== keys2.length)',
      '    return { errcode: 1, errmsg: `Length mismatch: ${keys.length} !== ${keys2.length}` }',
      '  ',
      '  for (const key of keys) {',
      '    if (!(key in obj2)) ',
      '      return { errcode: 1, errmsg: `Missing key: ${key}` }',
      '    ',
      '    const val1 = obj1[key as keyof typeof obj1]',
      '    const val2 = obj2[key as keyof typeof obj2]',
      '    ',
      '    if (typeof val1 !== typeof val2) {',
      '      if(typeof val1 === \'string\' && val1 === \'\' && val2 !== \'\')',
      '        return { errcode: 1, errmsg: `${key} is empty string` }',
      '      return { errcode: 1, errmsg: `Type mismatch for key: ${key}` }',
      '    }',
      '  }',
      '  ',
      '  return { errcode: 0, errmsg: \'\' }',
      '}',
    ]
  },
}
