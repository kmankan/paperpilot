const path = require('path');
const CopyPlugin = require('copy-webpack-plugin');

module.exports = {
  mode: process.env.NODE_ENV || 'development',
  devtool: 'source-map',
  entry: {
    content: path.resolve(__dirname, 'src/content.ts'),
    background: path.resolve(__dirname, 'src/background.ts')
  },
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: [
          {
            loader: 'ts-loader',
            options: {
              configFile: 'tsconfig.extension.json',
              transpileOnly: true,
              compilerOptions: {
                module: 'commonjs'
              }
            }
          }
        ],
        exclude: /node_modules/
      },
      {
        test: /\.css$/,
        use: ['style-loader', 'css-loader']
      }
    ]
  },
  resolve: {
    extensions: ['.tsx', '.ts', '.js'],
    alias: {
      '@': path.resolve(__dirname, 'src/')
    },
    fallback: {
      fs: false,
      path: false,
      crypto: false
    }
  },
  output: {
    filename: '[name].js',
    path: path.resolve(__dirname, 'dist'),
    clean: true
  },
  plugins: [
    new CopyPlugin({
      patterns: [
        { 
          from: "public/icons",
          to: "icons",
          noErrorOnMissing: true
        },
        { from: "manifest.json", to: "manifest.json" },
        { 
          from: "src/styles/styles.css", 
          to: "styles.css",
          noErrorOnMissing: true
        },
        {
          from: path.join('node_modules', 'pdfjs-dist', 'build', 'pdf.worker.min.js'),
          to: 'pdf.worker.min.js',
          noErrorOnMissing: true
        }
      ],
    }),
  ]
}; 