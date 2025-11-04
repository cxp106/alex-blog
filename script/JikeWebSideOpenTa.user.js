// ==UserScript==
// @name         即刻助手
// @namespace    http://tampermonkey.net/
// @version      0.9.0
// @description  即刻网页版增强：自动加载更多、新标签页打开功能、禁用自动滚动、查看图片
// @author       千川汇海
// @match        https://*.okjike.com/*
// @grant        none
// @run-at       document-start
// ==/UserScript==

;(function () {
  "use strict"

  // --- 配置 ---
  const config = {
    mobileUrlPrefix: "https://m.okjike.com",
    desktopUrlPrefix: "https://web.okjike.com",
    urlReplaceMap: { originalPosts: "originalPost" },
    loadMoreButtonText: "加载更多",
    imagePreviewZIndex: 10000,
    imagePreviewMaxWidth: "80vw",
    imagePreviewMaxHeight: "80vh",
    imagePreviewImgMaxWidth: "360px",
    smallImageWidthThreshold: 60,
    smallImageHeightThreshold: 60,
    imagePreviewOffsetX: 20,
    imagePreviewOffsetY: 20,
    mutationObserverDelay: 100,
    imageObserverDelay: 300,
    ignoredImageClasses: ["sponsor-icon", "avatar", "emoji"],
    ignoredParentTags: ["AVATAR", "BUTTON"],
    ignoredParentClasses: ["avatar", "emoji"],
    imageSelector: "img",
    debug: false,
    retryCount: 3,
    retryDelay: 500,
  }

  // --- 辅助函数 ---
  const getConfig = (key) => config[key]

  const replaceUrl = (url, replacements) => {
    let newUrl = url
    for (const key in replacements) {
      newUrl = newUrl.replace(key, replacements[key])
    }
    return newUrl
  }

  // --- 功能 1：移动端链接重定向 ---
  const redirectMobileToDesktop = (url) => {
    if (url.startsWith(getConfig("mobileUrlPrefix"))) {
      const desktopUrl = replaceUrl(url.replace(getConfig("mobileUrlPrefix"), getConfig("desktopUrlPrefix")), getConfig("urlReplaceMap"))
      window.location.href = desktopUrl
    }
  }

  // --- 功能 2：新标签页打开功能 ---
  window.addEventListener(
    "click",
    function (event) {
      if (event.button !== 0 || event.ctrlKey || event.metaKey) {
        return
      }

      const linkElement = event.target

      event.preventDefault()
      event.stopPropagation()
      event.stopImmediatePropagation()

      const simulatedClick = new MouseEvent("click", {
        bubbles: true,
        cancelable: true,
        view: window,
        ctrlKey: true,
        metaKey: true,
      })
      linkElement.dispatchEvent(simulatedClick)

      return
    },
    { capture: true }
  )

  // --- 功能 3：自动点击“加载更多” ---
  const clickLoadMoreButton = (button) => {
    if (button && button.textContent.includes(getConfig("loadMoreButtonText"))) {
      button.click()
    }
  }

  const findAndClickLoadMoreButtons = () => {
    const buttons = document.querySelectorAll('button[role="button"]')
    buttons.forEach(clickLoadMoreButton)
  }

  // --- 功能 4：禁用 scrollIntoView 和 scrollTo ---
  const disableScrolling = () => {
    Element.prototype.scrollIntoView = function () {}
    Element.prototype.scrollTo = function () {}
    window.scrollTo = window.scroll = window.scrollBy = function () {}
  }

  // --- 功能 5: 图片预览 ---

  // 创建样式
  const createStyles = () => {
    // 检查是否已经添加了样式
    if (document.getElementById("jike-helper-styles")) {
      return
    }

    const style = document.createElement("style")
    style.id = "jike-helper-styles"
    style.textContent = `
            .jike-image-preview {
                position: fixed;
                z-index: ${getConfig("imagePreviewZIndex")};
                border: 2px solid #fff;
                border-radius: 8px;
                box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
                pointer-events: none;
                transition: all 0.2s ease;
                max-width: ${getConfig("imagePreviewMaxWidth")};
                max-height: ${getConfig("imagePreviewMaxHeight")};
                opacity: 0;
                transform: translateY(10px);
                background-color: #fff;
                overflow: hidden;
            }

            .jike-image-preview.show {
                opacity: 1;
                transform: translateY(0);
            }

            .jike-image-preview img {
                max-width: 100%;
                max-height: 100%;
                border-radius: 6px;
                display: block;
                object-fit: contain;
            }

            .jike-image-loading {
                padding: 20px;
                background: rgba(0, 0, 0, 0.7);
                color: white;
                border-radius: 6px;
                text-align: center;
                font-size: 14px;
            }

            .jike-image-error {
                padding: 20px;
                background: rgba(220, 0, 0, 0.7);
                color: white;
                border-radius: 6px;
                text-align: center;
                font-size: 14px;
            }

            /* 添加图片预览指示器 */
            img[data-preview="true"]:hover {
                cursor: zoom-in;
                outline: 2px solid rgba(0, 132, 255, 0.5);
                outline-offset: 2px;
            }
        `
    document.head.appendChild(style)
    log("已创建样式")
  }

  // 缓存预览容器
  let previewContainer = null
  // 用于跟踪鼠标是否在图片上
  let isMouseOverImage = false
  // 用于存储隐藏预览的定时器
  let hidePreviewTimer = null

  // 调试日志函数
  const log = (message, ...args) => {
    if (getConfig("debug")) {
      const timestamp = new Date().toLocaleTimeString()
      const prefix = `[即刻助手 ${timestamp}]`
      console.log(`${prefix} ${message}`, ...args)

      // 在调试模式下，对于路由相关的重要日志，添加到页面上的调试面板
      // (移除路由相关日志显示)
      // if (message.includes("路由") || message.includes("拦截")) {
      //     // ... (原调试面板代码，但不再特别处理路由日志)
      // }

      // 确保调试面板存在（保留用于其他调试信息）
      let debugPanel = document.getElementById("jike-helper-debug-panel")
      if (!debugPanel && document.body) {
        debugPanel = document.createElement("div")
        debugPanel.id = "jike-helper-debug-panel"
        debugPanel.style.cssText = `
            position: fixed;
            bottom: 10px;
            right: 10px;
            width: 300px;
            max-height: 200px;
            overflow-y: auto;
            background: rgba(0, 0, 0, 0.7);
            color: #fff;
            font-size: 12px;
            padding: 10px;
            border-radius: 5px;
            z-index: 99999;
            font-family: monospace;
            display: none; /* 初始隐藏 */
          `
        document.body.appendChild(debugPanel)

        // 添加标题和清除按钮
        const header = document.createElement("div")
        header.style.cssText = `
            display: flex;
            justify-content: space-between;
            margin-bottom: 5px;
            border-bottom: 1px solid #555;
            padding-bottom: 5px;
          `

        const title = document.createElement("span")
        title.textContent = "即刻助手调试面板"
        title.style.fontWeight = "bold"

        const clearBtn = document.createElement("span")
        clearBtn.textContent = "清除"
        clearBtn.style.cursor = "pointer"
        clearBtn.style.color = "#ff9800"
        clearBtn.onclick = () => {
          const logContainer = document.getElementById("jike-helper-debug-logs")
          if (logContainer) logContainer.innerHTML = ""
        }

        header.appendChild(title)
        header.appendChild(clearBtn)
        debugPanel.appendChild(header)

        // 添加日志容器
        const logContainer = document.createElement("div")
        logContainer.id = "jike-helper-debug-logs"
        debugPanel.appendChild(logContainer)
      }

      // 添加日志到面板
      if (debugPanel) {
        const logContainer = document.getElementById("jike-helper-debug-logs")
        if (logContainer) {
          const logEntry = document.createElement("div")
          logEntry.style.borderBottom = "1px dashed #555"
          logEntry.style.padding = "3px 0"
          logEntry.textContent = `${timestamp}: ${message}` // 显示所有调试日志
          logContainer.appendChild(logEntry)

          // 自动滚动到底部
          logContainer.scrollTop = logContainer.scrollHeight

          // 如果调试模式开启，则显示面板
          if (getConfig("debug")) {
            debugPanel.style.display = "block"
          }
        }
      }
    }
  }

  // 获取图片的真实 URL（处理懒加载等情况）
  const getImageRealUrl = (imgElement) => {
    // 优先使用原始图片 URL（如果存在）
    const originalUrl =
      imgElement.dataset.originalSrc ||
      imgElement.dataset.src ||
      imgElement.getAttribute("data-original") ||
      imgElement.getAttribute("data-original-src") ||
      imgElement.src

    // 如果 URL 是相对路径，转换为绝对路径
    if (originalUrl && originalUrl.startsWith("/")) {
      return new URL(originalUrl, window.location.origin).href
    }

    return originalUrl
  }

  // 检查图片是否有效
  const isValidImage = (imgElement) => {
    // 检查图片是否有效
    if (!imgElement || !imgElement.src) {
      log("无效图片元素或无 src 属性")
      return false
    }

    // 检查图片尺寸
    const imgWidth = imgElement.naturalWidth || imgElement.width
    const imgHeight = imgElement.naturalHeight || imgElement.height

    if (imgWidth < getConfig("smallImageWidthThreshold") || imgHeight < getConfig("smallImageHeightThreshold")) {
      log("图片尺寸过小", imgWidth, imgHeight)
      return false
    }

    // 检查图片类名
    if (getConfig("ignoredImageClasses").some((className) => imgElement.classList.contains(className))) {
      log("图片类名在忽略列表中", imgElement.className)
      return false
    }

    // 检查父元素标签
    if (imgElement.parentElement && getConfig("ignoredParentTags").includes(imgElement.parentElement.tagName)) {
      log("父元素标签在忽略列表中", imgElement.parentElement.tagName)
      return false
    }

    // 检查父元素类名
    if (
      imgElement.parentElement &&
      getConfig("ignoredParentClasses").some((className) => imgElement.parentElement.classList.contains(className))
    ) {
      log("父元素类名在忽略列表中", imgElement.parentElement.className)
      return false
    }

    return true
  }

  // 显示预览
  const showPreview = (imgElement, event) => {
    if (!isValidImage(imgElement)) {
      log("图片无效，不显示预览")
      return
    }

    // 标记鼠标在图片上
    isMouseOverImage = true

    // 获取图片 URL
    const originalUrl = getImageRealUrl(imgElement)
    if (!originalUrl) {
      log("无法获取图片 URL")
      return
    }

    log("显示预览", originalUrl)

    // 如果已经有预览容器，只更新内容和位置，不重新创建
    if (previewContainer) {
      // 清除隐藏定时器
      if (hidePreviewTimer) {
        clearTimeout(hidePreviewTimer)
        hidePreviewTimer = null
      }

      // 更新现有预览容器的内容
      previewContainer.innerHTML = '<div class="jike-image-loading">加载中...</div>'
      // 更新位置
      updatePreviewPosition(previewContainer, event)

      // 确保预览容器可见
      if (!previewContainer.classList.contains("show")) {
        previewContainer.classList.add("show")
      }
    } else {
      // 如果没有预览容器，则创建新的
      previewContainer = document.createElement("div")
      previewContainer.className = "jike-image-preview"
      previewContainer.innerHTML = '<div class="jike-image-loading">加载中...</div>'
      document.body.appendChild(previewContainer)

      // 强制重绘，确保过渡效果生效
      previewContainer.getBoundingClientRect()

      // 更新位置
      updatePreviewPosition(previewContainer, event)

      // 添加显示类，触发过渡动画
      setTimeout(() => {
        if (previewContainer) {
          previewContainer.classList.add("show")
        }
      }, 10)
    }

    // 加载图片（无论是新建还是更新预览容器都需要加载新图片）
    let retryCount = 0
    const loadImage = () => {
      const img = new Image()
      img.onload = () => {
        if (previewContainer) {
          previewContainer.innerHTML = ""
          previewContainer.appendChild(img)
          img.style.maxWidth = getConfig("imagePreviewImgMaxWidth")
          img.style.height = "auto" // 保持比例
          updatePreviewPosition(previewContainer, event)
          log("图片加载成功", originalUrl)
        }
      }
      img.onerror = () => {
        if (previewContainer) {
          if (retryCount < getConfig("retryCount")) {
            retryCount++
            log(`图片加载失败，重试 (${retryCount}/${getConfig("retryCount")})`)
            setTimeout(loadImage, getConfig("retryDelay"))
          } else {
            previewContainer.innerHTML = '<div class="jike-image-error">加载失败</div>'
            log("图片加载失败，已达到最大重试次数")
          }
        }
      }
      img.src = originalUrl
    }

    loadImage()
  }

  // 更新预览位置
  const updatePreviewPosition = (container, event) => {
    if (!container) return

    const mouseX = event.clientX
    const mouseY = event.clientY
    const viewportWidth = window.innerWidth
    const viewportHeight = window.innerHeight
    const offsetX = getConfig("imagePreviewOffsetX")
    const offsetY = getConfig("imagePreviewOffsetY")

    let left = mouseX + offsetX
    let top = mouseY + offsetY

    // 延迟获取，确保 container 已经渲染
    const previewWidth = container.offsetWidth || 200 // 默认宽度，避免初始定位问题
    const previewHeight = container.offsetHeight || 150 // 默认高度

    // 确保预览不超出视口
    if (left + previewWidth > viewportWidth - offsetX) {
      left = mouseX - previewWidth - offsetX
    }

    if (top + previewHeight > viewportHeight - offsetY) {
      top = viewportHeight - previewHeight - offsetY
    }

    // 确保预览不超出左侧和顶部边界
    if (left < offsetX) {
      left = offsetX
    }

    if (top < offsetY) {
      top = offsetY
    }

    container.style.left = `${left}px`
    container.style.top = `${top}px`
  }

  // 隐藏预览
  const hidePreview = (immediate = false) => {
    // 清除之前的定时器
    if (hidePreviewTimer) {
      clearTimeout(hidePreviewTimer)
      hidePreviewTimer = null
    }

    // 如果鼠标仍在图片上或者不需要立即隐藏，则不执行隐藏操作
    if (!immediate && isMouseOverImage) {
      log("鼠标仍在图片上，不隐藏预览")
      return
    }

    if (previewContainer) {
      // 使用过渡效果隐藏
      previewContainer.classList.remove("show")

      // 等待过渡完成后移除元素
      hidePreviewTimer = setTimeout(() => {
        if (previewContainer && previewContainer.parentNode) {
          document.body.removeChild(previewContainer)
          previewContainer = null
        }
        hidePreviewTimer = null
      }, 200) // 与 CSS 过渡时间匹配
    }
  }

  // 切换调试模式
  const toggleDebug = () => {
    config.debug = !config.debug
    const isDebugOn = config.debug
    log(`调试模式已${isDebugOn ? "开启" : "关闭"}`)

    // 处理调试面板的显示/隐藏
    const debugPanel = document.getElementById("jike-helper-debug-panel")
    if (debugPanel) {
      debugPanel.style.display = isDebugOn ? "block" : "none"
    }

    // 创建一个临时通知而不是使用 alert
    const notification = document.createElement("div")
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        left: 50%;
        transform: translateX(-50%);
        background: rgba(0, 0, 0, 0.8);
        color: white;
        padding: 10px 20px;
        border-radius: 4px;
        font-size: 14px;
        z-index: 99999;
        transition: opacity 0.3s ease;
      `
    notification.textContent = `即刻助手调试模式已${isDebugOn ? "开启" : "关闭"}`
    document.body.appendChild(notification)

    // 2 秒后自动消失
    setTimeout(() => {
      notification.style.opacity = 0
      setTimeout(() => notification.remove(), 300)
    }, 2000)

    // (移除了开启调试模式时检查路由状态的代码)

    return isDebugOn
  }

  // 添加快捷键切换调试模式 (Alt+Shift+D)
  document.addEventListener("keydown", (e) => {
    if (e.altKey && e.shiftKey && e.key === "D") {
      toggleDebug()
    }
  })

  // 设置图片预览
  const setupImagePreview = () => {
    log("设置图片预览")
    // 使用配置中的选择器，排除已处理的图片
    const selector = `${getConfig("imageSelector")}:not([data-preview])`
    const images = document.querySelectorAll(selector)

    // log(`找到 ${images.length} 张未处理的图片`) // 可以在需要时取消注释

    images.forEach((img) => {
      // 如果图片尚未完全加载，等待加载完成后再处理
      if (!img.complete) {
        // log("图片尚未加载完成，等待加载", img.src) // 可以在需要时取消注释
        img.addEventListener("load", () => {
          // 图片加载完成后，如果尚未处理，则进行处理
          if (!img.hasAttribute("data-preview")) {
            processImage(img)
          }
        })
        // 对于加载失败的图片，标记为已处理但不添加预览
        img.addEventListener("error", () => {
          img.setAttribute("data-preview", "error")
          // log("图片加载失败", img.src) // 可以在需要时取消注释
        })
        return
      }

      processImage(img)
    })
  }

  // 处理单个图片
  const processImage = (img) => {
    // 再次检查图片是否有效，避免重复处理
    if (img.hasAttribute("data-preview")) {
      return
    }

    // 使用 isValidImage 函数检查图片是否符合预览条件
    if (!isValidImage(img)) {
      // 标记为已处理但不添加预览
      img.setAttribute("data-preview", "ignored")
      return
    }

    // 标记为已处理并添加预览事件
    img.setAttribute("data-preview", "true")
    img.addEventListener("mouseenter", (event) => {
      showPreview(img, event)
    })
    img.addEventListener("mouseleave", () => {
      // 标记鼠标离开图片
      isMouseOverImage = false
      // 延迟隐藏预览，给切换到其他图片的操作留出时间
      setTimeout(() => {
        if (!isMouseOverImage) {
          hidePreview()
        }
      }, 50) // 短暂延迟，足够检测鼠标是否移动到了另一张图片上
    })
    // 添加鼠标移动事件，更新预览位置
    img.addEventListener("mousemove", (event) => {
      if (previewContainer && isMouseOverImage) {
        updatePreviewPosition(previewContainer, event)
      }
    })
    // log("已为图片添加预览功能", getImageRealUrl(img)) // 可以在需要时取消注释
  }

  // --- 主逻辑 ---

  // 等待页面内容加载完毕
  const waitForPageLoad = () => {
    let initialSetupDone = false

    const observer = new MutationObserver((mutations, obs) => {
      // nextjs 加载完毕
      if (!initialSetupDone && document.readyState !== "loading") {
        log("页面加载完成，执行初始设置")

        // 禁用滚动
        disableScrolling()
        log("已禁用滚动")

        // 查找并加载更多 (首次)
        findAndClickLoadMoreButtons()
        log("已执行首次“加载更多”点击")

        initialSetupDone = true

        // 初始设置完成后断开此观察器
        log("初始设置完成，断开 DOM 监听器 (waitForPageLoad)")
        obs.disconnect()
      }
    })

    // 观察 body 的子节点变化，足以检测到主要内容加载
    const config = { childList: true, subtree: true }
    observer.observe(document.body || document.documentElement, config) // 兼容 body 未加载的情况

    // 添加一个备用检查，以防 MutationObserver 因某些原因未能触发
    const readyStateCheckInterval = setInterval(() => {
      if (!initialSetupDone && document.readyState !== "loading") {
        log("页面加载完成 (备用检查)，执行初始设置")
        observer.disconnect() // 停止观察
        clearInterval(readyStateCheckInterval) // 停止定时器

        // 禁用滚动
        disableScrolling()
        log("已禁用滚动")

        // 查找并加载更多 (首次)
        findAndClickLoadMoreButtons()
        log("已执行首次“加载更多”点击")

        initialSetupDone = true
      }
    }, 200)

    // MutationObserver 用于持续监控“加载更多”按钮
    const observerForLoadMore = new MutationObserver((mutations) => {
      clearTimeout(observerForLoadMore.timeout)
      observerForLoadMore.timeout = setTimeout(() => {
        findAndClickLoadMoreButtons()
      }, getConfig("mutationObserverDelay"))
    })

    // 延迟启动 observerForLoadMore，等待初始内容加载
    setTimeout(() => {
      log("启动持续的“加载更多”按钮监听器")
      observerForLoadMore.observe(document.body || document.documentElement, config)
    }, 500) // 延迟 500ms 启动
  }

  // --- 初始化 ---
  const init = () => {
    log("初始化即刻助手")
    createStyles()
    setupImagePreview()

    // 监听鼠标移动，更新预览位置 (如果预览容器存在)
    document.addEventListener("mousemove", (event) => {
      if (previewContainer) {
        updatePreviewPosition(previewContainer, event)
      }
    })

    // 监听 DOM 变化，设置新的图片预览（优化版）
    const imageObserver = new MutationObserver((mutations) => {
      // 使用防抖处理，避免频繁调用
      clearTimeout(imageObserver.timeout)
      imageObserver.timeout = setTimeout(() => {
        let hasNewImages = false

        // 检查是否有新图片元素被添加或 src 属性改变
        mutations.forEach((mutation) => {
          if (mutation.type === "childList") {
            mutation.addedNodes.forEach((node) => {
              // 检查添加的节点是否为图片或包含图片
              if (node.nodeName === "IMG") {
                hasNewImages = true
              } else if (node.querySelectorAll) {
                const images = node.querySelectorAll(getConfig("imageSelector"))
                if (images.length > 0) {
                  hasNewImages = true
                }
              }
            })
          } else if (mutation.type === "attributes") {
            // 如果 src 等属性发生变化，也视为可能有新图片需要处理
            if (mutation.target.nodeName === "IMG") {
              hasNewImages = true
            }
          }
        })

        // 只有在确实有新图片或属性变化时才调用 setupImagePreview
        if (hasNewImages) {
          // log("检测到 DOM 变化，可能需要更新图片预览") // 可以在需要时取消注释
          setupImagePreview()
        }
      }, getConfig("imageObserverDelay"))
    })

    // 使用更精细的配置监听 DOM 变化
    imageObserver.observe(document.body || document.documentElement, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ["src", "data-src", "data-original", "data-original-src"],
    })

    // 定期检查是否有新图片（作为补充，减少检查频率）
    setInterval(() => {
      setupImagePreview()
    }, 5000) // 调整为 5 秒
  }

  // --- 统一入口 ---
  redirectMobileToDesktop(window.location.href) // 页面加载时立即执行
  waitForPageLoad() // 等待页面加载并执行初始操作

  if (document.readyState === "loading") {
    // 如果脚本在 DOMContentLoaded 之前运行
    document.addEventListener("DOMContentLoaded", init)
  } else {
    // 如果脚本在 DOMContentLoaded 之后运行
    init()
  }
})()

