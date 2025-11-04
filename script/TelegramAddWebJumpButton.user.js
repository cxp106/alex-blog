// ==UserScript==
// @name         添加网页跳转按钮
// @namespace    http://tampermonkey.net/
// @version      1.0.1
// @description  自动为 Telegram 添加网页跳转按钮，方便进行网页跳转到 https://webk.telegram.org/
// @author       Radiant Moon
// @match        *://t.me/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=t.me
// @grant        none
// ==/UserScript==

(function () {
  "use strict";
  // 提取 URL 中的信息部分
  const url = window.location.href;
  const username = url.split("/").pop();

  // 找到所有 class 为 "tgme_action_button_new" 并且包含 "shine" 的元素
  const elements = document.querySelectorAll(".tgme_action_button_new.shine");

  // 遍历找到的元素并添加一个相同的克隆元素
  elements.forEach((element) => {
    const clone = element.cloneNode(true);
    clone.innerHTML = "网页查看";
    clone.href = "https://webk.telegram.org/#@" + username;
    element.parentNode.insertBefore(clone, element.nextSibling);
  });
})();
