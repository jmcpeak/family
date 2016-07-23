'use strict';

let webpack = require('webpack'),
    path = require('path'),
    htmlBundle = require('html-webpack-plugin'),
    isProd = process.env.NODE_ENV === 'production',
    vendor = [
        'angular',
        'angular-animate',
        'angular-aria',
        'angular-clipboard',
        'angular-material',
        'angular-messages',
        'angular-mocks',
        'angular-route',
        'angular-ui-router',
        'aws-sdk',
        'moment',
        'ngstorage'
    ],
    plugins = [
        new webpack.optimize.DedupePlugin(),
        new webpack.optimize.OccurenceOrderPlugin(),
        new webpack.optimize.CommonsChunkPlugin('common', 'common.[hash].js'),
        new htmlBundle({template: 'indexTemplate.html'}),
    ];

if (isProd) {
    plugins.splice(2, 0, new webpack.optimize.UglifyJsPlugin({
        mangle: false,
        sourceMap: false,
        compress: {
            warnings: false
        }
    }));
}

module.exports = {
    resolve: {
        alias: {
            //'sq-angular': '@BondA/sq-angular'
        }
    },
    context: path.resolve(__dirname, 'app'),
    externals: ['axios', 'aws-sdk'],
    entry: {
        vendor: vendor,
        bundle: isProd ? ['babel-polyfill', './app.js'] : ['babel-polyfill', 'webpack-dev-server/client?http://localhost:9000', 'webpack/hot/dev-server', './app.js']
    },
    devtool: isProd ? '' : 'source-map',
    output: {
        path: isProd ? './dist' : './app',
        filename: '[name].[hash].js'
    },
    plugins: plugins,
    module: {
        loaders: [
            {test: /\.js$/, loader: 'babel!imports?angular', include: /app|test/}, // inserts in app files require angular
            {test: /\.woff$/, loader: 'url-loader?limit=10000&mimetype=application/font-woff'},
            {test: /\.woff2$/, loader: 'url-loader?limit=10000&mimetype=application/font-woff'},
            {test: /\.ttf$/, loader: 'url-loader?limit=10000&mimetype=application/octet-stream'},
            {test: /\.eot$/, loader: 'file-loader'},
            {test: /\.svg$/, loader: 'url-loader?limit=10000&mimetype=image/svg+xml'},
            {test: /\.tpl\.html$/, loader: 'raw'},
            {test: /\.png$/, loader: 'url-loader?limit=100000&mimetype=image/png'},
            {test: /\.jpg$/, loader: 'file-loader'},
            {test: /\.css$/, loader: 'style!css'},
            {test: /\.less$/, loader: 'style!css!less'}
        ],
        noParse: /node_modules\/aws-sdk\/dist\/aws-sdk.js/
    }
};
