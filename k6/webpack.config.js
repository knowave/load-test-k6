const path = require('path');

module.exports = {
    mode: 'production',
    entry: './src/load-test.ts',
    output: {
        path: path.resolve(__dirname, 'dist'),
        filename: 'load-test.js',
        libraryTarget: 'commonjs',
    },
    module: {
        rules: [
            {
                test: /\.ts$/,
                use: 'ts-loader',
                exclude: /node_modules/,
            },
        ],
    },
    resolve: {
        extensions: ['.ts', '.js'],
    },
    target: 'web',
    externals: /^k6(\/.*)?$/,
    optimization: {
        minimize: false,
    },
    stats: {
        colors: true,
        warnings: true,
    },
};
