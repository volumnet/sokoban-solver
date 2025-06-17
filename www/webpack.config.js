const TerserJSPlugin = require('terser-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const CssMinimizerPlugin = require("css-minimizer-webpack-plugin");
const RemoveEmptyScriptsPlugin = require("webpack-remove-empty-scripts");
const webpack = require('webpack');
const glob = require('glob');
const path = require('path');
const fs = require('fs');
const ESLintPlugin = require('eslint-webpack-plugin');
const ForkTsCheckerWebpackPlugin = require('fork-ts-checker-webpack-plugin');

const isProduction = process.argv[process.argv.indexOf('--mode') + 1] === 'production';

const entryMap = glob.sync('dev/src/*.tsx')
    .reduce(function(obj, el) {
        obj[path.parse(el).name] = './' + el;
        return obj
    }, {});

module.exports = {
    mode: 'production',
    entry: entryMap,
    resolve: {
        modules: ['node_modules'],
        alias: {
            app: path.resolve(__dirname, 'dev/src/'),
            cms: path.resolve(__dirname, 'd:/web/home/libs/raas.cms/resources/js.vue3'),
            'fa-mixin': path.resolve(__dirname, 'd:/web/home/libs/raas.cms/resources/js.vue3/_shared/mixins/fa6.scss'),
            "./dependencyLibs/inputmask.dependencyLib": "./dependencyLibs/inputmask.dependencyLib.jquery"
        },
        extensions: [
            '.scss',
            '.js',
            '.jsx',
            '.ts',
            '.tsx',
        ]
    },
    output: {
        filename: '[name].js',
        path: __dirname+'/js',
        chunkFormat: false,
    },
    optimization: {
        minimize: true,
        minimizer: [
            new TerserJSPlugin({ 
                extractComments: false,
                terserOptions: { format: { comments: false, }}
            }), 
            new CssMinimizerPlugin({
                minimizerOptions: {
                    preset: [
                        "default",
                        {
                            discardComments: { removeAll: true },
                        },
                    ],
                },
            }),
        ],
        splitChunks: false,
    },
    externals: {
        knockout: 'knockout',
        jquery: 'jQuery',
        $: 'jquery',
        'window.jQuery': 'jquery',
    },
    devtool: (isProduction ? false : 'inline-source-map'),
    module: {
        rules: [
            {
                test: /\.[jt]sx?$/,
                // use: 'babel-loader',
                use: 'ts-loader',
                exclude: /node_modules/
            },
            {
                test: /\.scss$/,
                use: [
                    { loader: MiniCssExtractPlugin.loader },
                    { loader: "css-loader", options: {url: false}, },
                    {
                        loader: 'postcss-loader', // Run postcss actions
                        options: {
                            postcssOptions: {
                                plugins: [
                                    ['postcss-utilities', { centerMethod: 'flexbox' }], 
                                    'autoprefixer',
                                    'rucksack-css',
                                    'postcss-short',
                                    'postcss-combine-duplicated-selectors',
                                    'postcss-pseudo-elements-content',
                                ],
                            },
                        },
                    },
                    {
                        loader: "sass-loader",
                        options: {
                            additionalData: "@use 'app/_shared/init.scss' as *;\n",
                            // additionalData: fs.readFileSync(__dirname + '/dev/src/_shared/init.scss').toString() + "\n",
                        },
                    },
                ]
            },
            {
                test: /\.css$/,
                use: [
                    { loader: MiniCssExtractPlugin.loader },
                    { loader: "css-loader", options: {url: false}, },
                ]
            },
            {
                test: /files(\\|\/).*/,
                loader: 'file-loader',
                options: { 
                    emitFile: false,
                    name: '/[path][name].[ext]', 
                }
            },
            {
                test: /jquery-ui.*\.(png|svg|jpg|jpeg|gif)$/,
                loader: 'file-loader',
                options: { 
                    outputPath: '../files/cms/common/image/design/jquery-ui', 
                    name: '[name].[ext]', 
                }
            },
            {
                test: /(\.(woff|woff2|eot|ttf|otf))|(font.*\.svg)$/,
                loader: 'file-loader',
                options: { 
                    outputPath: '../fonts', 
                    name: '[name].[ext]',
                }
            },
            {
                test: /\.json$/,
                loader: 'json-loader'
            },
        ],
    },
    plugins: [
        new webpack.ProvidePlugin({
            knockout: 'knockout',
        }),
        new RemoveEmptyScriptsPlugin(),
        new MiniCssExtractPlugin({ filename: '../css/[name].css' }),
        new ForkTsCheckerWebpackPlugin({
            typescript: {
              configFile: path.resolve(__dirname, 'tsconfig.json'),
            },
          }),
        new ESLintPlugin({
          extensions: ['js', 'jsx', 'ts', 'tsx'], // файлы для проверки
          exclude: 'node_modules',
          failOnError: false, // или true — чтобы сборка падала при ошибках
          context: path.resolve(__dirname, 'dev/src'), // папка с исходниками
          eslintPath: require.resolve('eslint/use-at-your-own-risk'), // <-- Вот это важно!
        }),
    ]
}