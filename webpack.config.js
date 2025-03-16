import path from 'path';
import HtmlWebpackPlugin from 'html-webpack-plugin';
import MiniCssExtractPlugin from "mini-css-extract-plugin";
import webpack from 'webpack';
import ImageMinimizerPlugin from 'image-minimizer-webpack-plugin';

const __dirname = import.meta.dirname;

export default {
    devServer: {
        watchFiles: path.resolve(__dirname, 'public/src'),
        static: path.resolve(__dirname, 'public'),
        port: 3000,
        compress: true,
        hot: true,
        historyApiFallback: true,
    },
    entry: {
        main: path.resolve(__dirname, 'public', 'index.js'),
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
                    MiniCssExtractPlugin.loader,
                    'css-loader',
                    {
                        loader: 'postcss-loader',
                        options: {
                            postcssOptions: {
                                plugins: [
                                    ['postcss-preset-env', {
                                        browsers: 'last 2 versions',
                                    }],
                                ],
                            },
                        },
                    },
                    'sass-loader',
                ],
            },
            {
                test: /\.(png|jpg|jpeg|gif)$/i,
                type: 'asset/resource',
           },
           {
                 test: /\.ico$/,
                 type: 'asset/resource',
                 generator: {
                   filename: path.join('icons', '[name].[contenthash][ext]'),
                 },
           },
            {
                test: /\.hbs$/,
                loader: "handlebars-loader",
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
        new MiniCssExtractPlugin({
            filename: '[name].[contenthash].css',  // Убедитесь, что имя файлов настроено
        }),
        new webpack.HotModuleReplacementPlugin(),
    ],
    optimization: {
        minimizer: [
            new ImageMinimizerPlugin({
                minimizer: {
                    implementation: ImageMinimizerPlugin.sharpMinify,
                    options: {
                        encodeOptions: {
                            jpeg: {
                                // https://sharp.pixelplumbing.com/api-output#jpeg
                                quality: 100,
                            },
                            webp: {
                                // https://sharp.pixelplumbing.com/api-output#webp
                                lossless: true,
                            },
                            avif: {
                                // https://sharp.pixelplumbing.com/api-output#avif
                                lossless: true,
                            },

                            // png by default sets the quality to 100%, which is same as lossless
                            // https://sharp.pixelplumbing.com/api-output#png
                            png: {},

                            // gif does not support lossless compression at all
                            // https://sharp.pixelplumbing.com/api-output#gif
                            gif: {},
                        },
                    },
                },
            }),
        ],
    },
    resolve: {
        extensions: ['.tsx', '.ts', '.js', '.scss', '.css'],
    },
};
