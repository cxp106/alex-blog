// ==UserScript==
// @name         飞书/Lark 超级增强 (Feishu/Lark Supercharge)
// @namespace    https://github.com/Stendhal-Works
// @version      1.1
// @description  以最优雅、最无痕的方式，解除飞书/Lark文档的复制和右键限制。一个真正的“隐形守护者”。
// @author       镇沧澜
// @match        *://*.feishu.cn/*
// @match        *://*.larkoffice.com/*
// @grant        GM_addStyle
// @run-at       document-start
// @license      MIT
// ==/UserScript==

;(function () {
  "use strict"

  // --- 配置区域 ---
  const PERMISSION_API_PATH = "/space/api/suite/permission/document/actions/state/"
  const UNLOCK_STYLE = `
        * {
            user-select: auto !important;
            -webkit-user-select: auto !important;
        }
    `

  // --- 核心逻辑 ---

  /**
   * 核心权限修改器
   */
  const permissionPatcher = (responseText) => {
    try {
      const data = JSON.parse(responseText)
      if (data && data.data && data.data.actions && data.data.actions.copy !== 1) {
        console.log("[Feishu Supercharge] Detected and patched copy permission via network.")
        data.data.actions.copy = 1
        return JSON.stringify(data)
      }
    } catch (e) {
      /* 不是合法的JSON，忽略 */
    }
    return responseText
  }

  /**
   * 【v1.1 新增】精准事件拦截器
   * 在捕获阶段运行，抢在飞书自己的监听器之前，并立即停止事件传播。
   * 这可以有效阻止飞书的JS代码禁用复制事件。
   */
  document.addEventListener(
    "copy",
    (event) => {
      console.log("[Feishu Supercharge] Intercepted copy event, preventing blockage.")
      event.stopImmediatePropagation()
    },
    { capture: true }
  )

  /**
   * 劫持 window.fetch
   */
  const originalFetch = window.fetch
  window.fetch = function (url, config) {
    if (typeof url === "string" && url.includes(PERMISSION_API_PATH)) {
      return originalFetch(url, config).then((response) => {
        const clonedResponse = response.clone()
        response.json = () => clonedResponse.json().then((data) => JSON.parse(permissionPatcher(JSON.stringify(data))))
        response.text = () => clonedResponse.text().then((text) => permissionPatcher(text))
        return response
      })
    }
    return originalFetch(url, config)
  }

  /**
   * 劫持 XMLHttpRequest
   */
  const originalOpen = XMLHttpRequest.prototype.open
  XMLHttpRequest.prototype.open = function (method, url, ...args) {
    if (typeof url === "string" && url.includes(PERMISSION_API_PATH)) {
      this._isTargetRequest = true
    }
    originalOpen.apply(this, [method, url, ...args])
  }

  const responseTextDescriptor = Object.getOwnPropertyDescriptor(XMLHttpRequest.prototype, "responseText")
  Object.defineProperty(XMLHttpRequest.prototype, "responseText", {
    get: function () {
      const originalValue = responseTextDescriptor.get.call(this)
      if (this._isTargetRequest) {
        return permissionPatcher(originalValue)
      }
      return originalValue
    },
    configurable: true,
  })

  const responseDescriptor = Object.getOwnPropertyDescriptor(XMLHttpRequest.prototype, "response")
  Object.defineProperty(XMLHttpRequest.prototype, "response", {
    get: function () {
      const originalValue = responseDescriptor.get.call(this)
      if (this._isTargetRequest && typeof originalValue === "string") {
        return permissionPatcher(originalValue)
      }
      return originalValue
    },
    configurable: true,
  })

  /**
   * 主函数：在脚本开始时立即执行
   */
  function main() {
    console.log("[Feishu Supercharge by Stendhal v1.1] Initialized. The document is now truly free.")
    GM_addStyle(UNLOCK_STYLE)
  }

  main()
})()
