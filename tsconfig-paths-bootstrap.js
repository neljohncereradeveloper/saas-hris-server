'use strict';

// eslint-disable-next-line @typescript-eslint/no-var-requires
const tsConfigPaths = require('tsconfig-paths');
// eslint-disable-next-line @typescript-eslint/no-var-requires
const tsConfig = require('./tsconfig.json');

/**
 * Register TypeScript path aliases for runtime resolution
 * This allows the use of path aliases like @shared and @features in runtime
 */
tsConfigPaths.register({
  baseUrl: './',
  paths: tsConfig.compilerOptions.paths,
});
