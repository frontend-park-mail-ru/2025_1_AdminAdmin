import path from 'path';
import HtmlWebpackPlugin from 'html-webpack-plugin';
import FileManagerPlugin from 'filemanager-webpack-plugin';
import MiniCssExtractPlugin from "mini-css-extract-plugin";

const __dirname = import.meta.dirname;

export default {
    devServer: {
        watchFiles: path.resolve(__dirname, 'public/src'),
        port: 3000,
    },
    entry: {
        main: path.resolve(__dirname, 'public/src', 'index.js'),
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
                    'style-loader',
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
                 test: /\.svg$/,
                 type: 'asset/resource',
                 generator: {
                   filename: path.join('icons', '[name].[contenthash][ext]'),
                 },
           },
            {
                test: /\.hbs$/,
                loader: "handlebars-loader"
            }
        ],
    },
    output: {
        path: path.resolve(__dirname, 'public/build'),
        filename: 'index.[contenthash:8].js',
    },
    plugins: [
        new HtmlWebpackPlugin({
            template: path.resolve(__dirname, 'public', 'index.html'),
            filename: 'index.html',
        }),
        new FileManagerPlugin({
            events: {
                onStart: {
                    delete: [path.resolve(__dirname, 'public/build')],
                },
            },
        }),
        new MiniCssExtractPlugin({
            filename: '[name].[contenthash].css',
        }),
    ],
    resolve: {
        extensions: ['.js', '.scss', '.css'],
    },
};
