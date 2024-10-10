/**
 * get unicode ranges from css
 * @param {string} css
 * @returns {any}
 */
export function getUnicodeRanges(css) {
    css = css.replace(/\n/g, "")
    const idExp = /(\[\d+\])/gi
    const rangeExp = /unicode-range: ([^;]+);/gi
    let idExpr = idExp.exec(css)
    let rangeExpr = rangeExp.exec(css)
    const res = {}
    while (idExpr && rangeExpr && idExpr[1] && rangeExpr[1]) {
      res[idExpr[1]] = rangeExpr[1].replace(/ /g, "")
      idExpr = idExp.exec(css)
      rangeExpr = rangeExp.exec(css)
    }
    if (Object.keys(res).length === 0) {
      return null
    }
    return res
  }
  
  /**
   * replace unicode range to individual unicode
   * @param {string} range
   * @returns {string[]}
   */
  export function parseUnicodeRange(range) {
    const rangeArr = range.split(",")
    const res = []
    rangeArr.forEach((item) => {
      if (!item.includes("-")) {
        res.push(item)
      } else {
        const tempArr = /U\+([0-9A-F]+)-([0-9A-F]+)/i.exec(item)
        const startInt = Number.parseInt(tempArr[1], 16)
        const endInt = Number.parseInt(tempArr[2], 16)
        for (let i = startInt; i <= endInt; i++) {
          const hex = i.toString(16)
          res.push("U+" + hex)
        }
      }
    })
    return res
  }
  