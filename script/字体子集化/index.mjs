import { getUnicodeRanges, parseUnicodeRange } from "./utils.mjs"

const url = "https://fonts.googleapis.com/css2?family=Noto+Sans+SC"
const ua = "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:101.0) Gecko/20100101 Firefox/101.0"

/**
 * get css from google fonts
 * @returns {Promise<string>}
 */
async function getCSS() {
  const res = await fetch(url, {
    headers: { "User-Agent": ua },
  })
  const css = await res.text()
  return css
}

const main = async () => {
  const css = await getCSS()
  const ranges = getUnicodeRanges(css)
  Object.entries(ranges).forEach(([id, range]) => {
    const unicodeArr = parseUnicodeRange(range)
    ranges[id] = unicodeArr
  })
  console.log("%c ranges => ", "font-size:13px; background:#baccd9; color:#000;", ranges)
}

main()
