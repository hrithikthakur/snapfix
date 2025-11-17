import svelte from 'rollup-plugin-svelte';
import css from 'rollup-plugin-css-only';
import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';

const production = !process.env.ROLLUP_WATCH;

export default {
  input: 'onboarding/src/main.js',
  output: {
    sourcemap: !production,
    format: 'iife',
    name: 'OnboardingAppBundle',
    file: 'onboarding/dist/onboarding.js',
  },
  plugins: [
    svelte({
      compilerOptions: {
        dev: !production,
      },
    }),
    css({ output: 'onboarding.css' }),
    resolve({
      browser: true,
      dedupe: ['svelte'],
    }),
    commonjs(),
  ],
  watch: {
    clearScreen: false,
  },
};

