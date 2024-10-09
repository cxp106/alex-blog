// ==UserScript==
// @name         聚合搜索引擎切换导航
// @namespace    http://tampermonkey.net/
// @version      1.0.4
// @description  在搜索顶部显示一个聚合搜索引擎切换导航，综合搜索引擎。专注手机网页搜索引擎切换，纯粹的搜索。SearchJumper、搜索跳转、聚合搜索、All Search、Punk Search、搜索切换、搜索酱。
// @author       千川汇海
// @match        *://*/*
// @updateURL    https://cxp.netlify.app/script/PolymerizationSearchEngineToggleNavigation.user.js
// @downloadURL  https://cxp.netlify.app/script/PolymerizationSearchEngineToggleNavigation.user.js
// @grant        unsafeWindow
// @grant        GM_getValue
// @grant        GM_setValue
// @run-at       document-body
// @license     MIT
// ==/UserScript==

const punkDeafultMark = "Luxirty-Bing-Metaso-Searchgptool-Baidu-Google-Toutiao-Fsou-Quark-Sougou-360"
const punkAllSearchMark = "Bing-Metaso-Baidu-Google-Zhihu-Fsou-360-Quark-Sougou-Toutiao-Yandex-Ecosia-DuckDuckGo-QwantLite-Swisscows"

const searchUrlMap = [
  { name: "必应", searchUrl: "https://www.bing.com/search?q=", searchkeyName: ["q"], matchUrl: /bing\.com.*?search\?q=?/g, mark: "Bing" },
  { name: "秘塔", searchUrl: "https://metaso.cn/?q=", searchkeyName: ["q"], matchUrl: /metaso\.cn.*\?q=?/g, mark: "Metaso" },
  {
    name: "Gpt",
    searchUrl: "https://searchgptool.ai/search?q=",
    searchkeyName: ["q"],
    matchUrl: /searchgptool\.ai.*\?q=?/g,
    mark: "Searchgptool",
  },
  {
    name: "Luxirty",
    searchUrl: "https://search.luxirty.com/search?q=",
    searchkeyName: ["q"],
    matchUrl: /luxirty\.com.*\?q=?/g,
    mark: "Luxirty",
  },
  { name: "百度", searchUrl: "https://baidu.com/s?wd=", searchkeyName: ["wd", "word"], matchUrl: /baidu\.com.*?w(or)?d=?/g, mark: "Baidu" },
  {
    name: "谷歌",
    searchUrl: "https://www.google.com/search?q=",
    searchkeyName: ["q"],
    matchUrl: /google\.com.*?search.*?q=/g,
    mark: "Google",
  },
  { name: "知乎", searchUrl: "https://www.zhihu.com/search?q=", searchkeyName: ["q"], matchUrl: /zhihu\.com\/search.*?q=/g, mark: "Zhihu" },
  { name: "F 搜", searchUrl: "https://fsoufsou.com/search?q=", searchkeyName: ["q"], matchUrl: /fsoufsou\.com\/.*?q=/g, mark: "Fsou" },
  { name: "360", searchUrl: "https://www.so.com/s?q=", searchkeyName: ["q"], matchUrl: /\.so\.com.*?q=/g, mark: "360" },
  { name: "夸克", searchUrl: "https://quark.sm.cn/s?q=", searchkeyName: ["q"], matchUrl: /sm\.cn.*?q=/g, mark: "Quark" },
  {
    name: "搜狗",
    searchUrl: "https://m.sogou.com/web/searchList.jsp?keyword=",
    searchkeyName: ["keyword"],
    matchUrl: /sogou\.com.*?keyword=/g,
    mark: "Sougou",
  },
  {
    name: "头条",
    searchUrl: "https://so.toutiao.com/search/?keyword=",
    searchkeyName: ["keyword"],
    matchUrl: /toutiao\.com.*?keyword=/g,
    mark: "Toutiao",
  },
  {
    name: "Yandex",
    searchUrl: "https://yandex.com/search/touch/?text=",
    searchkeyName: ["text"],
    matchUrl: /((ya(ndex)?\.ru)|(yandex\.com)).*?text=/g,
    mark: "Yandex",
  },
  {
    name: "DuckDuckGo",
    searchUrl: "https://duckduckgo.com/?q=",
    searchkeyName: ["q"],
    matchUrl: /duckduckgo\.com.*?q=/g,
    mark: "DuckDuckGo",
  },
  { name: "Ecosia", searchUrl: "https://www.ecosia.org/search?q=", searchkeyName: ["q"], matchUrl: /ecosia\.org.*?q=/g, mark: "Ecosia" },
  {
    name: "QwantLite",
    searchUrl: "https://lite.qwant.com/?q=",
    searchkeyName: ["q"],
    matchUrl: /lite\.qwant\.com.*?q=/g,
    mark: "QwantLite",
  },
  {
    name: "Swisscows",
    searchUrl: "https://swisscows.com/en/web?query=",
    searchkeyName: ["query"],
    matchUrl: /swisscows\.com.*?query=/g,
    mark: "Swisscows",
  },
]

