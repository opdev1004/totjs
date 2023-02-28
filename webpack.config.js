const path = require('path');

module.exports = {
  mode: 'production',
  entry: './src/index.js',
  target: 'node',
  output: {
    filename: 'index.js',
    path: path.resolve(__dirname, "dist"),
    library: {
      name: 'Tot',
      type: 'umd',
    },
  },
  optimization: {
    minimize: false
  },
};