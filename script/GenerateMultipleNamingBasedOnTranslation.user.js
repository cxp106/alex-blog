// ==UserScript==
// @name         网页翻译生成命名
// @namespace    http://tampermonkey.net/
// @version      1.0.3-
// @description  通过该插件可以将一个网页上翻译好的文本转换为不同的命名方式，如大驼峰命名法、小驼峰命名法、下划线命名法等。
// @author       Radiant Moon
// @match        *://www.deepl.com/*
// @match        *://translate.google.com/*
// @match        *://translate.google.cn/*
// @icon         data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iVVRGLTgiIHN0YW5kYWxvbmU9Im5vIj8+CjwhRE9DVFlQRSBzdmcgUFVCTElDICItLy9XM0MvL0RURCBTVkcgMS4xLy9FTiIgImh0dHA6Ly93d3cudzMub3JnL0dyYXBoaWNzL1NWRy8xLjEvRFREL3N2ZzExLmR0ZCI+CjxzdmcgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiB2ZXJzaW9uPSIxLjEiIHZpZXdCb3g9IjAgMCA1MTIgNTEyIj4KPHBhdGggZmlsbD0iIzAwMDAwMCIgZD0iCiAgTSAxNTkuMzEgMC4wMAogIEwgMTY5LjA2IDAuMDAKICBRIDIyNi43NSAyLjI0IDI3MC4xNCAzNy45OQogIFEgMjc3Ljk1IDQ0LjQzIDI4NC43NSA1MS42NQogIFEgMzEzLjg4IDgyLjU2IDMyNC43MiAxMjQuMzcKICBRIDMzMS43OSAxNTEuNjIgMzI5LjM0IDE3OS4zNQogIEEgMC42MCAwLjYwIC04Ny44IDAgMCAzMjkuOTQgMTgwLjAwCiAgUSAzOTUuMDAgMTgwLjAwIDQ1OS41MCAxNzkuODEKICBRIDQ3MS4xNSAxNzkuNzggNDc0LjUwIDE4MC4yNQogIFEgNDk2Ljg0IDE4My4zOSA1MDcuMTkgMjAyLjU2CiAgUSA1MTEuMzIgMjEwLjIyIDUxMi4wMCAyMjAuMzEKICBMIDUxMi4wMCA0MTguMzEKICBRIDUxMS4xMSA0MjkuMDAgNTA2LjE5IDQzNy4xOQogIFEgNDk3LjYyIDQ1MS40MyA0ODIuMTcgNDU2LjExCiAgUSA0NzYuNjQgNDU3Ljc5IDQ2Ny4xNCA0NTcuOTYKICBRIDQ1OS44MSA0NTguMDkgNDUxLjkxIDQ1Ny45OAogIEEgMC44NCAwLjg0IDAuMyAwIDAgNDUxLjA2IDQ1OC44MgogIFEgNDUwLjk1IDQ3OS45MSA0NTEuMDAgNTAxLjUwCiAgUSA0NTEuMDIgNTEwLjI4IDQ0MS45NCA1MTIuMDAKICBMIDQzOS45NCA1MTIuMDAKICBRIDQzNi41NSA1MTEuMzIgNDM0LjU2IDUwOS42OQogIFEgNDAzLjQ3IDQ4NC4xNSAzNzIuMTQgNDU4LjU1CiAgQSAyLjQzIDIuNDIgLTI1LjIgMCAwIDM3MC42MCA0NTguMDAKICBRIDMwNS42NCA0NTguMDAgMjQyLjE5IDQ1OC4wMAogIFEgMjQyLjA5IDQ1OC4wMCAyMzQuMzIgNDU4LjEwCiAgUSAyMjUuNzkgNDU4LjIwIDIyMi4wMCA0NTcuMjUKICBRIDE5Ni4zMCA0NTAuODEgMTg5LjUzIDQyNi42MwogIFEgMTg4LjI2IDQyMi4wOSAxODguMjAgNDE1LjIzCiAgUSAxODcuODMgMzcyLjc4IDE4OC4wMSAzMjkuMTUKICBBIDAuNjEgMC42MCAtMy40IDAgMCAxODcuMzMgMzI4LjU1CiAgUSAxMjAuNDIgMzM2LjY4IDY2LjA1IDI5Ni45OQogIEEgMS4xMSAxLjEwIC0zNC41IDAgMCA2NS4xMyAyOTYuODIKICBRIDQ2LjUxIDMwMS43NSAyOC4yNCAzMDYuMzkKICBRIDI4LjE4IDMwNi40MCAyNC45NCAzMDcuNDMKICBRIDIxLjUzIDMwOC41MSAxOC4yNiAzMDcuNzIKICBRIDE0LjExIDMwNi43MSAxMS45NyAzMDMuMTUKICBRIDkuMTggMjk4LjUwIDEyLjA2IDI5Mi41NgogIFEgMTcuNDAgMjgxLjU3IDI3LjgwIDI1Ny40NQogIEEgMC45MiAwLjg5IDQwLjYgMCAwIDI3LjcyIDI1Ni41OAogIFEgMi4xMSAyMTcuNzIgMC4wMCAxNzAuOTQKICBMIDAuMDAgMTU5LjY5CiAgUSAxLjU4IDExOS40MiAyMS4wNCA4NC41OQogIFEgMjMuNjQgNzkuOTIgMjYuMjQgNzguNTUKICBRIDI4Ljk0IDc3LjEzIDMyLjEzIDc3LjU4CiAgUSAzNC45NyA3Ny45OSAzNy4yNyA4MC4wMgogIFEgNDMuNDIgODUuNDggMzguNTYgOTQuMDYKICBRIDI2LjQ2IDExNS40OCAyMi4xNSAxNDAuMTAKICBRIDIwLjQ1IDE0OS44MyAyMC4xMyAxNTkuOTcKICBRIDE4LjY1IDIwNy4yMSA0NS4yMyAyNDYuNzEKICBRIDQ1LjI2IDI0Ni43NSA0Ny4wMiAyNDkuMDcKICBRIDQ5LjQxIDI1Mi4yMiA0OS40NCAyNTYuMDAKICBRIDQ5LjQ2IDI1OC40NyA0Ny41NyAyNjIuNzMKICBRIDQzLjMxIDI3Mi4zMyAzOC42NyAyODIuMjUKICBRIDM4LjI3IDI4My4xMiAzOS4yMCAyODIuODkKICBRIDUxLjM5IDI3OS43OSA2NC4wMCAyNzYuNTAKICBRIDY3LjQyIDI3NS42MSA3MC4zMiAyNzYuMjQKICBRIDcyLjMyIDI3Ni42OCA3NS42MCAyNzkuMjEKICBRIDEyMC43NiAzMTQuMDYgMTc3LjUwIDMwOS41MAogIFEgMjA4LjU1IDMwNy4wMSAyMzYuNDEgMjkxLjE1CiAgUSAyNDUuMTEgMjg2LjIwIDI1My4wNSAyODAuMDkKICBRIDI4Mi41OCAyNTcuMzYgMjk3LjczIDIyMy4yNQogIFEgMzAxLjc1IDIxNC4yMSAzMDQuNDYgMjA0LjQ1CiAgUSAzMTguMDUgMTU1LjUzIDI5OC41NyAxMDguOTIKICBRIDI5NC42NiA5OS41NiAyODkuNjEgOTEuMDYKICBRIDI3MC42MyA1OS4xMSAyMzguNDQgNDAuMDYKICBRIDIwOC40NiAyMi4zMiAxNzMuMDAgMjAuMjUKICBRIDEzMy4zMiAxNy45MyA5Ny42MiAzNi42NgogIFEgOTEuMjUgNDAuMDEgODguOTMgNDAuNDEKICBRIDgyLjc3IDQxLjQ4IDc5LjQzIDM2LjEwCiAgUSA3Ny4xMSAzMi4zNiA3Ny45MSAyOC41MwogIFEgNzguODAgMjQuMjMgODMuMDYgMjEuODEKICBRIDExOC4zMiAxLjgwIDE1OS4zMSAwLjAwCiAgWgogIE0gMzc1LjE5IDQzOC4yMAogIFEgMzc4Ljg0IDQzOC4yMSAzODIuMjUgNDQxLjAwCiAgUSA0MDYuNDAgNDYwLjcyIDQzMC4yNSA0ODAuMjkKICBRIDQzMS4wMCA0ODAuOTEgNDMxLjAwIDQ3OS45NAogIFEgNDMxLjAwIDQ2NS43MiA0MzEuMDAgNDUxLjY1CiAgUSA0MzEuMDAgNDQ1LjY5IDQzMi40NSA0NDMuMTIKICBRIDQzNS4zMyA0MzguMDAgNDQyLjc1IDQzOC4wMAogIFEgNDU2LjAwIDQzOC4wMCA0NjkuMjUgNDM3LjkwCiAgUSA0ODIuODMgNDM3LjgwIDQ4OS4yOSA0MjYuMTEKICBRIDQ5Mi4wMiA0MjEuMTYgNDkyLjAyIDQxNS41MAogIFEgNDkyLjAwIDMyMS4yMCA0OTIuMDAgMjI2LjkxCiAgUSA0OTIuMDAgMjE4LjgwIDQ5MC42MSAyMTQuNzcKICBRIDQ4Ny4xOCAyMDQuODIgNDc3LjEzIDIwMS4zMwogIFEgNDczLjMwIDIwMC4wMCA0NjYuMTkgMjAwLjAwCiAgUSAzOTYuNDcgMjAwLjAwIDMyNi44MCAyMDAuMDAKICBBIDAuNjQgMC42MyA2LjIgMCAwIDMyNi4xOCAyMDAuNDkKICBRIDMxNC42MyAyNDkuOTIgMjc4LjU4IDI4NC4zMgogIFEgMjQ4Ljg0IDMxMi42OSAyMDguNjEgMzI0LjE4CiAgQSAwLjg1IDAuODQgLTguMyAwIDAgMjA4LjAwIDMyNC45OQogIFEgMjA4LjAwIDM2NC4wNyAyMDguMDAgNDAyLjk1CiAgUSAyMDguMDAgNDE4LjMyIDIwOC45NyA0MjEuOTYKICBRIDIxMS44NiA0MzIuODYgMjIzLjI4IDQzNi43MwogIFEgMjI3LjA1IDQzOC4wMCAyMzMuMzggNDM4LjAwCiAgUSAzMDQuMjggNDM3Ljk2IDM3NS4xOSA0MzguMjAKICBaIgovPgo8Y2lyY2xlIGZpbGw9IiMwMDAwMDAiIGN4PSI1NS4zOSIgY3k9IjU1LjM5IiByPSI5LjkzIi8+CjxwYXRoIGZpbGw9IiMwMDAwMDAiIGQ9IgogIE0gMjA0LjgxIDIxMi40NAogIFEgMjExLjEyIDIxOC40MiAyMjEuMTIgMjI0LjU0CiAgUSAyMjUuNTQgMjI3LjI0IDIyNi45MSAyMjkuMDkKICBRIDIyOS41MyAyMzIuNjMgMjI4LjM5IDIzNi44MQogIFEgMjI3LjA2IDI0MS42NiAyMjIuODEgMjQzLjY4CiAgUSAyMTguMzAgMjQ1LjgxIDIxMi44MSAyNDIuNjkKICBRIDE4MC43MyAyMjQuNDAgMTY0Ljg3IDE5MC41MwogIFEgMTY0LjQxIDE4OS41NSAxNjMuOTYgMTkwLjU0CiAgUSAxNDguNzEgMjIzLjY5IDExNy4zMSAyNDEuOTIKICBRIDExMi42MyAyNDQuNjMgMTA5LjYwIDI0NC41NAogIFEgMTA2LjM3IDI0NC40NCAxMDMuODQgMjQyLjM0CiAgUSAxMDEuNjUgMjQwLjUyIDEwMC42OCAyMzcuNDQKICBRIDk4LjM1IDIzMC4wMSAxMDUuNTYgMjI1LjgxCiAgUSAxNDQuODMgMjAyLjk1IDE1My4yNiAxNTcuOTUKICBBIDAuODAgMC44MCA1LjMgMCAwIDE1Mi40NyAxNTcuMDAKICBRIDEzNi42MyAxNTcuMDAgMTIxLjM2IDE1Ny4wMAogIFEgMTE2LjI1IDE1Ny4wMCAxMTMuODQgMTU1Ljg1CiAgUSAxMDkuNzIgMTUzLjg4IDEwOC43NCAxNDkuNDUKICBRIDEwNy43MCAxNDQuNzEgMTEwLjQzIDE0MS4wMAogIFEgMTEzLjM3IDEzNy4wMCAxMTkuMjUgMTM3LjAwCiAgUSAxMzYuMjUgMTM3LjAwIDE1My44MyAxMzcuMDAKICBBIDAuNjcgMC42NyAwLjAgMCAwIDE1NC41MCAxMzYuMzMKICBRIDE1NC41MCAxMTYuNzMgMTU0LjUwIDk3LjIwCiAgUSAxNTQuNTAgOTMuMzAgMTU1LjMzIDkxLjQzCiAgUSAxNTYuMTcgODkuNTIgMTU3LjcyIDg4LjA3CiAgUSAxNTkuMTAgODYuNzcgMTYxLjI0IDg2LjE1CiAgUSAxNjkuMTkgODMuODQgMTcyLjkxIDkwLjQzCiAgUSAxNzQuMjQgOTIuODAgMTc0LjMzIDk2Ljg1CiAgUSAxNzQuNzkgMTE2LjYxIDE3NC4zMiAxMzYuMDUKICBBIDAuOTUgMC45NCAwLjYgMCAwIDE3NS4yNyAxMzcuMDEKICBRIDE5OC44OCAxMzYuODEgMjIxLjc1IDEzNy4yNQogIFEgMjIzLjg3IDEzNy4yOSAyMjYuMDYgMTM5LjE3CiAgUSAyMjcuODUgMTQwLjcxIDIyOC44NiAxNDIuODAKICBRIDIzMS4zOSAxNDguMDMgMjI3LjgxIDE1My4wNgogIFEgMjI1LjA1IDE1Ni45NiAyMTkuNzUgMTU2Ljk2CiAgUSAxOTcuNzggMTU2Ljk1IDE3Ni4zNCAxNTcuMDYKICBBIDAuNjkgMC42OCA4NC43IDAgMCAxNzUuNjcgMTU3Ljg3CiAgUSAxODEuNTMgMTkwLjM4IDIwNC44MSAyMTIuNDQKICBaIgovPgo8cGF0aCBmaWxsPSIjMDAwMDAwIiBkPSIKICBNIDI5OS4yMyAzNDcuOTcKICBRIDI5NS4wOSAzNDQuODYgMjk0LjY0IDM0MC41NAogIFEgMjk0LjMxIDMzNy40NyAyOTUuODkgMzM0LjY4CiAgUSAyOTcuNTAgMzMxLjg0IDMwMC41NiAzMzAuNDUKICBRIDMwMS45MSAzMjkuODMgMzA0LjU2IDMyOS42NQogIFEgMzA2LjM4IDMyOS41MiAzMDguMTkgMzI5LjI2CiAgQSAwLjkwIDAuODkgNy43IDAgMCAzMDguODkgMzI4LjczCiAgUSAzMjMuOTEgMjk0LjY4IDMzOC45MCAyNjAuNjIKICBRIDMzOC45MSAyNjAuNTggMzM5Ljk2IDI1Ny44MgogIFEgMzQxLjE3IDI1NC42MyAzNDMuNjggMjUyLjU0CiAgUSAzNDYuMDkgMjUwLjUyIDM0OS40MCAyNTAuMjQKICBRIDM1Ni4zMyAyNDkuNjUgMzU5LjMxIDI1Ni40NAogIFEgMzc1LjIyIDI5Mi41NyAzOTAuNzYgMzI4LjIwCiAgQSAyLjIzIDIuMjMgLTEzLjMgMCAwIDM5Mi45MiAzMjkuNTMKICBRIDM5OS4zNiAzMjkuMTkgNDAyLjgxIDMzMy4wMAogIFEgNDA1LjgxIDMzNi4zMiA0MDUuMzMgMzQwLjYxCiAgUSA0MDQuODUgMzQ0LjkyIDQwMC41OSAzNDguMTQKICBBIDEuMjMgMS4yMiA1OS43IDAgMCA0MDAuMjEgMzQ5LjYwCiAgUSA0MDQuODMgMzYwLjEyIDQwOS4xOSAzNzAuMTkKICBRIDQxMi4xNSAzNzcuMDEgNDEyLjMwIDM3Ny43NAogIFEgNDEyLjkyIDM4MC43MyA0MTEuNzggMzgzLjY0CiAgUSA0MTAuNzcgMzg2LjIyIDQwOC4yMCAzODcuOTgKICBRIDQwMi4wMSAzOTIuMjQgMzk2LjY3IDM4Ny43OAogIFEgMzk0LjMxIDM4NS44MSAzOTIuMTAgMzgwLjg0CiAgUSAzODUuNDkgMzY1LjkyIDM3OC42MSAzNTAuMTYKICBBIDEuMDkgMS4wOCAtMTEuNCAwIDAgMzc3LjYxIDM0OS41MAogIEwgMzIyLjI3IDM0OS41MAogIEEgMS4wOSAxLjA4IC03OC42IDAgMCAzMjEuMjcgMzUwLjE3CiAgUSAzMTQuMzQgMzY2LjgzIDMwNi42OSAzODMuMjYKICBRIDMwNS4yNCAzODYuMzggMzAzLjIxIDM4Ny44NgogIFEgMjk3LjIyIDM5Mi4yNiAyOTEuNTcgMzg3Ljg0CiAgUSAyODguNDQgMzg1LjQwIDI4Ny43OSAzODIuMjIKICBRIDI4Ny4xMCAzNzguODcgMjg4Ljc1IDM3NS4wMAogIFEgMjk0LjAwIDM2Mi42OCAyOTkuNzEgMzQ5LjgyCiAgQSAxLjU0IDEuNTMgMzAuNyAwIDAgMjk5LjIzIDM0Ny45NwogIFoKICBNIDM2OC41MSAzMjkuNTYKICBBIDAuNzEgMC43MSA3OC4yIDAgMCAzNjkuMTYgMzI4LjU2CiAgUSAzNTkuODIgMzA3LjUxIDM1MC42MCAyODYuMTgKICBRIDM1MC40MSAyODUuNzQgMzUwLjE0IDI4NS41NQogIFEgMzQ5LjQ4IDI4NS4wNyAzNDkuMjUgMjg2LjAwCiAgUSAzNDguNzEgMjg4LjIxIDM0OC4zNCAyODkuMDQKICBRIDMzOS43NiAzMDguMjcgMzMwLjc4IDMyOC43OAogIEEgMC41MSAwLjUxIDExLjkgMCAwIDMzMS4yNSAzMjkuNTAKICBMIDM2OC41MSAzMjkuNTYKICBaIgovPgo8L3N2Zz4K
// @grant        GM_setClipboard
// @updateURL    https://cxp.netlify.app/script/GenerateMultipleNamingBasedOnTranslation.user.js
// @downloadURL  https://cxp.netlify.app/script/GenerateMultipleNamingBasedOnTranslation.user.js
// @require      https://cxp.netlify.app/script/tools/toast.min.js
// ==/UserScript==

