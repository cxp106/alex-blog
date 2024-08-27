const fs = require("fs");
const path = require("path");
const { optimize } = require("svgo");
const sharp = require("sharp"); // 引入 sharp 库

const config = require("./svgo.config");

const inputDir = path.join(__dirname, "input");
const outputDir = path.join(__dirname, "output");

if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir);
}

const clearDirectory = (dir) => {
  try {
    if (fs.existsSync(dir)) {
      fs.readdirSync(dir).forEach((file) => {
        const filePath = path.join(dir, file);
        if (fs.statSync(filePath).isDirectory()) {
          clearDirectory(filePath);
        } else {
          fs.unlinkSync(filePath);
        }
      });
      fs.rmdirSync(dir);
      console.log(`Cleared: ${dir}`);
    }
  } catch (error) {
    console.error(`Error clearing directory ${dir}:`, error);
  }
};

const processSvgFile = (filePath, outputFilePath) => {
  fs.readFile(filePath, "utf8", (err, data) => {
    if (err) throw err;
    const result = optimize(data, { path: filePath, ...config });
    fs.writeFile(outputFilePath, result.data, (err) => {
      if (err) throw err;
      console.log(`Optimized: ${filePath}`);
    });
  });
};

const processImageFile = (filePath, outputFilePath) => {
  const filename = path.basename(outputFilePath, path.extname(outputFilePath));
  const outputDir = path.dirname(outputFilePath);

  // 转换为 AVIF
  sharp(filePath)
    .avif({ quality: 96 })
    .toFile(path.join(outputDir, `${filename}.avif`))
    .then(() => console.log(`AVIF created: ${filename}.avif`))
    .catch((err) => console.error(`Error creating AVIF: ${err}`));

  // 转换为 WebP
  sharp(filePath)
    .webp({ quality: 96 })
    .toFile(path.join(outputDir, `${filename}.webp`))
    .then(() => console.log(`WebP created: ${filename}.webp`))
    .catch((err) => console.error(`Error creating WebP: ${err}`));
};

const processDirectory = (dir) => {
  fs.readdir(dir, (err, files) => {
    if (err) throw err;

    files.forEach((file) => {
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
          if (ext === ".svg") {
            processSvgFile(filePath, outputFilePath);
          } else if (ext === ".jpg" || ext === ".jpeg" || ext === ".png") {
            // 这里将图片转换成多种格式，不进行原格式的压缩
            /**
             * css 使用
             * background-image: image-set(
             *   url("/path/to/hero-image.avif") type("image/avif"),
             *   url("/path/to/hero-image.webp") type("image/webp"),
             *   url("/path/to/hero-image.png") type("image/png"),
             *   url("/path/to/hero-image.jpg") type("image/jpeg")
             * );
             */
            /**
             * html 使用
             * <picture>
             *   <source srcSet="/path/to/hero-image.avif" type="image/avif" />
             *   <source srcSet="/path/to/hero-image.webp" type="image/webp" />
             *   <img src="/path/to/hero-image.jpg" alt="Hero" />
             * </picture>
             */
            processImageFile(filePath, outputFilePath);
          }
        }
      });
    });
  });
};

const watchInputDirectory = (dir) => {
  fs.watch(dir, { recursive: true }, (eventType, filename) => {
    if (filename) {
      console.log(`Detected change: ${filename}`);
      clearDirectory(outputDir);
      processDirectory(inputDir);
    }
  });
};

clearDirectory(outputDir);
processDirectory(inputDir);
watchInputDirectory(inputDir);
