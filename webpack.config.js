require('dotenv').config();
const path = require('path');
const webpack = require('webpack'); //e.g. for iusing DefinePlugin
// const UglifyJsPlugin = require('uglifyjs-webpack-plugin');
const TerserPlugin = require('terser-webpack-plugin');
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
// const { VueLoaderPlugin } = require('vue-loader');

/**
 * flag Used to check if the environment is production or not
 */
const isProduction = (process.env.NODE_ENV === 'production');
const devMode = (process.env.NODE_ENV !== 'production');

/**
 * Include hash to filenames for cache busting - only at production
 */
const fileNamePrefix = isProduction ? '[chunkhash].' : '';

module.exports = {
    // mode: process.env.NODE_ENV,
    context: __dirname,
    entry: './src/js/main.js',
    output: {
        path: path.resolve(__dirname, 'dist'),
        filename: '[name].js',
        //filename: fileNamePrefix + '[name].js',
        publicPath: '/dist/',
    },
    // resolve: {
    //     alias: {
    //         'vue$': 'vue/dist/vue.esm.js'
    //     },
    //     extensions: ['*', '.js', '.vue', '.json']
    // },
    module: {
        rules: [
            {
                test: /\.(svg|eot|ttf|woff|woff2)$/,
                loader: 'url-loader',
                options: {
                    limit: 10000,
                    name: 'webfonts/[name].[ext]'
                }
            },
            // {
            //     test: /\.(png|jpg|gif)$/,
            //     loaders: [
            //         {
            //             loader: 'url-loader',
            //             options: {
            //                 limit: 10000,
            //                 name: 'images/[name].[ext]'
            //             }
            //         },
            //         'img-loader'
            //     ],
            // },
            // {
            //     test: /\.vue$/,
            //     loader: 'vue-loader'
            //   },
            // {
            //     test: /\.tsx?$/,
            //     use: 'ts-loader',
            //     exclude: /(node_modules|bower_components)/,
            // },
            {
                // test: /\.js$/,
                test: /\.(js|jsx|tsx|ts)$/,
                exclude: /(node_modules|bower_components)/,
                use: {
                    loader: 'babel-loader',
                    // options: {
                    //     presets: ['@babel/preset-env']
                    // }
                }
            },

            {
                test: /\.(scss|css)$/,
                use: [
                    {
                        loader: (isProduction === true) ? MiniCssExtractPlugin.loader : 'style-loader',
                        // loader: 'style-loader',                      
                        // loader: MiniCssExtractPlugin.loader,
                        // options: {
                        //     hmr: process.env.NODE_ENV === 'development',
                        // },
                    },
                    // {
                    //     loader: "vue-style-loader",
                    //     options: {
                    //         sourceMap: true
                    //     }
                    // },
                     // Translates CSS into CommonJS
                    {
                        loader: "css-loader",
                        options: {
                            sourceMap: true
                        }
                    },
                    'resolve-url-loader',
                      // Compiles Sass to CSS
                    {
                        loader: "sass-loader",
                        options: {
                            sourceMap: true
                        }
                    }
                ]
            },

        ]
    },
    resolve: {
        extensions: ['*', '.js', '.jsx', '.tsx', '.ts'],
      },
    stats: {
        colors: true
    },
    // devtool: 'inline-source-map',

    optimization: {
        minimize: isProduction,
        minimizer: [
            new TerserPlugin({
                // cache: true,
                parallel: true,
                // sourceMap: true, // Must be set to true if using source-maps in production
                extractComments: true,
                terserOptions: {

                    compress: {
                        directives: false,
                        //     drop_console: true,
                        //     drop_debugger: true,
                        //     keep_classnames: false,
                        //     keep_fnames: false,
                    },
                    mangle: true, // Note `mangle.properties` is `false` by default.
                    keep_classnames: false,
                    keep_fnames: false,
                }
            })
        ],
    },

    plugins: [
        // new VueLoaderPlugin(),

        new webpack.DefinePlugin({ // Remove this plugin if you don't plan to define any global constants
            ENVIRONMENT: JSON.stringify(process.env.NODE_ENV),
            CONSTANT_VALUE: JSON.stringify(process.env.CONSTANT_VALUE),
            MATOMO_SITE_ID: JSON.stringify(process.env.MATOMO_SITE_ID),
            MATOMO_TRACKER_URL: JSON.stringify(process.env.MATOMO_TRACKER_URL),
            SERVICE_URL : JSON.stringify(process.env.SERVICE_URL),
            POINT_URL : JSON.stringify(process.env.POINT_URL),
            EDGE_URL : JSON.stringify(process.env.EDGE_URL),

            CUSTOM_VAR: JSON.stringify('value5 goes here'), // no quotes needed, string value
        }),
        // extractLess,

        new MiniCssExtractPlugin({ // Make sure MiniCssExtractPlugin instance is included in array before the PurifyCSSPlugin
            // Options similar to the same options in webpackOptions.output
            // both options are optional
            // filename: '[name].css',
            // chunkFilename: '[id].css',
            filename: '[name].css',
            chunkFilename: '[id].css',
        }),

        // new PurifyCSSPlugin({
        //     paths: glob.sync(__dirname + '/*.html'),
        //     minimize: true,
        // }),

        // new webpack.HotModuleReplacementPlugin(),
    ],

};

/**
 * Production only plugins
 */
if (isProduction === true) {
    module.exports.plugins.push(
        // module.exports.optimization.minimizer.push(
        //     new UglifyJsPlugin({ sourceMap: true })
        // );
        // function () { // Create a manifest.json file that contain the hashed file names of generated static resources
        //     this.plugin("done", function (status) {
        //         require("fs").writeFileSync(
        //             __dirname + "/dist/manifest.json",
        //             JSON.stringify(status.toJson().assetsByChunkName)
        //         );
        //     });
        // },

    );
    //development
} else {
    module.exports.plugins.push(
        //auto updating on dev server
        new webpack.HotModuleReplacementPlugin()// HMR plugin will cause problems with [chunkhash]
    );
}
