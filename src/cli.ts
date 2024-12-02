import cac from 'cac'
import { generate } from '.'
import { name, version } from '../package.json'

const cli = cac(name)
  .version(version)

cli.command('[input]', 'Generate Mock Api from Apipost exported file')
  .option('--output <output>', 'Output directory path', { default: 'mock/output.ts' })
  .option('--template <template>', 'The template need to use', { default: 'vite-plugin-mock' })
  .option('--parser <parser>', 'The parser to parse input file', { default: 'apipost-markdown' })
  .action((input = 'mock/input.md', options) => {
    generate({
      input,
      output: options.output,
      template: options.template,
      parser: options.parser,
    })
  })

cli.help()
cli.parse()