const punkSocialMap = [
  {
    tabName: "日常",
    tabList: [
      { name: "知乎", searchUrl: "https://www.zhihu.com/search?q=" },
      { name: "豆瓣", searchUrl: "https://m.douban.com/search/?query=" },
      { name: "微博", searchUrl: "https://m.weibo.cn/search?containerid=100103&q=" },
      { name: "哔哩哔哩", searchUrl: "https://m.bilibili.com/search?keyword=" },
      { name: "维基百科", searchUrl: "https://zh.m.wikipedia.org/wiki/" },
      { name: "安娜的档案", searchUrl: "https://annas-archive.org/search?q=" },
      { name: "Unsplash", searchUrl: "https://unsplash.com/s/photos/" },
      { name: "火山翻译", searchUrl: "https://translate.volcengine.com/mobile?text=" },
      { name: "博客园", searchUrl: "https://zzk.cnblogs.com/s?w=" },
    ],
  },
  {
    tabName: "娱乐",
    tabList: [
      { name: "知乎", searchUrl: "https://www.zhihu.com/search?q=" },
      { name: "豆瓣", searchUrl: "https://m.douban.com/search/?query=" },
      { name: "微博", searchUrl: "https://m.weibo.cn/search?containerid=100103&q=" },
      { name: "哔哩哔哩", searchUrl: "https://m.bilibili.com/search?keyword=" },
      { name: "小红书", searchUrl: "https://m.sogou.com/web/xiaohongshu?keyword=" },
      { name: "微信文章", searchUrl: "https://weixin.sogou.com/weixinwap?type=2&query=" },
      { name: "推特", searchUrl: "https://mobile.twitter.com/search/" },
      { name: "豆瓣阅读", searchUrl: "https://read.douban.com/search?q=" },
      { name: "Malavida", searchUrl: "https://www.malavida.com/en/android/s/" },
      { name: "ApkPure", searchUrl: "https://m.apkpure.com/search?q=" },
      { name: "安娜的档案", searchUrl: "https://annas-archive.org/search?q=" },
      { name: "人人影视", searchUrl: "https://www.renren.pro/search?wd=" },
      { name: "豌豆 Pro", searchUrl: "https://wandou.la/search/" },
    ],
  },
  {
    tabName: "开发",
    tabList: [
      { name: "开发者搜索", searchUrl: "https://kaifa.baidu.com/searchPage?wd=" },
      { name: "GitHub", searchUrl: "https://github.com/search?q=" },
      { name: "Gitee", searchUrl: "https://search.gitee.com/?q=" },
      { name: "Stackoverflow", searchUrl: "https://stackoverflow.com/search?q=" },
      { name: "GreasyFork", searchUrl: "https://greasyfork.org/scripts?q=" },
      { name: "MDN", searchUrl: "https://developer.mozilla.org/search?q=" },
      { name: "菜鸟教程", searchUrl: "https://www.runoob.com/?s=" },
      { name: "掘金", searchUrl: "https://juejin.cn/search?query=" },
      { name: "博客园", searchUrl: "https://zzk.cnblogs.com/s?w=" },
    ],
  },
  {
    tabName: "网盘",
    tabList: [
      { name: "阿里云盘", searchUrl: "https://alipansou.com/search?k=" },
      { name: "百度云盘", searchUrl: "https://xiongdipan.com/search?k=" },
      { name: "夸克网盘", searchUrl: "https://aipanso.com/search?k=" },
      { name: "罗马网盘", searchUrl: "https://www.luomapan.com/#/main/search?keyword=" },
    ],
  },
  {
    tabName: "翻译",
    tabList: [
      { name: "有道词典", searchUrl: "https://youdao.com/m/result?word=" },
      { name: "必应翻译", searchUrl: "https://cn.bing.com/dict/search?q=" },
      { name: "百度翻译", searchUrl: "https://fanyi.baidu.com/#zh/en/" },
      { name: "谷歌翻译", searchUrl: "https://translate.google.com/?q=" },
      { name: "火山翻译", searchUrl: "https://translate.volcengine.com/mobile?text=" },
      { name: "DeepL 翻译", searchUrl: "https://www.deepl.com/translator-mobile#zh/en/" },
    ],
  },
  {
    tabName: "图片",
    tabList: [
      { name: "谷歌搜图", searchUrl: "https://www.google.com.hk/search?tbm=isch&q=" },
      { name: "必应搜图", searchUrl: "https://www.bing.com/images/search?q=" },
      { name: "Flickr", searchUrl: "http://www.flickr.com/search/?q=" },
      { name: "Pinterest", searchUrl: "https://www.pinterest.com/search/pins/?q=" },
      { name: "Pixabay", searchUrl: "https://pixabay.com/zh/images/search/" },
      { name: "花瓣", searchUrl: "https://huaban.com/search/?q=" },
      { name: "Unsplash", searchUrl: "https://unsplash.com/s/photos/" },
    ],
  },
]

