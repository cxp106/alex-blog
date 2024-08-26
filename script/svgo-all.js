const fs = require('fs');
const path = require('path');
const { optimize } = require('svgo');
// 读取配置文件
const config = require('./svgo.config');

// 输入和输出目录
const inputDir = path.join(__dirname, 'input');
const outputDir = path.join(__dirname, 'output');

// 确保输出目录存在
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir);
}

// 重试删除文件的函数
const tryUnlinkSync = (filePath, retries = 5) => {
  for (let i = 0; i < retries; i++) {
    try {
      fs.unlinkSync(filePath);
      return;
    } catch (err) {
      if (err.code === 'EBUSY' || err.code === 'EPERM') {
        console.log(`Retrying unlink for ${filePath}...`);
        Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, 100);
      } else {
        throw err;
      }
    }
  }
  throw new Error(`Failed to unlink ${filePath} after multiple retries`);
};

// 清空输出目录
const clearDirectory = (dir) => {
  if (fs.existsSync(dir)) {
    fs.readdirSync(dir).forEach(file => {
      const filePath = path.join(dir, file);
      if (fs.statSync(filePath).isDirectory()) {
        clearDirectory(filePath);
      } else {
        tryUnlinkSync(filePath);
      }
    });
    console.log(`Cleared: ${dir}`);
  }
};

// 处理 SVG 文件
const processSvgFile = (filePath, outputFilePath) => {
  fs.readFile(filePath, 'utf8', (err, data) => {
    if (err) throw err;

    const result = optimize(data, { path: filePath, ...config });

    fs.writeFile(outputFilePath, result.data, err => {
      if (err) throw err;
      console.log(`Optimized: ${filePath}`);
    });
  });
};

// 动态导入 imagemin 及其插件
const loadImagemin = async () => {
  const imagemin = (await import('imagemin')).default;
  const imageminMozjpeg = (await import('imagemin-mozjpeg')).default;
  const imageminPngquant = (await import('imagemin-pngquant')).default;

  return { imagemin, imageminMozjpeg, imageminPngquant };
};

// 处理 JPEG 文件
const processJpegFile = async (filePath, outputFilePath) => {
  const { imagemin, imageminMozjpeg } = await loadImagemin();

  const compressedBuffer = await imagemin.buffer(fs.readFileSync(filePath), {
    plugins: [
      imageminMozjpeg({ quality: 80 })
    ]
  });

  if (compressedBuffer.length < fs.statSync(filePath).size) {
    fs.writeFileSync(outputFilePath, compressedBuffer);
    console.log(`Compressed JPEG: ${filePath}`);
  } else {
    fs.copyFileSync(filePath, outputFilePath); // 如果压缩后更大，使用原文件
    console.log(`Original JPEG retained: ${filePath}`);
  }
};

// 处理PNG文件
const processPngFile = async (filePath, outputFilePath) => {
  const { imagemin, imageminPngquant } = await loadImagemin();

  const compressedBuffer = await imagemin.buffer(fs.readFileSync(filePath), {
    plugins: [
      imageminPngquant({ quality: [0.6, 0.8] })
    ]
  });

  if (compressedBuffer.length < fs.statSync(filePath).size) {
    fs.writeFileSync(outputFilePath, compressedBuffer);
    console.log(`Compressed PNG: ${filePath}`);
  } else {
    fs.copyFileSync(filePath, outputFilePath); // 如果压缩后更大，使用原文件
    console.log(`Original PNG retained: ${filePath}`);
  }
};

// 递归遍历目录并处理文件
const processDirectory = (dir) => {
  fs.readdir(dir, (err, files) => {
    if (err) throw err;

    files.forEach(file => {
      const filePath = path.join(dir, file);

      fs.stat(filePath, (err, stats) => {
        if (err) throw err;

        if (stats.isDirectory()) {
          processDirectory(filePath);
        } else {
          const relativePath = path.relative(inputDir, filePath);
          const outputFilePath = path.join(outputDir, relativePath);
          const outputDirPath = path.dirname(outputFilePath);

          if (!fs.existsSync(outputDirPath)) {
            fs.mkdirSync(outputDirPath, { recursive: true });
          }

          const ext = path.extname(file).toLowerCase();
          if (ext === '.svg') {
            processSvgFile(filePath, outputFilePath);
          } else if (ext === '.jpg' || ext === '.jpeg') {
            processJpegFile(filePath, outputFilePath);
          } else if (ext === '.png') {
            processPngFile(filePath, outputFilePath);
          }
        }
      });
    });
  });
};

// 监控 input 目录的变化
const watchInputDirectory = (dir) => {
  fs.watch(dir, { recursive: true }, (eventType, filename) => {
    if (filename) {
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
