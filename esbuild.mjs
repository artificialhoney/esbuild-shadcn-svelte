// node
import path from 'path';
import { fileURLToPath } from 'url';
// import { createRequire } from 'module';

// esbuild
import esbuild from 'esbuild';
import { createServer } from 'esbuild-server'; // dev server
import sveltePlugin from 'esbuild-svelte'; // esbuild plugin svelte
import aliasPath from 'esbuild-plugin-alias-path';
import { sveltePreprocess } from 'svelte-preprocess';
import postCssPlugin from '@deanc/esbuild-plugin-postcss';

const __filename = fileURLToPath(import.meta.url); // get the resolved path to the file
const __dirname = path.dirname(__filename); // get the name of the directory
// const require = createRequire(import.meta.url)

// postcss
import postcssImport from 'postcss-import';
import tailwindcss from 'tailwindcss';
import autoprefixer from 'autoprefixer';
import postcssPresetEnv from 'postcss-preset-env';

function showUsage() {
  console.log('USAGE');
  console.log('node esbuild.js dev');
  console.log('node esbuild.js prod');
  process.exit(0);
}

if (process.argv.length < 3) {
  showUsage();
}

if (!['dev', 'prod'].includes(process.argv[2])) {
  showUsage();
}

// production mode, or not
const production = process.argv[2] === 'prod';

// esbuild build options
// see: https://esbuild.github.io/api/#build-api
const options = {
  entryPoints: ['./src/main.js'],
  bundle: true,
  // format: 'iife',
  minify: production,
  sourcemap: !production,
  mainFields: ['svelte', 'browser', 'module', 'main', 'style'],
  conditions: ['svelte', 'browser', 'style'],
  outfile: './public/build/bundle.js', // and bundle.css
  plugins: [
    postCssPlugin({
      plugins: [
        postcssPresetEnv(),
        postcssImport(),
        tailwindcss(),
        autoprefixer()
      ]
    }),
    sveltePlugin({
      preprocess: sveltePreprocess({
        typescript: false,
        postcss: {
          plugins: [
            postcssPresetEnv(),
            postcssImport(),
            tailwindcss(),
            autoprefixer()
          ]
        }
      })
    }),
    aliasPath({
      alias: {
        '$lib/**/*': path.resolve(__dirname, './src/lib'),
        '@/**/*': path.resolve(__dirname, './src')
      }
    })
  ]
};

// start web dev server
if (!production) {
  const params = {
    port: 8080, // Set the server port. Defaults to 8080.
    bundle: true,
    static: './public', // Set root directory that's being served. Defaults to cwd.
    entryPoints: ['src/main.js'],
    historyApiFallback: true
  };
  const server = createServer(options, params);
  await server.start();
  console.log(`Dev server running on port ${server.url}`);
} else {
  // esbuild prod
  await esbuild.build(options).catch((err) => {
    console.error(err);
    process.exit(1);
  });
  console.log(`Built output to ${options.outfile}`);
}
