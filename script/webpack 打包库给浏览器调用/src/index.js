const config = require("./svgo.config")
const { optimize } = require("svgo")
const simpleToast = require("react-simple-toasts").default
const { toastConfig } = require("react-simple-toasts")
require("react-simple-toasts/dist/theme/dark-edge.css")

toastConfig({ theme: "dark-edge" })

function getByteLength(str) {
  const encoder = new TextEncoder()
  const encoded = encoder.encode(str)
  return encoded.length
}

const cleanUpSvg = (data) => {
  const result = optimize(data, { ...config })
  // const originalByteLength = getByteLength(data)
  // const compressedByteLength = getByteLength(result.data)
  // const compressionRatio = 100 - (compressedByteLength / originalByteLength) * 100
  // console.log(`大小减少了：${compressionRatio.toFixed(2)}%`, {
  //   position: "bottom-right",
  // })
  // document.querySelector("#main").innerHTML = result.data
  return result.data
}

const toast = (
  str,
  opt = {
    position: "bottom-right",
  }
) => {
  simpleToast(str, opt)
}

const cleanHTML = (html) => {
  const createDOMpurify = require("dompurify")
  let DOMpurify = null
  if (typeof window !== "undefined") {
    DOMpurify = createDOMpurify()
  } else {
    const { JSDOM } = require("jsdom")
    const window = new JSDOM("").window
    DOMpurify = createDOMpurify(window)
  }
  return DOMpurify.sanitize(html, {
    ALLOWED_ATTR: [],
    KEEP_CONTENT: true,
  })
}

const compressHTML = (html) => {
  return cleanHTML(html).replace(/>\s+</g, "><").replace(/\s+/g, " ")
}

// 暂时不需要，毕竟有可能重名，知道能这样做可以直接调用就行
// if (typeof window !== "undefined") {
//   window.toast = toast;
// }
const htmlToMd = require("html-to-md")

const html2md = (html) => {
  return htmlToMd(html)
}

export { cleanUpSvg, toast, compressHTML, html2md }
