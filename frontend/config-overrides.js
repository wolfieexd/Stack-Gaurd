// config-overrides.js
const webpack = require('webpack');

module.exports = function override(config) {
  console.log('Overriding webpack config for Stacks wallet support');
  
  // Add polyfill fallbacks
  config.resolve.fallback = {
    ...config.resolve.fallback,
    buffer: require.resolve('buffer/'),
    process: require.resolve('process/browser'),
    crypto: require.resolve('crypto-browserify'),
    stream: require.resolve('stream-browserify'),
    assert: require.resolve('assert/'),
    http: require.resolve('stream-http'),
    https: require.resolve('https-browserify'),
    os: require.resolve('os-browserify/browser'),
    url: require.resolve('url/'),
    path: require.resolve('path-browserify'),
    fs: false,
    util: require.resolve('util/'),
    zlib: require.resolve('browserify-zlib')
  };

  // Add webpack plugins to provide Buffer and process globally
  config.plugins = [
    ...config.plugins,
    new webpack.ProvidePlugin({
      Buffer: ['buffer', 'Buffer'],
      process: 'process/browser',
    }),
    // Add process and Buffer polyfills to window
    new webpack.DefinePlugin({
      'process.env.NODE_DEBUG': JSON.stringify(process.env.NODE_DEBUG),
    }),
  ];
  
  return config;
};
