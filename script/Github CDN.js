// ==UserScript==
// @name         Github 添加 CND 功能
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  给 Github 文件列表添加 CDN 链接，便于 CDN 引用
// @author       alex
// @match        *://github.com/*
// @updateURL        *://github.com/*
// @grant        none
// ==/UserScript==

(function () {
  // 按钮样式
  const buttonStyle =
    "color: #444444;background: #F3F3F3;border: 1px #DADADA solid;padding: 5px 10px;border - radius: 2px;font - weight: bold;font - size: 9pt;outline: none;";

  // 判断是否已经加载过
  const hasJionCDN = () => {
    const CDN_els = document.querySelectorAll(".alex-cdn");
    return !!CDN_els.length;
  };

  // 加入按钮
  const jionCDN = () => {
    const TMP_els = document.querySelectorAll(
      ".Details .Box-row.js-navigation-item"
    );
    for (let el of TMP_els) {
      // 首先先获取到链接
      const link = el
        .querySelector("div:nth-child(2)")
        .getElementsByTagName("a")[0];
      console.log("el", el.getElementsByTagName("span")[0]);
      // 如果链接为空则不进行处理
      if (!link) continue;
      const github_url = link.getAttribute("href");
      const reg =
        "^(https://github.com|http://github.com)?/(.+?)/(.+?)/blob/(.+?)/(.*)$";
      let r = github_url.match(reg);
      const div = document.createElement("div");
      div.setAttribute("class", "alex-cdn");
      if (r) {
        const CDN_LIST = [
          {
            name: "jsDelivr",
            url: `https://cdn.jsdelivr.net/gh/${r[2]}/${r[3]}@${r[4]}/${r[5]}`,
          },
          {
            name: "Statically",
            url: `https://cdn.statically.io/gh/${r[2]}/${r[3]}/${r[4]}/${r[5]}`,
          },
        ];
        for (const CDN of CDN_LIST) {
          let a = document.createElement("a");
          a.innerHTML = CDN.name;
          a.setAttribute("href", CDN.url);
          a.setAttribute("target", "_blank");
          a.setAttribute("style", buttonStyle);
          div.appendChild(a);
        }
      }
      el.appendChild(div);
    }
  };

  // 监听页面变化
  window.onbeforeunload = function (e) {
    e = e || window.event;
    if (hasJionCDN()) return;
    jionCDN();
  };

  // 首次加载
  jionCDN();
})();