function addOpenSearchBox() {
  const oDivtemp = document.createElement("div")
  oDivtemp.id = "punk-search-open-box"
  oDivtemp.style.display = "none"
  document.getElementById("punkjet-search-box").after(oDivtemp)
}

function addTabfunction() {
  const tabList = document.querySelector("#punk-tablist")
  const lis = tabList.querySelectorAll("li")
  const items = document.querySelectorAll(".punk-item")

  tabList.addEventListener("click", (event) => {
    const target = event.target
    if (target.tagName.toLowerCase() === "li") {
      lis.forEach((li) => li.classList.remove("punk-current"))
      target.classList.add("punk-current")

      const index = Array.from(lis).indexOf(target)
      items.forEach((item, idx) => {
        item.style.display = idx === index ? "block" : "none"
      })
    }
  })
}

function addSingleTab(node, tabList) {
  const ulList = document.createElement("ul")
  node.appendChild(ulList)
  const fragment = document.createDocumentFragment() // 创建一个文档碎片，减少 DOM 渲染次数

  tabList.forEach((item) => {
    const liItem = document.createElement("li")
    liItem.innerHTML = `<a href='' id="punk-url-a" url='${item.searchUrl}'>${item.name}</a>`
    fragment.appendChild(liItem)
  })

  ulList.appendChild(fragment)
  return node
}

