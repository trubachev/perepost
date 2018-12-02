const path = require("path")
const CopyWebpackPlugin = require("copy-webpack-plugin")

const clientConfig = {
  entry: "./src/client/index.ts",
  output: {
    path: path.resolve(__dirname, "dist"),
    filename: "bundle.js"
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
  plugins: [
    new CopyWebpackPlugin([
      {
        from: path.join(__dirname, "src", "client", "index.html"),
        to: "static"
      },
      {
        from: path.join(__dirname, "src", "client", "main.css"),
        to: "static"
      }
    ])
  ],
  target: "web",
  mode: "development",
  watch: true
}

const serverConfig = {
  entry: "./src/server/index.ts",
  output: {
    path: path.resolve(__dirname, "dist"),
    filename: "server.js"
  },
  resolve: {
    extensions: [".ts", ".js"],
    alias: {
      perepost: path.join(__dirname, "src", "server")
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
  target: "node",
  mode: "development",
  watch: true
}

module.exports = [clientConfig, serverConfig]
