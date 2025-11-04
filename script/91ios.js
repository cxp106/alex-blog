// ==UserScript==
// @name         alist.91ios.fun 破解
// @namespace    http://tampermonkey.net/
// @version      0.1.2
// @description  破解广告弹窗，下载前跳过查看广告
// @author       You
// @match        *://alist.91ios.fun/*
// @run-at       document-start
// @grant        none
// ==/UserScript==

(function () {
  "use strict";

  // 等待页面完全加载后设置 localStorage
  window.addEventListener("DOMContentLoaded", function () {
    localStorage.setItem("adVerified", new Date().toISOString().split("T")[0]);
    console.log("adVerified set to:", localStorage.getItem("adVerified"));
  });

  // --------------------------
  // 1. 拦截 XMLHttpRequest
  // --------------------------
  const originalOpen = XMLHttpRequest.prototype.open;
  const originalSend = XMLHttpRequest.prototype.send;

  XMLHttpRequest.prototype.open = function (
    method,
    url,
    async,
    user,
    password
  ) {
    this.isTargetRequest = url.includes("/check.php"); // 根据实际接口标识修改
    return originalOpen.apply(this, arguments);
  };

  XMLHttpRequest.prototype.send = function (body) {
    if (this.isTargetRequest) {
      this.addEventListener("readystatechange", function () {
        if (this.readyState === 4 && this.status === 200) {
          try {
            const response = JSON.parse(this.responseText);
            if ("code" in response) {
              response.code = 200; // 修改响应数据
              Object.defineProperty(this, "responseText", {
                value: JSON.stringify(response),
              });
            }
          } catch (e) {
            console.error("Failed to modify XMLHttpRequest response:", e);
          }
        }
      });
    }
    return originalSend.apply(this, arguments);
  };

  // --------------------------
  // 2. 拦截 Fetch API
  // --------------------------
  const originalFetch = window.fetch;

  window.fetch = async function (...args) {
    const response = await originalFetch.apply(this, args);

    // 检查 URL 是否需要拦截
    const url = args[0];
    if (url.includes("/check.php")) {
      const clone = response.clone();
      const json = await clone.json();

      if ("code" in json) {
        json.code = 200; // 修改响应数据

        return new Response(JSON.stringify(json), {
          status: response.status,
          statusText: response.statusText,
          headers: response.headers,
        });
      }
    }
    return response;
  };
})();