function addJumpSearchBox() {
  const searchJumpBox = document.createElement("div")
  searchJumpBox.id = "punk-search-jump-box"
  searchJumpBox.style.display = "none"
  document.getElementById("punkjet-search-box").appendChild(searchJumpBox)

  const searchAllBox = createSearchAllBox()
  searchJumpBox.appendChild(searchAllBox)

  const punkTabList = createPunkTabList()
  searchJumpBox.appendChild(punkTabList)

  const punkTabListContent = createPunkTabListContent()
  searchJumpBox.appendChild(punkTabListContent)

  const jumpSortTitle = document.createElement("h1")
  jumpSortTitle.innerText = "■搜索引擎排序"
  searchJumpBox.appendChild(jumpSortTitle)

  const jumpSortDesc = document.createElement("div")
  jumpSortDesc.className = "jump-sort-discription"
  jumpSortDesc.innerHTML = `<a style="color:#666666 !important">说明：除搜索引擎，其他站只跳转无导航<br>支持的格式：${punkAllSearchMark}</a>`
  searchJumpBox.appendChild(jumpSortDesc)

  const punkJumpButton = createJumpButton("点击输入排序", function () {
    const userSetting = prompt(
      "请输入需要显示的引擎！\n格式举例：Quark-Zhihu-Toutiao-360\n则导航为：夸克、知乎、头条、360",
      GM_getValue("punk_setup_search") || punkDeafultMark
    )
    if (userSetting) {
      GM_setValue("punk_setup_search", userSetting)
      setTimeout(() => location.reload(), 200)
    }
  })
  searchJumpBox.appendChild(punkJumpButton)

  const punkJumpClose = createJumpButton("收起", function () {
    searchJumpBox.style.display = "none"
  })
  searchJumpBox.appendChild(punkJumpClose)
}

function createSearchAllBox() {
  const searchAllBox = document.createElement("div")
  searchAllBox.id = "punk-search-all-app"

  const jumpAllSearchTitle = document.createElement("h1")
  jumpAllSearchTitle.innerText = "✰全部搜索引擎"
  searchAllBox.appendChild(jumpAllSearchTitle)

  addSingleTab(searchAllBox, searchUrlMap)

  return searchAllBox
}

function createPunkTabList() {
  const punkTabList = document.createElement("div")
  punkTabList.id = "punk-tablist"

  const jumpSocialTitle = document.createElement("h1")
  jumpSocialTitle.innerText = "@社交网络"
  punkTabList.appendChild(jumpSocialTitle)

  const ulList = document.createElement("ul")
  const fragment = document.createDocumentFragment()
  punkSocialMap.forEach((social, index) => {
    const liItem = document.createElement("li")
    liItem.className = index === 0 ? "punk-current" : ""
    liItem.innerText = social.tabName
    fragment.appendChild(liItem)
  })
  ulList.appendChild(fragment)
  punkTabList.appendChild(ulList)

  return punkTabList
}

function createPunkTabListContent() {
  const punkTabListContent = document.createElement("div")
  punkTabListContent.className = "tab-content"
  const fragment = document.createDocumentFragment()
  punkSocialMap.forEach((social, index) => {
    const liItem = document.createElement("div")
    liItem.className = "punk-item"
    liItem.style.display = index === 0 ? "block" : "none"
    addSingleTab(liItem, social.tabList)
    fragment.appendChild(liItem)
  })
  punkTabListContent.appendChild(fragment)

  return punkTabListContent
}

function createJumpButton(text, onClick) {
  const button = document.createElement("button")
  button.innerText = text
  button.className = "punk-jump-sort-btn"
  button.onclick = onClick
  return button
}

function punkSearchClickFunction() {
  const btnPunkOpen = document.querySelector("#punk-search-open-box")
  const searchBox = document.getElementById("punkjet-search-box")
  const bodyStyle = document.getElementsByTagName("body")[0].style
  const searchStickyBar = document.getElementsByClassName("_search-sticky-bar")[0]
  const btnSet = document.querySelector("#search-setting-box")
  const btnClose = document.querySelector("#search-close-box")
  const punkJump = document.getElementById("punk-search-jump-box")

  btnPunkOpen.onclick = function () {
    const isHidden = searchBox.style.display === "none"
    searchBox.style.display = isHidden ? "block" : "none"
    bodyStyle.marginTop = isHidden ? "35px !important" : "0px !important"
    btnPunkOpen.style.display = isHidden ? "none" : "block"
    searchStickyBar.style.setProperty("top", isHidden ? "34px" : "0px", "important")
  }

  btnSet.onclick = function () {
    punkJump.style.display = punkJump.style.display === "none" ? "block" : "none"
  }

  btnClose.onclick = function () {
    searchBox.style.display = "none"
    bodyStyle.marginTop = "0px !important"
    searchStickyBar.style.setProperty("top", "0px", "important")
    btnPunkOpen.style.display = "block"
  }
}

