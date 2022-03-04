import resolve from 'rollup-plugin-node-resolve'
import babel from '@rollup/plugin-babel'
import commonjs from '@rollup/plugin-commonjs'
import typescript from 'rollup-plugin-typescript2'
import multi from 'rollup-plugin-multi-input'

export default [
  {
    input: 'src/index.ts',
    output: {
      name: 'JsonModel',
      file: 'dist/umd/jsonmodel.umd.js',
      format: 'umd',
      sourcemap: true
    },
    plugins: [
      resolve(),
      commonjs(),
      typescript({
        tsconfigOverride: {
          compilerOptions: { declaration: false, declarationMap: false }
        }
      }),
      babel({
        babelHelpers: 'bundled'
      })
    ]
  },
  {
    input: 'src/**/*.[tj]s',
    output: {
      dir: 'dist/cjs',
      format: 'cjs',
      exports: 'auto',
      sourcemap: true
    },
    plugins: [
      multi(),
      resolve(),
      commonjs(),
      typescript(),
      babel({
        babelHelpers: 'bundled'
      })
    ]
  },
  {
    input: 'src/**/*.[tj]s',
    output: {
      dir: 'dist/esm',
      format: 'es',
      sourcemap: true
    },
    plugins: [
      multi(),
      resolve(),
      commonjs(),
      typescript(),
      babel({
        babelHelpers: 'bundled'
      })
    ],
    external: [/lodash/]
  }
]
