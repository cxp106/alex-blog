// ==UserScript==
// @name         手机靓号高亮
// @namespace    http://tampermonkey.net/
// @version      0.7
// @description  高亮显示网页中的手机靓号
// @author       You
// @match        *://i.68.gd.cn/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=68.gd.cn
// @grant        none
// ==/UserScript==

;(function () {
  "use strict"

  // 靓号规则 (分类 + 优先级)
  const prettyNumberRules = [
    // 重复型 (优先级高)
    { pattern: /(\d)\1{5,}/, priority: 1 }, // 6 位及以上重复数字，如 888888
    { pattern: /(\d)\1{4,}/, priority: 2 }, // 5 位重复数字，如 88888
    { pattern: /(\d)\1{3,}/, priority: 3 }, // 4 位重复数字，如 8888
    { pattern: /(\d)\1{2,}/, priority: 4 }, //ABABAB
    { pattern: /(\d)(\d)\1\2\1\2/, priority: 4 }, // AABBCC
    { pattern: /(\d)\1(\d)\2/, priority: 5 }, // AABB
    { pattern: /(\d)(\d)\1\2/, priority: 4 },
    { pattern: /(\d)\1{1,}/, priority: 6 }, // 3 位重复  如 888

    // 顺序型 (优先级中)
    { pattern: /123456|234567|345678|456789|987654|876543|765432|654321/, priority: 7 }, // 6 位顺子
    { pattern: /12345|23456|34567|45678|56789|98765|87654|76543|65432|54321/, priority: 8 }, // 5 位顺子
    { pattern: /1234|2345|3456|4567|5678|6789|9876|8765|7654|6543|5432|4321/, priority: 9 }, // 4 位顺子
    { pattern: /123|234|345|456|567|678|789|987|876|765|654|543|432|321/, priority: 10 }, // 3 位顺子

    // 对称型 (优先级中)
    { pattern: /(\d)(\d)\2\1/, priority: 11 }, // ABBA
    { pattern: /(\d)(\d)(\d)\3\2\1/, priority: 11 }, // ABC CBA
    { pattern: /(\d)(\d)\d\2\1/, priority: 11 }, // ABxBA

    // 特殊组合型 (优先级低)
    { pattern: /520|1314|5201314|1314520/, priority: 12 }, // 常用组合
    { pattern: /666|888|999/, priority: 13 }, // 常见组合
    { pattern: /0604|0930/, priority: 14 }, // (示例) 生日、日期 (需要进一步细化)
  ]

  const originalOpen = XMLHttpRequest.prototype.open
  XMLHttpRequest.prototype.open = function (method, url) {
    if (url.indexOf("api/Card/get_pool") > -1) {
      let good = document.querySelector(".good")
      if (!good) {
        good = document.createElement("div")
        good.className = "good"
        // 主要的样式修改在这里
        good.style.cssText = `
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          height: 20%;
          z-index: 9999;
          background: #fff;
          color: #333;
          overflow: auto;
          display: flex; /* 使用 Flexbox 布局 */
          flex-wrap: wrap; /* 允许换行 */
          border-bottom: 2px solid #ddd; /* 添加底部边框 */
        `
        document.body.appendChild(good)
      } else {
        good.innerHTML = ""
      }

      this.addEventListener("load", function () {
        const data = JSON.parse(this.responseText)
        for (const item of data.list) {
          let highlightedItem = item
          const sortedRules = prettyNumberRules.sort((a, b) => a.priority - b.priority)
          for (const rule of sortedRules) {
            const regex = new RegExp(rule.pattern, "g")
            if (regex.test(highlightedItem)) {
              highlightedItem = highlightedItem.replace(regex, "<span style='color:red'>$&</span>")
            }
          }

          const div = document.createElement("div")
          div.className = "good-number"
          // 每个号码的样式
          div.style.cssText = `
            width: 50%; /* 每个号码占 50% 宽度 */
            padding: 5px 10px;
            box-sizing: border-box; /* 包含 padding */
            border: 1px solid #eee; /* 添加边框 */
            font-size: 14px;
            transition: background-color 0.2s; /* 添加过渡效果 */
          `

          // 鼠标悬停效果 (可选)
          div.onmouseover = function () {
            this.style.backgroundColor = "#f5f5f5"
          }
          div.onmouseout = function () {
            this.style.backgroundColor = ""
          }

          div.innerHTML = highlightedItem
          good.appendChild(div)
        }
      })
    }
    originalOpen.apply(this, arguments)
  }
})()