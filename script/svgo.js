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

// 清空输出目录
const clearDirectory = (dir) => {
  try {
    if (fs.existsSync(dir)) {
      // 读取目录中的所有文件和子目录
      fs.readdirSync(dir).forEach((file) => {
        const filePath = path.join(dir, file);

        // 递归删除子目录
        if (fs.statSync(filePath).isDirectory()) {
          clearDirectory(filePath);
        } else {
          // 删除文件
          fs.unlinkSync(filePath);
        }
      });

      // 删除空目录
      fs.rmdirSync(dir);
      console.log(`Cleared: ${dir}`);
    }
  } catch (error) {
    console.error(`Error clearing directory ${dir}:`, error);
  }
};

const getByteLength=(str)=>{
  // const encoder = new TextDecoder()
  // const encoded = encoder.encode(str)
  // return encoded.length
  return Buffer.byteLength(str,'utf8')
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
              const oLen = getByteLength(data)
              const cLen = getByteLength(result.data)
              console.log(`${((1-(cLen/oLen)*100).toFixed(2))}% Optimized: ${relativePath}`);
            });
          });
        }
      });
    });
  });
};

// 监控 input 目录的变化
const watchInputDirectory = (dir) => {
  fs.watch(dir, { recursive: true }, (eventType, filename) => {
    if (filename && path.extname(filename) === '.svg') {
      console.log(`Detected change: ${filename}`);
      clearDirectory(outputDir);
      processDirectory(inputDir);
    }
  });
};

// 清空输出目录后开始处理输入目录并监控变化
clearDirectory(outputDir);
processDirectory(inputDir);
watchInputDirectory(inputDir);
