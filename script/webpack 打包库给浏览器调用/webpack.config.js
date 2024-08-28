const path = require("path");

module.exports = {
  devtool: false,
  mode: "production", // 或 'production'
  entry: "./src/index.js", // 入口文件
  output: {
    filename: "bundle.js", // 输出文件名
    path: path.resolve(__dirname, "dist"),
    library: "Qchh", // 设置全局变量名
    libraryTarget: "umd", // 允许在 CommonJS、AMD 和全局环境中使用
  },
  resolve: {
    fallback: {
      os: require.resolve("os-browserify/browser"),
      fs: false, // 如果不需要 'fs'，可以设置为 false
      path: require.resolve("path-browserify"),
      url: require.resolve("url/"),
    },
  },
  module: {
    rules: [
      {
        test: /\.css$/, // 匹配所有 .css 文件
        use: [
          "style-loader", // 将 CSS 插入到 DOM 中
          "css-loader", // 解析 CSS 文件
        ],
      },
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: {
          loader: "babel-loader",
          options: {
            presets: ["@babel/preset-env"],
          },
        },
      },
    ],
  },
};