function addSearchBox() {
  const punkJetBox = document.createElement("div")
  punkJetBox.id = "punkjet-search-box"
  punkJetBox.style.display = "block"
  punkJetBox.style.fontSize = "15px"

  const searchBox = document.createElement("div")
  searchBox.id = "punk-search-navi-box"
  punkJetBox.appendChild(searchBox)

  const appBoxDiv = document.createElement("div")
  appBoxDiv.id = "punk-search-app-box"
  searchBox.appendChild(appBoxDiv)

  const ulList = document.createElement("ul")
  appBoxDiv.appendChild(ulList)

  const fragment = document.createDocumentFragment() // 创建一个文档碎片，减少 DOM 渲染次数

  const showList = GM_getValue("punk_setup_search").split("-")
  const currentUrl = window.location.href

  // 提前编译所有正则表达式
  const compiledPatterns = searchUrlMap.reduce((acc, item) => {
    acc[item.mark] = new RegExp(item.matchUrl)
    return acc
  }, {})

  // 将 searchUrlMap 转换为字典
  const searchUrlDict = searchUrlMap.reduce((acc, item) => {
    acc[item.mark] = item
    return acc
  }, {})

  const createLinkElement = (item, currentUrl) => {
    const liItem = document.createElement("li")
    const regex = compiledPatterns[item.mark]
    const linkColor = regex.test(currentUrl) ? "color:#f9ed69 !important" : ""
    const anchor = document.createElement("a")
    anchor.id = "punk-url-a"
    anchor.style = linkColor
    anchor.href = ""
    anchor.setAttribute("url", item.searchUrl)
    anchor.textContent = item.name
    liItem.appendChild(anchor)
    return liItem
  }

  showList.forEach((showItem) => {
    const item = searchUrlDict[showItem]
    if (item) {
      const liItem = createLinkElement(item, currentUrl)
      fragment.appendChild(liItem)
    }
  })

  ulList.appendChild(fragment)

  const setBoxDiv = document.createElement("div")
  setBoxDiv.id = "search-setting-box"
  setBoxDiv.innerHTML = `<span id="punkBtnSet"> </span>`
  searchBox.appendChild(setBoxDiv)

  const closeBoxDiv = document.createElement("div")
  closeBoxDiv.id = "search-close-box"
  closeBoxDiv.innerHTML = `<span id="punkBtnClose"></span>`
  searchBox.appendChild(closeBoxDiv)

  document.getElementsByTagName("head")[0].after(punkJetBox)
}

function funcTouchStart() {
  const myNodelist = document.querySelectorAll("*")
  const searchBox = document.getElementById("punkjet-search-box")
  const searchBoxDisplay = searchBox ? searchBox.style.display : null

  myNodelist.forEach((node) => {
    const style = window.getComputedStyle(node)
    const position = style.getPropertyValue("position")
    const zIndex = style.getPropertyValue("z-index")
    const top = style.getPropertyValue("top")

    if (position === "fixed" && zIndex !== "9999999") {
      if (top === "0px" && searchBoxDisplay === "block") {
        node.style.top = "35px"
      } else if (top === "35px" && searchBoxDisplay === "none") {
        node.style.top = "0px"
      }
    } else if (top === "35px") {
      node.style.top = "0px"
    }
  })
}

function funcPopState() {
  const myNodelist = document.querySelectorAll("*")
  myNodelist.forEach((node) => {
    const style = window.getComputedStyle(node)
    const position = style.getPropertyValue("position")
    const top = style.getPropertyValue("top")
    if (position !== "fixed" && top === "35px") {
      node.style.top = "0px"
    }
  })
}

