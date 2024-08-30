const htmlToMd = require("html-to-md");

const html2md = (html) => {
  return htmlToMd(html);
};

module.exports = html2md;
