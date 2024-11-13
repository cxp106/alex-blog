const fs = require('fs');
const path = require('path');

// 获取当前脚本所在的目录
const currentDir = __dirname;

// 定义地址前缀
const urlPrefix = 'https://cxp.netlify.app/script/lxmusic/';

// 读取目录中的文件
fs.readdir(currentDir, (err, files) => {
  if (err) {
    console.error('无法读取目录：', err);
    return;
  }

  // 过滤掉当前脚本文件自身
  const markdownLinks = files
    .filter(file => file !== path.basename(__filename))
    .map(file => `- [${file}](${urlPrefix}${encodeURIComponent(file)})`)
    .join('\n');

  // 输出 Markdown 字符串
  console.log(markdownLinks);
});