function addUrlToElements() {
  setTimeout(funcTouchStart, 200)

  const debouncedTouchStart = debounce(funcTouchStart, 550)
  window.addEventListener("touchstart", debouncedTouchStart)

  const debouncedPopState = debounce(funcPopState, 100)
  window.addEventListener("popstate", debouncedPopState)

  const updateHref = (event) => {
    const element = event.target
    element.setAttribute("href", element.getAttribute("url") + GM_getValue("key_words"))
  }

  const aElements = document.querySelectorAll("#punk-url-a")
  for (const element of aElements) {
    element.addEventListener("click", updateHref)
    element.addEventListener("contextmenu", updateHref)
  }
}

function debounce(func, wait) {
  let timeout
  return function (...args) {
    clearTimeout(timeout)
    timeout = setTimeout(() => func.apply(this, args), wait)
  }
}

function enableHorizontalScroll() {
  if (isDesktop()) {
    document.addEventListener("DOMContentLoaded", initHorizontalScroll)
  }
}

function isDesktop() {
  // 检测是否为桌面端设备
  const userAgent = navigator.userAgent.toLowerCase()
  const isMobile = /mobile|tablet|ip(ad|hone|od)|android|silk|crios|opera mini|opera mobi|windows phone|blackberry|palm|bada/i.test(
    userAgent
  )
  return !isMobile
}

function initHorizontalScroll() {
  const ulElement = document.querySelector("#punk-search-app-box ul")
  ulElement.addEventListener("wheel", handleWheelEvent)
}

function handleWheelEvent(event) {
  if (event.deltaY !== 0) {
    ulElement.scrollLeft += event.deltaY > 0 ? 50 : -50 // 根据滚动方向调整 scrollLeft
    event.preventDefault() // 阻止默认的滚动行为
  }
}

