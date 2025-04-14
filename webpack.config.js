import { fileURLToPath } from 'url';
import path from 'path';
import HtmlWebpackPlugin from 'html-webpack-plugin';
import MiniCssExtractPlugin from 'mini-css-extract-plugin';
import webpack from 'webpack';
import ImageMinimizerPlugin from 'image-minimizer-webpack-plugin';
import * as dotenv from "dotenv";
import CopyWebpackPlugin from 'copy-webpack-plugin';


const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const isProduction = process.env.NODE_ENV === "production";

const stylesHandler = isProduction ? MiniCssExtractPlugin.loader : "style-loader";

dotenv.config();

const config = {
    target: 'web',
    devServer: {
        watchFiles: path.resolve(__dirname, 'public/src'),
        static: path.resolve(__dirname, 'public'),
        port: 3000,
        compress: true,
        hot: true,
        historyApiFallback: true,
    },
    entry: {
        main: path.resolve(__dirname, 'public', 'index.ts'),
    },
    module: {
        rules: [
            {
                test: /\.js$/,
                use: 'babel-loader',
                exclude: /node_modules/,
            },
            {
                test: /\.(scss|css)$/,
                use: [
                    stylesHandler,
                    'css-loader',
                    {
                        loader: 'postcss-loader',
                        options: {
                            postcssOptions: {
                                plugins: [
                                    [
                                        'postcss-preset-env',
                                        {
                                            browsers: [
                                                "last 4 versions",
                                                "not dead"
                                            ]
                                        },
                                    ],
                                ],
                            },
                        },
                    },
                    'sass-loader',
                ],
            },
            {
                test: /\.(png|jpg|jpeg|svg|gif)$/i,
                type: 'asset/resource',
                generator: {
                    filename: 'src/assets/[name][ext][query]'
                }
            },
            {
                test: /\.ico$/,
                type: 'asset/resource',
                generator: {
                    filename: 'src/assets/[name][ext][query]'
                }
            },
            {
                test: /\.hbs$/,
                loader: 'handlebars-loader',
            },
            {
                test: /\.tsx?$/,
                use: 'ts-loader',
                exclude: /node_modules/,
            },
        ],
    },
    output: {
        filename: 'bundle.js',
        path: path.resolve(__dirname, 'dist'),
    },
    plugins: [
        new HtmlWebpackPlugin({
            template: path.resolve(__dirname, 'public', 'index.html'),
            filename: 'index.html',
        }),
        new webpack.HotModuleReplacementPlugin(),
        new webpack.DefinePlugin({
            "process.env.GEOSUGGEST_API_KEY": JSON.stringify(process.env.GEOSUGGEST_API_KEY),
            "process.env.GEOCODER_API_KEY": JSON.stringify(process.env.GEOCODER_API_KEY),
        }),
        new CopyWebpackPlugin({
            patterns: [
                { from: path.resolve(__dirname, 'public/src/assets'), to: path.resolve(__dirname, 'dist/src/assets') },
                { from: path.resolve(__dirname, 'public/sw.js'), to: path.resolve(__dirname, 'dist/sw.js') },
            ]
        }),

    ],
    experiments: {
        topLevelAwait: true,
    },
    optimization: {
        minimizer: [
            new ImageMinimizerPlugin({
                minimizer: {
                    implementation: ImageMinimizerPlugin.sharpMinify,
                    options: {
                        encodeOptions: {
                            jpeg: {
                                quality: 100,
                            },
                            webp: {
                                lossless: true,
                            },
                            avif: {
                                lossless: true,
                            },
                            png: {},
                            gif: {},
                        },
                    },
                },
            }),
        ],
    },
    resolve: {
        alias: {
            '@': path.resolve(__dirname, 'public/src'),
            '@components': path.resolve(__dirname, 'public/src/components'),
            '@modules': path.resolve(__dirname, 'public/src/modules'),
            '@pages': path.resolve(__dirname, 'public/src/pages'),
            '@assets': path.resolve(__dirname, 'public/src/assets'),
            '@store': path.resolve(__dirname, 'public/src/store'),
            '@myTypes': path.resolve(__dirname, 'public/src/myTypes'),
        },
        extensions: ['.tsx', '.ts', '.js', '.scss', '.css'],
    },
};

if (isProduction) {
    config.mode = "production";
    config.plugins.push(new MiniCssExtractPlugin());
} else {
    config.mode = "development";
}

export default config;