const rules = `
# 格式如下
# 域名 | 翻译好文本的选择器 | 显示转换后文本的父级选择器

# deepl 翻译
www.deepl.com|[data-testid="translator-target-input"] .sentence_highlight|main

# 谷歌翻译
translate.google.com|[aria-live="polite"] span span span|.OPPzxe
translate.google.cn|[aria-live="polite"] span span span|.OPPzxe
`

async function copyToClipboard(content) {
  try {
    await navigator.clipboard.writeText(content)
    showToast(`✅ ${content} 复制成功`)
  } catch (err) {
    console.error("Failed to copy text to clipboard:", err)
  }
}

class NamingConvention {
  constructor(variableName) {
    this.initCommandMap()
    this.originVariableName = variableName
    let words = []
    ;["-", "_", " "].forEach((separator) => {
      if (variableName.indexOf(separator) > 0) {
        words = variableName.split(separator)
      }
    })
    if (words.length <= 0) {
      words = variableName.match(/(^[A-Z]|^|[A-Z])([a-z]+)?/g)
    }
    this.wordList = words?.join("-").toLocaleLowerCase().split("-")
  }

  initCommandMap() {
    this.commandMap = new Map()
    this.commandMap.set("UpperCamelCase", this.toUpperCamelCase)
    this.commandMap.set("CamelCase", this.toCamelCase)
    this.commandMap.set("Snake", this.toSnake)
    this.commandMap.set("Hyphen", this.toHyphen)
    this.commandMap.set("Constant", this.toConstant)
    this.commandMap.set("LocaleLowerCase", this.toLocaleLowerCase)
    this.commandMap.set("LocaleUpperCase", this.toLocaleUpperCase)
    this.commandMap.set("SpaceUpperCase", this.toSpaceUpperCase)
    this.commandMap.set("SpaceLowerCase", this.toSpaceLowerCase)
    this.commandMap.set("SpaceUpperCamelCase", this.toSpaceUpperCamelCase)
    this.commandMap.set("SpaceCamelCase", this.toSpaceCamelCase)
  }

