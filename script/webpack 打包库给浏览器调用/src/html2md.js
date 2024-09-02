const htmlToMd = require("html-to-md")

const html2md = (html, options = { ignoreTags: ["clipboard-copy"] }) => {
  return htmlToMd(html, options)
}

module.exports = html2md
