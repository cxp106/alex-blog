// ==UserScript==
// @name         自动复制 Swagger UI 中的 data-path
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  在 Swagger UI 中点击路径时自动复制 data-path 到剪贴板
// @author       You
// @match        http://172.16.10.32/swagger-ui/index.html
// @grant        GM_setClipboard
// @run-at       document-end
// ==/UserScript==

;(function () {
  "use strict"

  // 等待页面加载完成后绑定事件
  window.addEventListener("load", function () {
    setTimeout(() => {
      // 查找所有 .opblock-summary-path 元素
      const pathElements = document.querySelectorAll(".opblock-summary-path")

      // 如果找到了路径元素，给每个元素绑定点击事件
      if (pathElements.length > 0) {
        pathElements.forEach((element) => {
          console.log("正在绑定事件：", element) // 输出日志调试
          element.removeEventListener("click", copyDataPath) // 防止重复绑定
          element.addEventListener("click", copyDataPath)
        })
      } else {
        console.log("没有找到路径元素，请检查选择器是否正确！") // 输出日志调试
      }
    }, 1000) // 延迟 1 秒，确保所有内容都加载完成
  })

  // 复制 data-path 的函数
  function copyDataPath(event) {
    // 确保获取到包含 data-path 的父元素
    const targetElement = event.target.closest(".opblock-summary-path")

    // 获取 data-path 属性
    const dataPath = targetElement ? targetElement.getAttribute("data-path") : null
    console.log("点击元素的 data-path:", dataPath) // 输出日志调试

    if (dataPath) {
      GM_setClipboard(dataPath) // 复制到剪贴板
    } else {
      console.log("没有找到 data-path 属性！") // 输出日志调试
    }
  }
})()
