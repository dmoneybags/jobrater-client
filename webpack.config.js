const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const webpack = require('webpack'); // Import webpack

module.exports = (env) => {

  return {
    target: 'node',
    entry: {
      popup: './public/index.jsx',
      content: './src/content/contentScript.ts',
      background: './src/background/background.ts'
    },
    output: {
      path: path.resolve(__dirname, 'dist'),
      filename: '[name].bundle.js'
    },
    module: {
      rules: [
        {
          test: /\.(jsx?|tsx?)$/,
          exclude: /node_modules/,
          use: 'babel-loader'
        },
        {
          test: /\.css$/,
          use: ['style-loader', 'css-loader']
        },
        {
          test: /\.tsx?$/,
          use: 'ts-loader',
          include: [
            path.resolve(__dirname, 'node_modules/@applicantiq')
          ]
        },
        {
          test: /\.(png|jpe?g|gif|svg)$/i,
          use: [
            {
              loader: 'file-loader',
              options: {
                name: '[path][name].[ext]'
              }
            }
          ]
        }
      ]
    },
    resolve: {
      extensions: ['.js', '.jsx', '.ts', '.tsx'],
      modules: ['node_modules']
    },
    plugins: [
      new HtmlWebpackPlugin({
        template: './src/index.html',
        filename: 'popup.html',
        chunks: ['popup']
      }),
      new webpack.DefinePlugin({
        'CLIENT_ENV.ENVIRONMENT': JSON.stringify('development'),
        'CLIENT_ENV.PROD_API_URL': JSON.stringify('https://api.applicantiq.org/'),
        'CLIENT_ENV.DEV_API_URL': JSON.stringify('http://localhost:5001/'),
        'CLIENT_ENV.CONTEXT': JSON.stringify('extension')
      }),
    ],
  };
};
