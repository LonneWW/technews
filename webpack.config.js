const path = require('path');
const Dotenv = require('dotenv-webpack');
const webpack = require('webpack');

module.exports = {
  mode: `development`,
  entry: './assets/js/script.js',
  output: {
    filename: 'main.js',
    path: path.resolve(__dirname, 'webpack'),
    publicPath: "/webpack"
  },
  module: {
    rules: [
      {
        test:/\.scss$/,
        use: [
          'style-loader',
          'css-loader',
          'sass-loader'
        ],
      }
    ]
  },
  plugins: [
    new Dotenv(),
    new webpack.DefinePlugin({
      'process.env.API_URL': JSON.stringify(process.env.API_URL),
      'process.env.API_ID_URL': JSON.stringify(process.env.API_ID_URL),
    }),
  ],
};