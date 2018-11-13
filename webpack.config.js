const path = require("path")

console.log(path.join(__dirname, "src", "client"))

module.exports = {
  entry: "./src/client/index.ts",
  output: {
    filename: "bundle.js",
    path: path.resolve(__dirname, "dist")
  },
  resolve: {
    extensions: [".ts", ".js"],
    alias: {
      perepost: path.join(__dirname, "src", "client")
    }
  },
  module: {
    rules: [
      {
        test: /\.ts?$/,
        exclude: /node_modules/,
        use: "ts-loader"
      },
      {
        test: /\.less$/,
        use: [
          {
            loader: "style-loader" // creates style nodes from JS strings
          },
          {
            loader: "css-loader", // translates CSS into CommonJS
            options: {
              modules: true,
              localIdentName: "[local]---[hash:base64:5]"
            }
          },
          {
            loader: "less-loader", // compiles Less to CSS
            options: {
              modules: true
            }
          }
        ]
      },
      {
        test: /\.js$/,
        exclude: /(node_modules)/,
        use: {
          loader: "babel-loader",
          options: {
            presets: ["@babel/preset-env"]
          }
        }
      }
    ]
  },
  devServer: {
    contentBase: path.join(__dirname, "dist"),
    compress: true,
    port: 9009
  },
  mode: "development"
}
