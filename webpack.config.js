const path = require('path');
const webpack = require('webpack');
const dotenv = require('dotenv');

module.exports = () => {
  const env = dotenv.config().parsed;
  const envKeys = Object.keys(env).reduce((prev, next) => {
    prev[`process.env.${next}`] = JSON.stringify(env[next]);
    return prev;
  }, {});

  return {
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
      new webpack.DefinePlugin(envKeys),
    ],
  };
};