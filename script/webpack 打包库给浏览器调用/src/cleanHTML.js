// const cleanHTML = (html) => {
//   const createDOMpurify = require("dompurify")
//   let DOMpurify = null
//   if (typeof window !== "undefined") {
//     DOMpurify = createDOMpurify()
//   } else {
//     const { JSDOM } = require("jsdom")
//     const window = new JSDOM("").window
//     DOMpurify = createDOMpurify(window)
//   }
//   return DOMpurify.sanitize(html, {
//     ALLOWED_ATTR: [],
//     KEEP_CONTENT: true,
//   })
// }

const createDOMpurify = require("dompurify")

const cleanHTML = (html) => {
  const DOMpurify = createDOMpurify()
  return DOMpurify.sanitize(html, {
    ALLOWED_ATTR: [],
    KEEP_CONTENT: true,
  })
}

module.exports = cleanHTML
