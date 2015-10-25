var webpack = require('webpack');
var path = require('path');
var vendor = [
    'angular',
    'angular-animate',
    'angular-aria',
    'angular-clipboard',
    'angular-material',
    'angular-messages',
    'angular-mocks',
    'moment',
    'ngstorage'
];
var plugins = [
    new webpack.optimize.DedupePlugin(),
    new webpack.optimize.OccurenceOrderPlugin(),
    new webpack.optimize.CommonsChunkPlugin('vendor', 'vendor.bundle.js', Infinity)
];

if (process.env.NODE_ENV === 'production') {
    plugins.splice(2, 0, new webpack.optimize.UglifyJsPlugin({
        mangle: false,
        sourceMap: false,
        compress: {
            warnings: false
        }
    }));
}

module.exports = {
    context: path.join(__dirname, '/app'),
    entry: {
        vendor: vendor,
        app: process.env.NODE_ENV === 'production' ? ['angular', './app.js'] : ['webpack/hot/dev-server', 'angular', './app.js']
    },
    devtool: process.env.NODE_ENV === 'production' ? '' : 'source-map',
    output: {
        path: process.env.NODE_ENV === 'production' ? './dist' : './app',
        filename: 'bundle.js'
    },
    plugins: plugins,
    module: {
        loaders: [
            {test: /angular.js$/, loader: 'imports?jquery'}, // inserts into angular require jquery
            {test: /angular-[^\.]+.js$/, loader: 'imports?angular'}, // inserts in app files require angular
            {test: /jquery.js$/, loader: 'expose?$!expose?jQuery'}, // makes global variables $, jQuery
            {test: /\.js$/, loader: 'babel!imports?angular', include: /app/}, // inserts in app files require angular
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
        ]
    }
};
