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
    externals: [
        // k6 모듈 external 처리
        /^k6(\/.*)?$/,
        // https:// URL external 처리 (k6 런타임에서 직접 로드)
        /^https?:\/\/.*/,
    ],
    optimization: {
        minimize: false,
    },
    stats: {
        colors: true,
        warnings: true,
    },
};