function injectStyle() {
  const SEARCH_BOX_CSS = `#punkjet-search-box{position:fixed;flex-direction:column;top:0;left:0px;width:100%;height:35px;background-color:#ffffff !important;font-size:15px;z-index:9999999;justify-content:flex-end}#punk-search-navi-box{display:-webkit-flex;display:flex;width:100%;height:35px}#punk-search-jump-box{padding:8px;background-color:#ffffff !important;max-width:480px;float:right;max-height:calc(80vh);overflow:scroll;box-shadow:0px 0px 1px 0px #000000;-ms-overflow-style:none;scrollbar-width:none}#punk-search-jump-box::-webkit-scrollbar{display:none}#punk-search-app-box{flex:1;width:0}#punk-need-hide-box{flex:1;width:0;display:flex}#search-setting-box{flex:0 0 30px;text-align:center;margin:auto;background:url("data:image/svg+xml;utf8,%3Csvg width='48' height='48' xmlns='http://www.w3.org/2000/svg' fill='none'%3E%3Cg%3E%3Ctitle%3ELayer 1%3C/title%3E%3Cpath id='svg_1' stroke-linejoin='round' stroke-width='4' stroke='%23444444' fill='none' d='m24,44c11.0457,0 20,-8.9543 20,-20c0,-11.0457 -8.9543,-20 -20,-20c-11.0457,0 -20,8.9543 -20,20c0,11.0457 8.9543,20 20,20z'/%3E%3Cline stroke='%23444444' stroke-linecap='round' stroke-linejoin='round' id='svg_10' y2='28.5' x2='33' y1='28.5' x1='14' stroke-width='4' fill='none'/%3E%3Cline stroke='%23444444' stroke-linecap='round' stroke-linejoin='round' id='svg_11' y2='20.5' x2='33' y1='20.5' x1='14' stroke-width='4' fill='none'/%3E%3Cline stroke-linecap='round' stroke-linejoin='round' id='svg_12' y2='14.5' x2='20' y1='19.5' x1='14' stroke-width='4' stroke='%23444444' fill='none'/%3E%3Cline stroke='%23444444' stroke-linecap='round' stroke-linejoin='round' id='svg_13' y2='34.5' x2='24' y1='28.5' x1='33' stroke-width='4' fill='none'/%3E%3C/g%3E%3C/svg%3E")    no-repeat center;background-size:contain;width:100%;height:18px}#search-close-box{flex:0 0 29px;text-align:center;margin:auto;background:url("data:image/svg+xml;utf8,%3Csvg width='18' height='18' viewBox='0 0 48 48' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M24 44C35.0457 44 44 35.0457 44 24C44 12.9543 35.0457 4 24 4C12.9543 4 4 12.9543 4 24C4 35.0457 12.9543 44 24 44Z' fill='none' stroke='%23444444' stroke-width='4' stroke-linejoin='round'/%3E%3Cpath d='M29.6567 18.3432L18.343 29.6569' stroke='%23444444' stroke-width='4' stroke-linecap='round' stroke-linejoin='round'/%3E%3Cpath d='M18.3433 18.3432L29.657 29.6569' stroke='%23444444' stroke-width='4' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E")    no-repeat center;background-size:contain;width:100%;height:18px}#punk-search-app-box ul{display:flex;align-items:center;margin:0;padding:0;overflow:hidden;overflow-x:auto;list-style:none;white-space:nowrap;height:35px}#punk-search-app-box ul::-webkit-scrollbar{display:none !important}#punk-search-app-box li{margin-left:0px;display:inline-block;border-radius:2px;vertical-align:middle}#punk-search-app-box ul li a{display:block;color:#666666 !important;padding:8px;text-decoration:none;font-weight:bold;font-size:15px !important;font-family:Helvetica Neue, Helvetica, Arial, Microsoft Yahei, Hiragino Sans GB, Heiti SC, WenQuanYi Micro Hei, sans-serif}#punk-search-open-box{position:fixed;left:22px;bottom:64px;height:36px;width:36px;font-size:15px;text-align:center;padding:10px;border-radius:5px;z-index:9999998;background:url("data:image/svg+xml;utf8,%3Csvg width='48' height='48' xmlns='http://www.w3.org/2000/svg' stroke='null' style='vector-effect:non-scaling-stroke;' fill='none'%3E%3Cg id='Layer_1'%3E%3Ctitle%3ELayer 1%3C/title%3E%3Cpath stroke='%23000' id='svg_5' d='m1.97999,23.9675l0,0c0,-12.42641 10.0537,-22.5 22.45556,-22.5l0,0c5.95558,0 11.66724,2.37053 15.87848,6.5901c4.21123,4.21957 6.57708,9.94253 6.57708,15.9099l0,0c0,12.4264 -10.05369,22.5 -22.45555,22.5l0,0c-12.40186,0 -22.45556,-10.07359 -22.45556,-22.5zm22.45556,-22.5l0,45m-22.45556,-22.5l44.91111,0' stroke-width='0' fill='%23005fbf'/%3E%3Cpath stroke='%23000' id='svg_7' d='m13.95011,18.65388l0,0l0,-0.00203l0,0.00203zm0.00073,-0.00203l4.2148,5.84978l-4.21553,5.84775l1.54978,2.15123l5.76532,-8l-5.76532,-8l-1.54905,2.15123zm7.46847,13.70285l10.5308,0l0,-3.03889l-10.5308,0l0,3.03889zm3.16603,-6.33312l7.36476,0l0,-3.03889l-7.36476,0l0,3.03889zm-3.16603,-9.37302l0,3.04091l10.5308,0l0,-3.04091l-10.5308,0z' stroke-width='0' fill='%23ffffff'/%3E%3Cpath id='svg_8' d='m135.44834,59.25124l0,0l0,-0.00001l0,0.00001zm0.00004,-0.00001l0.23416,0.02887l-0.2342,0.02886l0.0861,0.01062l0.3203,-0.03948l-0.3203,-0.03948l-0.08606,0.01062zm0.41492,0.06762l0.58504,0l0,-0.015l-0.58504,0l0,0.015zm0.17589,-0.03125l0.40915,0l0,-0.015l-0.40915,0l0,0.015zm-0.17589,-0.04625l0,0.01501l0.58504,0l0,-0.01501l-0.58504,0z' stroke-width='0' stroke='%23000' fill='%23ffffff'/%3E%3C/g%3E%3C/svg%3E")    no-repeat center;background-size:contain}#punk-search-open-box,::after,::before{box-sizing:initial !important}#punk-search-jump-box h1{font-size:15px !important;color:#444444 !important;font-weight:bold;margin:7px 4px}#punk-search-jump-box ul{margin-left:0px;padding:0;overflow:hidden;overflow-x:auto;list-style:none}#punk-search-jump-box li{margin:4px;display:inline-block;vertical-align:middle;border-radius:2px;background-color:hsla(204, 48%, 14%, 0.1) !important}#punk-search-jump-box a{display:block;color:#263238 !important;padding:3px;margin:2px;font-size:14px;text-decoration:none;font-family:Helvetica Neue, Helvetica, Arial, Microsoft Yahei, Hiragino Sans GB, Heiti SC, WenQuanYi Micro Hei, sans-serif}.jump-sort-discription{margin:5px 4px}.punk-jump-sort-btn{background-color:#0026a69a;border:none;color:white;padding:8px 64px;text-align:center;text-decoration:none;display:inline-block;font-size:13px;margin:4px 5px;cursor:pointer;border-radius:4px;width:97%}body{margin-top:35px !important;position:relative !important}._search-sticky-bar{top:34px !important}._2Ldjm{top:34px !important}#punk-tablist{height:65px;margin-top:20px}#punk-tablist li{float:left;height:18px;background-color:hsla(0, 100%, 100%, 0) !important;color:#666666 !important;text-align:center;cursor:pointer;margin:4px 8px}#punk-tablist ul{height:39px}.punk-current{text-decoration:underline 3px #0026a69a;text-underline-offset:0.4em}.punk-current li{color:#0026a69a !important}.tab-content{margin-bottom:20px}`
  const cssNode = document.createElement("style")
  cssNode.textContent = SEARCH_BOX_CSS
  const searchBox = document.getElementById("punkjet-search-box")
  if (searchBox) {
    searchBox.appendChild(cssNode)
  } else {
    console.error('Element with ID "punkjet-search-box" not found.')
  }
}

