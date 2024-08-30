const path = require("path")

module.exports = {
  devtool: false,
  mode: "production",
  // 单文件
  // entry: "./src/index.js", // 入口文件
  // output: {
  //   filename: "w.my-tools.js", // 输出文件名
  //   path: path.resolve(__dirname, "dist"),
  //   library: "Qchh", // 设置全局变量名
  //   libraryTarget: "umd", // 允许在 CommonJS、AMD 和全局环境中使用
  // },

  // 多文件
  entry: {
    cleanSvg: './src/cleanSvg.js',
    toast: './src/toast.js',
    html2md: './src/html2md.js',
    getByteLength:"./src/getByteLength.js",
    cleanHTML:"./src/cleanHTML.js",
    compressHTML:"./src/compressHTML.js"
  },
  output: {
    path: path.resolve(__dirname, "dist"),
    filename: "[name].min.js",
    libraryTarget: "umd",
    library: "[name]",
    globalObject: "this",
  },
  resolve: {
    fallback: {
      os: require.resolve("os-browserify/browser"),
      fs: false,
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
}
