// ==UserScript==
// @name         即刻打开新页面
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  网页端即刻点击打开新页面，免得页面来回刷新滚动条位置记不住，同时电脑端就不要显示手机端页面了，看评论都看不全，要他何用
// @author       千川汇海
// @match        https://*.okjike.com/*
// @grant        none
// @run-at       document-start
// ==/UserScript==

const currentUrl = window.location.href;
if (currentUrl.startsWith('https://m.okjike.com/')) {
  const desktopUrl = currentUrl.replace('https://m.okjike.com', 'https://web.okjike.com').replace('originalPosts', 'originalPost');
  window.location.href = desktopUrl;
}

function objectToURL({ pathname, query }) {
  const url = new URL(pathname, window.location.origin);
  for (const key in query) {
    if (query.hasOwnProperty(key)) {
      url.searchParams.append(key, query[key]);
    }
  }
  return url.toString();
}

function jump(url, as) {
  window.open(typeof url === 'object' ? objectToURL(url) : as, '_blank');
  return Promise.resolve(true);
}

function interceptRouter(router) {
  router.push = jump;
  router.replace = jump;
}

function waitForReactRouter() {
  const observer = new MutationObserver((_, obs) => {
    const router = window.next?.router || window.__NEXT_DATA__?.props?.router;
    if (router) {
      interceptRouter(router);
      obs.disconnect();
      window.scrollTo = window.scroll = window.scrollBy = function () {};
    }
  });

  observer.observe(document.body, {
    childList: true,
    subtree: true,
  });
}

(function () {
  'use strict';
  waitForReactRouter();
})();
