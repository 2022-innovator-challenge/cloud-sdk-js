/* Copyright (c) 2020 SAP SE or an SAP affiliate company. All rights reserved. */

import { resolve } from 'path';
import { createLogger } from '@sap-cloud-sdk/util';
import { Command, flags } from '@oclif/command';
import cli from 'cli-ux';
import { generate } from '../generator';

const logger = createLogger('openapi-generator');

class GenerateOpenApiClient extends Command {
  static description =
    'Generate OpenAPI clients, that use the connectivity features of the SAP Cloud SDK for JavaScript.';

  static usage = '--inputDir <inputDirectory> --outputDir <outputDirectory>';

  // eslint-disable-next-line @typescript-eslint/no-var-requires
  static version = require('../../package.json').version;

  static flags = {
    input: flags.string({
      name: 'input',
      char: 'i',
      description:
        'Input directory or file for the OpenAPI service definitions.',
      parse: input => resolve(input),
      required: true
    }),
    outputDir: flags.string({
      name: 'outputDir',
      char: 'o',
      description: 'Output directory for the generated OpenAPI client.',
      parse: input => resolve(input),
      required: true
    }),
    clearOutputDir: flags.boolean({
      name: 'clearOutputDir',
      description:
        'Remove all files in the output directory before generation.',
      default: false,
      required: false
    }),
    versionInPackageJson: flags.string({
      name: 'versionInPackageJson',
      description:
        'By default, when generating package.json file, the generator will set a version by using the generator version. It can also be set to a specific version.',
      required: false
    }),
    generatePackageJson: flags.boolean({
      name: 'generatePackageJson',
      description:
        'By default, the generator will generate a package.json file, specifying dependencies and scripts for compiling and generating documentation. When set to false, the generator will skip the generation of the package.json.',
      default: true,
      required: false
    }),
    generateJs: flags.boolean({
      name: 'generateJs',
      description:
        'By default, the generator will also generate transpiled .js, .js.map, .d.ts and .d.ts.map files. When set to false, the generator will only generate .ts files.',
      default: true,
      required: false
    }),
    serviceMapping: flags.string({
      name: 'serviceMapping',
      description:
        'Configuration file to ensure consistent names between multiple generation runs with updated / changed metadata files. By default it will be read from the input directory as "service-mapping.json".',
      parse: input => resolve(input),
      required: false
    }),
    tsConfig: flags.string({
      name: 'tsConfig',
      description:
        'tsconfig.json file to overwrite the default "tsconfig.json".',
      parse: input => resolve(input),
      required: false
    }),
    additionalFiles: flags.string({
      name: 'additionalFiles',
      description:
        'Glob describing additional files to be added to the each generated service directory.',
      parse: input => resolve(input),
      required: false,
      hidden: true
    }),
    writeReadme: flags.boolean({
      name: 'writeReadme',
      description:
        'When set to true, the generator will write a README.md file into the root folder of every package.',
      default: false,
      required: false,
      hidden: true
    })
  };

  async run(): Promise<void> {
    try {
      const parsed = this.parse(GenerateOpenApiClient);
      await generate(parsed.flags);
    } catch (e) {
      logger.error(e.message);
      return cli.exit(1);
    }
  }
}

export = GenerateOpenApiClient;