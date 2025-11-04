// ==UserScript==
// @name         VS Marketplace Direct .vsix Downloader
// @namespace    http://tampermonkey.net/
// @version      3.5.0
// @description  VS Marketplace 直接 .vsix 下载器，在原本的下载按钮前新增一个可以下载 vsix 文件的下载按钮，下载后可以提供给其他 IDE 安装。
// @author       千川汇海
// @match        https://marketplace.visualstudio.com/items*
// @icon         https://visualstudio.microsoft.com/favicon.ico
// @run-at       document-start
// @grant        none
// @license      MIT
// ==/UserScript==

;(function () {
  "use strict"

  // --- 配置常量 ---
  const CONFIG = {
    // 脚本版本和日志前缀
    VERSION: "3.5.0",
    LOG_PREFIX: "📦 VSIX-DL",
    // 按钮相关配置
    BUTTON: {
      ID: "direct-vsix-download-button-script-999",
      TEXT: "🚀 Direct .vsix Download",
      COLORS: {
        BASE: "#006400",
        HOVER: "#007d00",
      },
    },
    // URL 相关配置
    URL: {
      // 2023 年 12 月验证有效，VS Marketplace 使用'/stats'路径触发下载
      TARGET_PATH_SUFFIX: "/stats",
      REPLACEMENT_PATH: "/vspackage",
      REQUIRED_PATH_SEGMENT: "/publishers/",
    },
    // DOM 选择器 - 2023 年 12 月验证有效
    SELECTORS: [
      // 最新的 VS Marketplace 布局 (2023)
      'div[data-testid="action-buttons-container"]', // 首选：使用 data-testid 属性（最稳定）
      "div.item-details-control-container", // 次选：控制容器
      "div.item-details-header .ux-item-action div div", // 备选：头部操作区
      // 旧版布局选择器（保留向后兼容）
      "#section-banner .ux-item-action div div",
      "td.item-header .ux-item-action div div",
      "#section-banner .installButtonContainer",
    ],
    // 调试级别：0=关闭，1=错误，2=警告，3=信息，4=详细
    DEBUG_LEVEL: 3,
  }

  // --- 日志工具 ---
  const Logger = {
    error: (message, ...args) => {
      if (CONFIG.DEBUG_LEVEL >= 1) console.error(`${CONFIG.LOG_PREFIX} ❌ ${message}`, ...args)
    },
    warn: (message, ...args) => {
      if (CONFIG.DEBUG_LEVEL >= 2) console.warn(`${CONFIG.LOG_PREFIX} ⚠️ ${message}`, ...args)
    },
    info: (message, ...args) => {
      if (CONFIG.DEBUG_LEVEL >= 3) console.log(`${CONFIG.LOG_PREFIX} ℹ️ ${message}`, ...args)
    },
    debug: (message, ...args) => {
      if (CONFIG.DEBUG_LEVEL >= 4) console.log(`${CONFIG.LOG_PREFIX} 🔍 ${message}`, ...args)
    },
    success: (message, ...args) => {
      if (CONFIG.DEBUG_LEVEL >= 3) console.log(`${CONFIG.LOG_PREFIX} ✅ ${message}`, ...args)
    },
  }

  // 初始化状态变量
  let state = {
    lastDetectedDownloadUrl: null,
    observer: null,
    buttonContainerFound: false,
    initialized: false,
  }

  Logger.info(`初始化 v${CONFIG.VERSION}...`)

  // --- 核心功能：创建或更新下载按钮 ---
  function createOrUpdateDownloadButton(downloadUrl) {
    if (!downloadUrl) {
      Logger.error("无法创建按钮：下载 URL 为空")
      return
    }

    Logger.info(`准备下载按钮：${downloadUrl}`)
    state.lastDetectedDownloadUrl = downloadUrl

    let container = findTargetContainer()
    if (!container) {
      Logger.warn("按钮容器未找到，延迟创建按钮。观察者应该处于活动状态。")
      if (!state.observer) {
        observeForContainer()
      }
      return
    }

    state.buttonContainerFound = true
    if (state.observer) {
      state.observer.disconnect()
      state.observer = null
      Logger.debug("MutationObserver 已停止（容器已找到）")
    }

    let button = document.getElementById(CONFIG.BUTTON.ID)
    if (!button) {
      Logger.info("创建新下载按钮")
      button = document.createElement("a")
      button.id = CONFIG.BUTTON.ID
      button.textContent = CONFIG.BUTTON.TEXT

      // 应用按钮样式
      Object.assign(button.style, {
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "0 16px",
        height: "32px",
        marginRight: "10px",
        backgroundColor: CONFIG.BUTTON.COLORS.BASE,
        color: "white",
        border: "none",
        borderRadius: "3px",
        fontSize: "14px",
        fontWeight: "600",
        lineHeight: "32px",
        textDecoration: "none",
        cursor: "pointer",
        transition: "background-color 0.2s ease",
      })

      button.onmouseover = () => (button.style.backgroundColor = CONFIG.BUTTON.COLORS.HOVER)
      button.onmouseout = () => (button.style.backgroundColor = CONFIG.BUTTON.COLORS.BASE)
      button.target = "_blank"
      button.rel = "noopener noreferrer"

      // 智能插入位置
      if (container.firstChild) {
        container.insertBefore(button, container.firstChild)
        Logger.debug("按钮已插入到容器第一个子元素之前")
      } else {
        container.appendChild(button)
        Logger.debug("按钮已添加到空容器中")
      }
    } else {
      Logger.debug("更新现有下载按钮 URL")
    }

    // 确保 URL 正确转换
    button.href = downloadUrl.replace("extensions", "vsextensions")
    setDownloadFilename(button, downloadUrl)
    Logger.success(`按钮已就绪！URL: ${button.href}, 文件名：${button.download}`)
  }

  // --- 辅助：设置下载文件名 ---
  function setDownloadFilename(button, downloadUrl) {
    try {
      const urlObj = new URL(downloadUrl)
      const pathParts = urlObj.pathname.split("/").filter((part) => part.length > 0)
      const vspackageIndex = pathParts.indexOf("vspackage")

      // 智能提取发布者、扩展名和版本
      if (vspackageIndex > 3 && pathParts[vspackageIndex - 4] === "publishers") {
        const publisher = pathParts[vspackageIndex - 3]
        const extension = pathParts[vspackageIndex - 2]
        const version = pathParts[vspackageIndex - 1]

        if (publisher && extension && version) {
          button.download = `${publisher}.${extension}-${version}.vsix`
          Logger.debug(`智能文件名设置成功：${button.download}`)
          return
        } else {
          Logger.warn(`无法提取智能文件名所需的所有部分：P=${publisher}, E=${extension}, V=${version}`)
        }
      } else {
        Logger.debug(`文件名提取的路径结构不符合预期：${urlObj.pathname}`)
      }
    } catch (e) {
      Logger.error("解析下载 URL 以获取文件名时出错：", e, "URL:", downloadUrl)
    }

    // 后备文件名逻辑
    const fallbackName = downloadUrl.substring(downloadUrl.lastIndexOf("/") + 1) || "extension"
    button.download = `${fallbackName.replace(/[^a-zA-Z0-9._-]/g, "_")}.vsix`
    Logger.debug(`使用后备文件名：${button.download}`)
  }

  // --- 辅助：查找按钮容器 ---
  function findTargetContainer() {
    Logger.debug(`使用${CONFIG.SELECTORS.length}个选择器搜索按钮容器...`)

    for (let i = 0; i < CONFIG.SELECTORS.length; i++) {
      const selector = CONFIG.SELECTORS[i]
      try {
        const container = document.querySelector(selector)
        if (container) {
          Logger.success(`找到容器，使用选择器 #${i + 1}: "${selector}"`)
          return container
        }
      } catch (e) {
        Logger.error(`查询选择器"${selector}"时出错:`, e)
      }
    }

    Logger.debug("未找到合适的容器")
    return null
  }

  // --- 统一处理找到的目标 URL ---
  function handleFoundUrl(originalUrl) {
    if (!originalUrl) {
      Logger.warn("处理空URL，已忽略")
      return
    }

    Logger.info(`发现潜在目标URL: ${originalUrl}`)
    let absoluteUrl

    try {
      const base = document.baseURI || window.location.origin
      absoluteUrl = new URL(originalUrl, base).toString()
      Logger.debug(`解析为绝对URL: ${absoluteUrl}`)
    } catch (e) {
      Logger.error(`无法从${originalUrl}构造绝对URL:`, e)
      return
    }

    try {
      const urlObj = new URL(absoluteUrl)

      // 改进的URL检测逻辑 - 更灵活地处理各种URL格式
      if (urlObj.pathname.includes(CONFIG.URL.REQUIRED_PATH_SEGMENT) && absoluteUrl.includes(CONFIG.URL.TARGET_PATH_SUFFIX)) {
        Logger.success(`URL符合下载条件`)

        // 构建下载URL
        urlObj.pathname = urlObj.pathname.replace(CONFIG.URL.TARGET_PATH_SUFFIX, CONFIG.URL.REPLACEMENT_PATH)
        urlObj.search = "" // 移除查询参数
        urlObj.hash = "" // 移除哈希
        const downloadUrl = urlObj.toString()

        Logger.info(`转换为下载URL: ${downloadUrl}`)

        // 根据DOM状态决定按钮创建时机
        if (document.readyState === "loading") {
          Logger.debug("DOM未就绪，延迟按钮创建到DOMContentLoaded")
          window.addEventListener("DOMContentLoaded", () => createOrUpdateDownloadButton(downloadUrl), { once: true })
        } else {
          Logger.debug("DOM 已就绪，立即尝试创建/更新按钮")
          createOrUpdateDownloadButton(downloadUrl)
        }
      } else {
        Logger.debug(`URL 不符合条件 (缺少必要路径段或目标后缀)`)
      }
    } catch (e) {
      Logger.error("处理解析后的绝对 URL 时出错：", e, "URL:", absoluteUrl)
    }
  }

  // --- 拦截 XMLHttpRequest ---
  function patchXMLHttpRequest() {
    const originalOpen = XMLHttpRequest.prototype.open
    const originalSend = XMLHttpRequest.prototype.send

    XMLHttpRequest.prototype.open = function (method, url /*, ...args */) {
      try {
        this._requestURL = typeof url === "string" ? url : url ? url.toString() : ""
        this._requestMethod = method

        // 预筛选潜在目标请求
        this._isPotentialTarget =
          this._requestURL.includes(CONFIG.URL.REQUIRED_PATH_SEGMENT) && this._requestURL.includes(CONFIG.URL.TARGET_PATH_SUFFIX)

        if (this._isPotentialTarget) {
          Logger.debug(`XHR 打开 (潜在目标): ${method} ${this._requestURL}`)
        }
      } catch (e) {
        Logger.error("XHR.open 补丁中出错：", e)
      }
      return originalOpen.apply(this, arguments)
    }

    XMLHttpRequest.prototype.send = function (body) {
      if (this._isPotentialTarget) {
        const xhr = this
        const requestUrl = xhr._requestURL
        Logger.debug(`XHR 发送 (潜在目标): ${xhr._requestMethod} ${requestUrl}`)

        const readyStateHandler = function () {
          if (xhr.readyState === 4) {
            xhr.removeEventListener("readystatechange", readyStateHandler)
            if (xhr.status >= 200 && xhr.status < 300) {
              Logger.debug(`XHR成功(潜在目标): ${xhr.status} ${xhr._requestMethod} ${requestUrl}`)

              // 再次确认URL符合条件再处理
              if (
                requestUrl &&
                requestUrl.includes(CONFIG.URL.REQUIRED_PATH_SEGMENT) &&
                requestUrl.includes(CONFIG.URL.TARGET_PATH_SUFFIX)
              ) {
                handleFoundUrl(requestUrl)
              }
            } else if (xhr.status > 0) {
              Logger.warn(`XHR 完成但状态异常 (${xhr.status}): ${xhr._requestMethod} ${requestUrl}`)
            }
          }
        }
        this.addEventListener("readystatechange", readyStateHandler)
      }
      return originalSend.apply(this, arguments)
    }

    Logger.debug("XMLHttpRequest 已补丁化")
  }

  // --- 拦截 Fetch API ---
  function patchFetchAPI() {
    const originalFetch = window.fetch

    window.fetch = async function (...args) {
      let originalUrl = ""
      let method = "GET"

      try {
        const requestInfo = args[0]
        if (typeof requestInfo === "string") {
          originalUrl = requestInfo
        } else if (requestInfo instanceof Request) {
          originalUrl = requestInfo.url
          method = requestInfo.method
        } else if (requestInfo && typeof requestInfo.url === "string") {
          originalUrl = requestInfo.url
          method = requestInfo.method || "GET"
        }

        // 预筛选潜在目标请求
        let isTargetFetch =
          originalUrl && originalUrl.includes(CONFIG.URL.REQUIRED_PATH_SEGMENT) && originalUrl.includes(CONFIG.URL.TARGET_PATH_SUFFIX)

        if (isTargetFetch) {
          Logger.debug(`Fetch 请求 (目标匹配): ${method} ${originalUrl}`)
        }

        const response = await originalFetch.apply(this, args)

        // 只处理匹配的成功响应
        if (isTargetFetch && response.ok) {
          Logger.debug(`Fetch 成功 (目标匹配): ${response.status} ${method} ${originalUrl}`)
          handleFoundUrl(originalUrl)
        }

        return response
      } catch (error) {
        let urlForLog = args[0] && typeof args[0] === "string" ? args[0] : args[0] && args[0].url ? args[0].url : "[未知 URL]"
        Logger.error(`Fetch 错误 ${urlForLog}:`, error)
        throw error
      }
    }

    Logger.debug("Fetch API 已补丁化")
  }

  // --- MutationObserver 逻辑 ---
  function observeForContainer() {
    if (state.observer) {
      Logger.debug("MutationObserver 已经处于活动状态")
      return
    }

    if (state.buttonContainerFound) {
      Logger.debug("按钮容器已找到，无需观察者")
      return
    }

    const targetNode = document.body || document.documentElement
    if (!targetNode) {
      Logger.debug("Body 未就绪，延迟观察者设置到 DOMContentLoaded")
      window.addEventListener("DOMContentLoaded", observeForContainer, { once: true })
      return
    }

    // 使用防抖优化的回调函数
    let debounceTimer = null
    const callback = function (mutationsList, obs) {
      if (state.buttonContainerFound) {
        obs.disconnect()
        state.observer = null
        Logger.debug("MutationObserver 已停止 (容器在其他地方找到)")
        return
      }

      // 防抖处理，避免频繁检查
      clearTimeout(debounceTimer)
      debounceTimer = setTimeout(() => {
        const container = findTargetContainer()
        if (container) {
          Logger.success("MutationObserver 找到了按钮容器！")
          state.buttonContainerFound = true
          obs.disconnect()
          state.observer = null

          if (state.lastDetectedDownloadUrl) {
            Logger.debug("使用已存储的 URL 创建按钮")
            createOrUpdateDownloadButton(state.lastDetectedDownloadUrl)
          } else {
            Logger.debug("观察者找到容器，但尚未检测到下载 URL")
          }
        }
      }, 100) // 100ms 防抖延迟
    }

    state.observer = new MutationObserver(callback)
    state.observer.observe(targetNode, { childList: true, subtree: true })
    Logger.debug("MutationObserver 开始监视按钮容器出现")
  }

  // --- 初始化 ---
  function initialize() {
    if (state.initialized) {
      return
    }

    state.initialized = true
    Logger.info("初始化检查...")

    // 补丁化网络请求
    patchXMLHttpRequest()
    patchFetchAPI()

    // 检查容器
    const container = findTargetContainer()
    if (container) {
      state.buttonContainerFound = true
      Logger.success("初始检查立即找到容器")

      if (state.lastDetectedDownloadUrl) {
        Logger.debug("URL 已检测到，立即创建/更新按钮")
        createOrUpdateDownloadButton(state.lastDetectedDownloadUrl)
      } else {
        Logger.debug("容器已找到，但尚未检测到下载 URL")
      }
    } else {
      Logger.debug("初始检查未找到容器，启动观察者")
      observeForContainer()
    }

    // 设置 adVerified（保持不变）
    try {
      localStorage.setItem("adVerified", new Date().toISOString().split("T")[0])
      Logger.debug("adVerified 设置为：", localStorage.getItem("adVerified"))
    } catch (e) {
      Logger.warn("无法在 localStorage 中设置 adVerified(可能已禁用或处于隐私模式):", e)
    }
  }

  // 根据文档状态决定初始化时机
  if (document.readyState === "loading") {
    Logger.debug("文档加载中，等待 DOMContentLoaded 初始化")
    window.addEventListener("DOMContentLoaded", initialize, { once: true })
  } else {
    Logger.debug("文档已就绪，立即初始化")
    initialize()
  }

  Logger.success(`VS Marketplace Direct Downloader v${CONFIG.VERSION} 已就绪 💯🛡️✨`)
})()