  toUpperCamelCase(separator) {
    let words = []
    this.wordList?.forEach((word) => {
      word = word.replace(/(^[a-z])/, (match) => match.toLocaleUpperCase())
      words.push(word)
    })
    return words.join(separator || "")
  }

  toCamelCase(separator) {
    let words = []
    this.wordList?.forEach((word, index) => {
      if (index !== 0) {
        word = word.replace(/(^[a-z])/, (match) => match.toLocaleUpperCase())
      }
      words.push(word)
    })
    return words.join(separator || "")
  }

  toSnake() {
    return this.wordList?.join("_")
  }

  toHyphen() {
    return this.wordList?.join("-")
  }

  toConstant() {
    return this.wordList?.join("_").toLocaleUpperCase()
  }

  toLocaleLowerCase() {
    return this.originVariableName.toLocaleLowerCase()
  }

  toLocaleUpperCase() {
    return this.originVariableName.toLocaleUpperCase()
  }

  toSpaceLowerCase() {
    return this.wordList?.join(" ").toLocaleLowerCase()
  }

  toSpaceUpperCase() {
    return this.wordList?.join(" ").toLocaleUpperCase()
  }

  toSpaceUpperCamelCase() {
    return this.toUpperCamelCase(" ")
  }

  toSpaceCamelCase() {
    return this.toCamelCase(" ")
  }

