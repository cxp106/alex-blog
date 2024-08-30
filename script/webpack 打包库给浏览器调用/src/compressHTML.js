const cleanHTML = require("./cleanHTML")

const compressHTML = (html) => {
  return cleanHTML(html).replace(/>\s+</g, "><").replace(/\s+/g, " ")
}

module.exports = compressHTML
