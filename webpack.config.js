const path = require('path');
const Dotenv = require('dotenv-webpack');

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
    new Dotenv()
  ],
};