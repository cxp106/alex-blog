const fs = require('fs');
const path = require('path');
const { optimize } = require('svgo');

// 读取配置文件
const config = require('./svgo.config');

// SVG 文件的输入和输出目录
const inputDir = path.join(__dirname, 'input');
const outputDir = path.join(__dirname, 'output');

// 确保输出目录存在
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir);
}

// 递归遍历目录
const processDirectory = (dir) => {
  fs.readdir(dir, (err, files) => {
    if (err) throw err;

    files.forEach(file => {
      const filePath = path.join(dir, file);

      fs.stat(filePath, (err, stats) => {
        if (err) throw err;

        if (stats.isDirectory()) {
          // 递归处理子目录
          processDirectory(filePath);
        } else if (path.extname(file) === '.svg') {
          // 处理 SVG 文件
          fs.readFile(filePath, 'utf8', (err, data) => {
            if (err) throw err;

            // 优化 SVG 文件
            const result = optimize(data, { path: filePath, ...config });

            // 生成输出路径
            const relativePath = path.relative(inputDir, filePath);
            const outputFilePath = path.join(outputDir, relativePath);

            // 确保输出目录存在
            const outputDirPath = path.dirname(outputFilePath);
            if (!fs.existsSync(outputDirPath)) {
              fs.mkdirSync(outputDirPath, { recursive: true });
            }

            // 将优化后的 SVG 文件写入输出目录
            fs.writeFile(outputFilePath, result.data, err => {
              if (err) throw err;
              console.log(`Optimized: ${relativePath}`);
            });
          });
        }
      });
    });
  });
};

// 开始处理输入目录
processDirectory(inputDir);
