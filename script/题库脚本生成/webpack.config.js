const path = require("path");
const TerserPlugin = require("terser-webpack-plugin");

module.exports = {
  entry: "./src/index.js",
  output: {
    filename: "bundle.js",
    path: path.resolve(__dirname, "dist"),
  },
  mode: "production",
  target: "web",
  parallelism: 5,
  // optimization: {
  //   minimize: true,
  //   minimizer: [
  //     new TerserPlugin({
  //       terserOptions: {
  //         compress: {
  //           drop_console: true, // 移除 console
  //         },
  //         mangle: true, // 开启混淆
  //         output: {
  //           comments: false, // 移除注释
  //         },
  //       },
  //       extractComments: false, // 确保不会生成单独的注释文件
  //     }),
  //   ],
  // },
};
