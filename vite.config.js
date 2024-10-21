import {resolve} from 'path';
import aliasImporter from 'node-sass-alias-importer';
import handlebars from 'vite-plugin-handlebars';

console.log(process.env);
const basePath =  process.env.GITHUB_PAGES_BASE_PATH ?? '/';

export default {
  base: basePath,
  root: resolve(__dirname, 'src'),
  build: {
    outDir: '../dist',
    target: 'es2015',
    emptyOutDir: true,
  },
  server: {
    port: 8080
  },
  css: {
    devSourcemap: true,
    preprocessorOptions: {
      scss: {
        importer: [
          aliasImporter({
            "~bootstrap": resolve(__dirname, 'node_modules/bootstrap'),
            //"~flag-icons": resolve(__dirname, 'node_modules/flag-icons'),
            "@fonts": resolve(__dirname, 'src/fonts'),
          })
        ]
      }
    }
  },
  resolve: {
    alias: {
      '@scss': resolve(__dirname, 'src/scss'),
      '@fonts': resolve(__dirname, 'src/fonts'),
    }
  },
  plugins: [
    handlebars({
      context: {
        title: 'C2R Logistics template',
      },
      partialDirectory: resolve(__dirname, 'src/html/fragment'),
      reloadOnPartialChange: true
    })
  ],
}