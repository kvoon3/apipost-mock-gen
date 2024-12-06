import fs from 'node:fs/promises'
import cac from 'cac'
import { generate } from '.'
import { name, version } from '../package.json'

const cli = cac(name)
  .version(version)

cli.command('[input]', 'Generate Mock Api from Apipost exported file')
  .option('--output <output>', 'Output directory path', { default: 'mock/output.ts' })
  .option('--template <template>', 'The template need to use', { default: 'vite-plugin-mock' })
  .option('--parser <parser>', 'The parser to parse input file', { default: 'apipost-markdown' })
  .action(async (input = 'mock/input.md', options) => {
    const content = await fs.readFile(input, { encoding: 'utf-8' })

    const result = await generate({
      content,
      template: options.template,
      parser: options.parser,
    })

    if (options.output) {
      await fs.writeFile(options.output, result)
      console.info(`Mock file created at: ${options.output}`)
    }
  })

cli.help()
cli.parse()
