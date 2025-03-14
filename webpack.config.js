import path from 'path';
import HtmlWebpackPlugin from 'html-webpack-plugin';
import FileManagerPlugin from 'filemanager-webpack-plugin';

const __dirname = import.meta.dirname;

export default {
    devServer: {
        watchFiles: path.resolve(__dirname, 'public/src'),
        port: 3000,
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
                    delete: ['build'],
                },
            },
        }),
    ],
    resolve: {
        extensions: ['.js', '.scss', '.css'],
    },
};
