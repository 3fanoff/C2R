import {resolve} from 'path';
import aliasImporter from 'node-sass-alias-importer';
import handlebars from 'vite-plugin-handlebars';
import countries from 'countries-phone-masks';

//console.log(process.env);
const basePath = process.env.GITHUB_PAGES_BASE_PATH ?? '/';

export default {
    base: basePath,
    root: resolve(__dirname, 'src'),
    build: {
        outDir: '../dist',
        target: 'es2015',
        emptyOutDir: true,
        rollupOptions: {
            input: {
                index: resolve(__dirname, 'src/index.html'),
                about: resolve(__dirname, 'src/about.html'),
                cases: resolve(__dirname, 'src/cases.html'),
                posrednik: resolve(__dirname, 'src/posrednik.html'),
                delivery: resolve(__dirname, 'src/delivery.html'),
                calculator: resolve(__dirname, 'src/calculator.html'),
                blog: resolve(__dirname, 'src/blog.html'),
                main: resolve(__dirname, 'src/main.html'),
            },
        },
    },
    server: {
        port: 8080,
        hmr: false,
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
                        "@images": resolve(__dirname, 'src/images'),
                    })
                ]
            }
        }
    },
    resolve: {
        alias: {
            '@scss': resolve(__dirname, 'src/scss'),
            '@fonts': resolve(__dirname, 'src/fonts'),
            '@images': resolve(__dirname, 'src/images')
        }
    },
    plugins: [
        handlebars({
            context: {
                title: 'C2R Logistics template',
                iter2: [1, 2],
                phones: countries.sort((a, b) => {
                    return (a.iso === 'RU' || a.iso === 'BY' || a.iso === 'KZ') ? -1 : 1;
                }),
            },
            partialDirectory: [
                resolve(__dirname, 'src/html/fragment'),
                resolve(__dirname, 'src/html/layout')
            ],
            helpers: {
                setVar: (varName, varValue, options) => {
                    options.data.root[varName] = varValue;
                },
                eq: (value1, value2) => {
                    return (value1 === value2);
                },
                eqw: (value1, value2) => {
                    return (value1 == value2);
                }
            },
            reloadOnPartialChange: true
        })
    ],
}