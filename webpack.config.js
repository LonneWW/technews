const path = require('path');

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
  }
};