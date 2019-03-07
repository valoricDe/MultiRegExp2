import resolve from 'rollup-plugin-node-resolve';
import commonjs from 'rollup-plugin-commonjs';
import pkg from './package.json';

export default [
    {
        input: 'src/multiRegExp2.js',
        output: {
            name: 'multiRegExp2',
            file: pkg.browser,
            format: 'iife', // immediately-invoked function expression — suitable for <script> tags
            sourcemap: true
        },
        plugins: [
            resolve(), // tells Rollup how to find date-fns in node_modules
            commonjs(), // converts date-fns to ES modules
        ]
    },

    // CommonJS (for Node) and ES module (for bundlers) build.
    // (We could have three entries in the configuration array
    // instead of two, but it's quicker to generate multiple
    // builds from a single configuration where possible, using
    // an array for the `output` option, where we can specify
    // `file` and `format` for each target)
    {
        input: 'src/multiRegExp2.js',
        external: [],
        output: [
            { file: pkg.main, format: 'cjs' },
            { file: pkg.module, format: 'es' }
        ]
    }
];