const isMatchingUrl = () => {
  return searchUrlMap.some((urlItem) => {
    const regex = new RegExp(urlItem.matchUrl)
    const execResult = regex.exec(window.location.href)
    if (execResult) {
      for (let keyItem of urlItem.searchkeyName) {
        let url = new URL(window.location.href)
        const keywords = url.searchParams.get(keyItem)
        if (keywords) GM_setValue("key_words", keywords)
      }
    }
    return !!execResult
  })
}

const initializeSearch = () => {
  if (!GM_getValue("key_words")) return
  if (!GM_getValue("punk_setup_search")) {
    GM_setValue("punk_setup_search", punkDeafultMark)
  }
  addSearchBox()
  addJumpSearchBox()
  addOpenSearchBox()
  punkSearchClickFunction()
  addTabfunction()
  injectStyle()
  addUrlToElements()
  // 启用横向滚动功能
  enableHorizontalScroll()
}

const addUrlChangeEvent = () => {
  const overrideHistoryMethod = (type) => {
    const originalMethod = history[type]
    history[type] = function (...args) {
      const result = originalMethod.apply(this, args)
      window.dispatchEvent(new Event(type.toLowerCase()))
      window.dispatchEvent(new Event("urlchange"))
      return result
    }
  }

  overrideHistoryMethod("pushState")
  overrideHistoryMethod("replaceState")

  window.addEventListener("popstate", () => {
    window.dispatchEvent(new Event("urlchange"))
  })
}

;(function () {
  "use strict"
  if (isMatchingUrl()) {
    initializeSearch()
  }
  if (window.onurlchange === undefined) addUrlChangeEvent()
  window.addEventListener("urlchange", function () {
    if (isMatchingUrl()) {
      initializeSearch()
    }
  })
})()