  convertTo(convertType, separator) {
    const converter = this.commandMap.get(convertType)
    return converter?.call(this, separator || "")
  }
}

;(function () {
  "use strict"
  const showToast = (text) => {
    toast(text)
  }
  // 定义正则表达式
  const regExp = /^([^\n|]+)\|(.+)\|(.+)$/gm

  // 匹配字符串并提取数据
  let matches
  console.log("%c [ matches ]-139", "font-size:13px; background:pink; color:#bf2c9f;", matches)
  while ((matches = regExp.exec(rules))) {
    const domain = matches[1].trim()
    const selector1 = matches[2].trim()
    console.log("%c selector1 => ", "font-size:13px; background:#464646; color:#EAEDC4;", selector1)
    const selector2 = matches[3].trim()
    if (location.hostname === domain) {
      console.log(
        "%c 方法执行了，如果没有正常显示，请更换选择器配置，当前域名是 => ",
        "font-size:13px; background:#464646; color:#EAEDC4;",
        domain
      )
      let str = ""

      // Select the target node you want to observe
      const targetNode = document.querySelector("body")

      // Create a new instance of MutationObserver
      const observer = new MutationObserver(() => {
        const TRANSLATION_BOX = document.querySelector(selector1)
        if (!TRANSLATION_BOX) return
        if (str === TRANSLATION_BOX.innerText) return
        str = TRANSLATION_BOX.innerText

        const testNaming = new NamingConvention(TRANSLATION_BOX.innerText)
        const result = {
          upperCamelCase: {
            title: "大驼峰写法 (帕斯卡命名法)",
            search: "dtf,datuofeng,psk,pasika,ucc,uppercamelcase",
            value: testNaming.convertTo("UpperCamelCase"),
          },
          camelCase: {
            title: "小驼峰写法 (驼峰命名法)",
            search: "xtf,xiaotuofeng,cc,camelcase",
            value: testNaming.convertTo("CamelCase"),
          },
          snake: {
            title: "蛇形写法 (下划线命名法)",
            search: "sx,shexing,xhx,xiahuaxian,snake,_",
            value: testNaming.convertTo("Snake"),
          },
          hyphen: {
            title: "连字符写法 (中划线命名法)",
            search: "l,h,lzf,lianzifu,zhx,zhonghuaxian,hyphen,-",
            value: testNaming.convertTo("Hyphen"),
          },
          constant: {
            title: "常量名",
            search: "clm,changliangming,const",
            value: testNaming.convertTo("Constant"),
          },
          localeLowerCase: {
            title: "全小写",
            search: "qxx,quanxiaoxie,llc,localelowercase",
            value: testNaming.convertTo("LocaleLowerCase"),
          },
          localeUpperCase: {
            title: "全大写",
            search: "qdx,quandaxie,luc,localeuppercase",
            value: testNaming.convertTo("LocaleUpperCase"),
          },
          spaceUpperCase: {
            title: "空格 全大写",
            search: " dx, qdx,kdx,kqd,kgqdx,kongquandaxie,konggequandaxie",
            value: testNaming.convertTo("SpaceUpperCase"),
          },
          spaceLowerCase: {
            title: "空格 全小写",
            search: " xx, qxx,kxx,kqx,kgqxx,kongquanxiao,konggequanxiaoxie",
            value: testNaming.convertTo("SpaceLowerCase"),
          },
          spaceUpperCamelCase: {
            title: "空格 大驼峰",
            search: " dtf,kdtf,kgdtf,kongdatuofeng,konggedatuofeng",
            value: testNaming.convertTo("SpaceUpperCamelCase"),
          },
          spaceCamelCase: {
            title: "空格 小驼峰",
            search: " xtf,kxtf,kongxiaotuofeng,konggexiaotuofeng",
            value: testNaming.convertTo("SpaceCamelCase"),
          },
        }

        const container = document.querySelector(selector2)
        console.log("%c [ container ]-226", "font-size:13px; background:pink; color:#bf2c9f;", container)
        if (!container) return

        let oldParagraph = container.querySelector(".paragraph")

        if (oldParagraph) oldParagraph.remove()

        // 创建一个无序列表
        const list = document.createElement("ul")
        list.setAttribute("class", "paragraph")

        Object.values(result).forEach((item) => {
          const listItem = document.createElement("li")
          listItem.setAttribute("style", "margin: 5px;padding: 5px;cursor: pointer;")
          listItem.textContent = `${item.title}：${item.value}`

          // 为列表子项添加点击事件
          listItem.addEventListener("click", function () {
            // 将文本内容复制到剪贴板中
            const content = item.value
            try {
              GM_setClipboard(content, "text")
              showToast(`🚀 ${content} 复制成功`)
            } catch (error) {
              copyToClipboard(content)
            }
          })

          list.appendChild(listItem)
        })

        container.appendChild(list)
      })

      // Configure the observer to monitor child elements addition/removal
      const config = { childList: true, subtree: true }

      // Start observing the target node with the configured options
      observer.observe(targetNode, config)
    }
  }
})()
