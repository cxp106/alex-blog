// ==UserScript==
// @name         小红书单篇笔记评论采集
// @namespace    cxp
// @author       镇沧澜
// @version      1.1.1
// @license      MIT
// @description  小红书单篇笔记评论采集
// @match        https://www.xiaohongshu.com/*
// @grant        GM_download
// ==/UserScript==

;(function () {
  "use strict"

  // 存储创建的DOM元素和事件监听器的引用，用于清理
  let createdElements = []
  let eventListeners = []
  let intervalIds = []
  let observers = []

  /**
   * @function cleanupResources
   * @description 清理所有创建的资源，包括DOM元素、事件监听器、定时器和观察器
   * @returns {void}
   */
  function cleanupResources() {
    console.log("清理资源...")

    // 清理DOM元素
    createdElements.forEach((element) => {
      if (element && element.parentNode) {
        element.parentNode.removeChild(element)
      }
    })
    createdElements = []

    // 清理事件监听器
    eventListeners.forEach(({ element, type, listener }) => {
      if (element) {
        element.removeEventListener(type, listener)
      }
    })
    eventListeners = []

    // 清理定时器
    intervalIds.forEach((id) => clearInterval(id))
    intervalIds = []

    // 清理观察器
    observers.forEach((obs) => obs.disconnect())
    observers = []

    console.log("资源清理完成")
  }

  /**
   * @function addElement
   * @description 创建DOM元素并添加到跟踪列表中
   * @param {HTMLElement} element - 要添加的DOM元素
   * @returns {HTMLElement} - 添加的元素
   */
  function addElement(element) {
    createdElements.push(element)
    return element
  }

  /**
   * @function addListener
   * @description 添加事件监听器并跟踪它
   * @param {HTMLElement} element - 要添加监听器的元素
   * @param {string} type - 事件类型
   * @param {Function} listener - 监听器函数
   * @returns {Function} - 添加的监听器函数
   */
  function addListener(element, type, listener) {
    const wrappedListener = (...args) => listener(...args)
    element.addEventListener(type, wrappedListener)
    eventListeners.push({ element, type, listener: wrappedListener })
    return wrappedListener
  }

  /**
   * @function addInterval
   * @description 创建定时器并跟踪它
   * @param {Function} callback - 回调函数
   * @param {number} delay - 延迟时间
   * @returns {number} - 定时器ID
   */
  function addInterval(callback, delay) {
    const id = setInterval(callback, delay)
    intervalIds.push(id)
    return id
  }

  /**
   * @function addObserver
   * @description 创建MutationObserver并跟踪它
   * @param {Function} callback - 回调函数
   * @returns {MutationObserver} - 创建的观察器
   */
  function addObserver(callback) {
    const observer = new MutationObserver(callback)
    observers.push(observer)
    return observer
  }

  /**
   * @function isExplorePage
   * @description 检查当前URL是否为explore页面
   * @returns {boolean} - 是否为explore页面
   */
  function isExplorePage() {
    return window.location.pathname.startsWith("/explore/")
  }

  /**
   * @function setupURLChangeDetection
   * @description 设置URL变化检测
   * @returns {void}
   */
  function setupURLChangeDetection() {
    // 监听history变化
    const originalPushState = history.pushState
    history.pushState = function () {
      originalPushState.apply(this, arguments)
      handleURLChange()
    }

    const originalReplaceState = history.replaceState
    history.replaceState = function () {
      originalReplaceState.apply(this, arguments)
      handleURLChange()
    }

    // 监听popstate事件
    window.addEventListener("popstate", handleURLChange)

    // 初始检查
    handleURLChange()
  }

  /**
   * @function handleURLChange
   * @description 处理URL变化事件
   * @returns {void}
   */
  /**
   * @function handleURLChange
   * @description 处理URL变化事件，根据当前页面是否为“explore”页面来初始化或清理资源。
   *              确保在离开“explore”页面时，所有相关的DOM元素、事件监听器、定时器和观察器都被正确销毁，
   *              并在重新进入时进行初始化，防止内存泄漏和DOM污染。
   */
  function handleURLChange() {
    if (isExplorePage()) {
      console.log("检测到explore页面，初始化采集功能...")
      cleanupResources() // 先清理可能存在的资源
      initUIAndListeners() // 重新初始化UI和监听器
    } else {
      console.log("离开explore页面，清理资源...")
      cleanupResources()
    }
  }

  /**
   * @function initUIAndListeners
   * @description 初始化UI元素和事件监听器，启动评论采集流程。
   * @returns {void}
   */
  function initUIAndListeners() {
    startCollectionProcess()
  }

  /**
   * @function sleep
   * @description 暂停指定毫秒数。
   * @param {number} ms - 暂停的毫秒数。
   * @returns {Promise<void>}
   */
  function sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms))
  }

  /**
   * @function startCollectionProcess
   * @description 启动评论采集流程，包括UI初始化、评论监听和自动滚动。
   * @returns {Promise<void>}
   */
  async function startCollectionProcess() {
    // 创建用于显示当前采集数量的元素
    const countElement = addElement(document.createElement("div"))
    countElement.textContent = "已采集评论数量：0"
    countElement.style.position = "fixed"
    countElement.style.bottom = "20px"
    countElement.style.right = "20px"
    countElement.style.zIndex = "9999"
    countElement.style.padding = "10px 20px"
    countElement.style.fontSize = "16px"
    countElement.style.backgroundColor = "#fff"
    countElement.style.border = "1px solid #000"
    countElement.style.borderRadius = "5px"
    document.body.appendChild(countElement)

    // 创建导出按钮
    const exportBtn = addElement(document.createElement("button"))
    exportBtn.textContent = "导出评论"
    exportBtn.style.position = "fixed"
    exportBtn.style.bottom = "60px"
    exportBtn.style.right = "20px"
    exportBtn.style.zIndex = "9999"
    exportBtn.style.backgroundColor = "#FF5733"
    exportBtn.style.color = "#fff"
    exportBtn.style.border = "none"
    exportBtn.style.borderRadius = "5px"
    exportBtn.style.padding = "10px 20px"
    exportBtn.style.fontSize = "16px"
    exportBtn.style.cursor = "pointer"
    addListener(exportBtn, "click", function () {
      exportToCSV(commentsData) // 导出到 CSV
    })
    document.body.appendChild(exportBtn)

    let commentsData = [] // 用于存储评论信息的数组

    // 确保评论区域加载后开始监视
    const observer = addObserver(() => {
      const commentsWrap = document.querySelector(".comments-container")
      if (commentsWrap) {
        observer.disconnect()
        // collectComments(); // 初始收集，后续由滚动循环触发
        // 移除原有的 setInterval，由滚动循环控制收集和更新
        // setInterval(() => {
        //   collectComments();
        //   countElement.textContent = `已采集评论数量：${commentsData.length}`;
        // }, 500);
      }
    })

    observer.observe(document.body, { childList: true, subtree: true })

    /**
     * @function collectComments
     * @description 收集页面上未被采集的评论。
     * @returns {void}
     */
    function collectComments() {
      const newComments = document.querySelectorAll(".comment-item:not(.already-collected)")
      newComments.forEach((comment) => {
        comment.classList.add("already-collected")
        const isSubComment = comment.classList.contains("comment-item-sub")
        const authorName = comment.querySelector(".author-wrapper .author .name")?.textContent.trim() || "匿名"
        let content = comment.querySelector(".content")?.textContent.trim() || ""
        if (isSubComment) {
          const repliedTo = content.match(/回复\s+([^:]+):/)?.[1]?.trim()
          content = repliedTo ? `回复${repliedTo}: ${content}` : `回复：${content}`
        }
        const date = comment.querySelector(".date")?.textContent.trim() || ""
        const likeCount = comment.querySelector(".like")?.textContent.trim() || "0"

        commentsData.push({ authorName, content, date, likeCount })
      })
    }

    /**
     * @function exportToCSV
     * @description 将采集到的评论数据导出为CSV文件。
     * @param {Array<Object>} data - 评论数据数组。
     * @returns {void}
     */
    function exportToCSV(data) {
      let csvContent = "\uFEFF" // 添加 BOM 头，确保在 Excel 中正确显示 UTF-8 编码的内容
      csvContent += "作者，内容，日期，点赞数\n"

      data.forEach((info) => {
        csvContent += `${info.authorName},${escapeSpecialCharacters(info.content.replace(/,/g, "，"))},${info.date},${info.likeCount}\n`
      })

      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
      const fileName = document.querySelector("#noteContainer #detail-title").textContent.trim() + ".csv"
      if (navigator.msSaveBlob) {
        // For IE 10 and above
        navigator.msSaveBlob(blob, fileName)
      } else {
        const link = document.createElement("a")
        if (link.download !== undefined) {
          const url = URL.createObjectURL(blob)
          link.setAttribute("href", url)
          link.setAttribute("download", fileName)
          link.style.visibility = "hidden"
          document.body.appendChild(link)
          link.click()
          document.body.removeChild(link)
        }
      }
    }

    /**
     * @function escapeSpecialCharacters
     * @description 转义CSV内容中的特殊字符。
     * @param {string} content - 待转义的字符串。
     * @returns {string}
     */
    function escapeSpecialCharacters(content) {
      return content.replace(/[\x00-\x1F\x7F-\x9F]/g, "") // 去除控制字符
    }

    // 自动滚动采集逻辑
    let lastCommentCount = 0
    while (true) {
      collectComments() // 每次循环都尝试收集新评论
      countElement.textContent = `已采集评论数量：${commentsData.length}`

      // 检查是否到达页面底部或评论加载完毕
      const commentsWrap = document.querySelector(".comments-container")
      if (commentsWrap) {
        commentsWrap.scrollTop = commentsWrap.scrollHeight
      } else {
        window.scrollTo(0, document.body.scrollHeight)
      }

      await sleep(1000) // 等待新内容加载

      // 如果评论数量不再增加，则认为已采集完毕
      //   if (commentsData.length === lastCommentCount) {
      //     console.log("评论采集完毕，总数：" + commentsData.length)
      //     break
      //   }
      lastCommentCount = commentsData.length

      const replyIcons = document.getElementsByClassName("reply icon-container")
      if (replyIcons.length === 0) {
        console.log("未找到评论回复图标，停止滚动。")
        break
      }
      // 检查是否出现“end-container”类，表示已无更多内容
      const endContainer = document.querySelector(".end-container")
      if (endContainer) {
        console.log("检测到end-container，停止采集。")
        break // 停止滚动
      }
      const lastReplyIcon = replyIcons[replyIcons.length - 1]
      lastReplyIcon.scrollIntoView({ behavior: "smooth", block: "end" })
      await sleep(100) // 暂停100毫秒
      collectComments() // 每次滚动后立即收集评论
      countElement.textContent = `已采集评论数量：${commentsData.length}` // 更新计数
      console.log(`已采集评论数量：${commentsData.length}`)
    }
    await sleep(2000) // 暂停2秒
    console.log("自动滚动采集完成。")
  }

  /**
   * @function initUIAndListeners
   * @description 初始化用户界面元素和事件监听器。
   * @returns {void}
   */
  function initUIAndListeners() {
    // 创建“开始采集”按钮
    const startBtn = document.createElement("button")
    startBtn.textContent = "开始采集"
    startBtn.style.position = "fixed"
    startBtn.style.bottom = "100px"
    startBtn.style.right = "20px"
    startBtn.style.zIndex = "9999"
    startBtn.style.backgroundColor = "#4CAF50" // 绿色
    startBtn.style.color = "#fff"
    startBtn.style.border = "none"
    startBtn.style.borderRadius = "5px"
    startBtn.style.padding = "10px 20px"
    startBtn.style.fontSize = "16px"
    startBtn.style.cursor = "pointer"
    const clickListener = async function () {
      startBtn.disabled = true // 禁用按钮，防止重复点击
      startBtn.textContent = "采集中..." // 更改按钮文本
      await startCollectionProcess()
      startBtn.textContent = "采集完成"
      startBtn.disabled = false // 采集完成后重新启用按钮
    }
    addListener(startBtn, "click", clickListener)
    document.body.appendChild(startBtn)
    addElement(startBtn) // 跟踪创建的元素
  }

  // 页面加载完成后设置URL变化检测
  window.addEventListener("load", setupURLChangeDetection)
})()
