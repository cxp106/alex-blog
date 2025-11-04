// ==UserScript==
// @name         虎扑论坛界面优化
// @namespace    http://tampermonkey.net/
// @version      1.0
// @description  看这个论坛是为了什么？为了摸鱼啊！！！那么大的图你想吓死谁！！！
// @author       千川汇海
// @match        https://bbs.hupu.com/**
// @icon         https://www.google.com/s2/favicons?sz=64&domain=hupu.com
// @grant        none
// @license MIT
// @downloadURL https://update.greasyfork.org/scripts/id/name.user.js
// @updateURL https://update.greasyfork.org/scripts/id/name.meta.js
// ==/UserScript==

(function () {
  'use strict';

  // 添加CSS样式
  const style = document.createElement('style');
  style.innerHTML = `
        .post-reply-list .thread-img {
            max-width: 100px;
            max-height: 100px;
        }
        .index_bbs-post-web-body-right {
            display: none;
        }
        .index_bbs-post-web-body-left {
            flex: 1;
        }
    `;
  document.head.appendChild(style);

  const combinedSelector = ['.post-reply-list .thread-img', '[class^="post-content_main-post-info"] img', '[class^="post-content_main-post-info"] video'];
  const resizeSelector = () => {
    let selectorBean = document.querySelectorAll(combinedSelector.join(','));
    selectorBean.forEach((ele) => {
      ele.style.maxWidth = '100px';
      ele.style.maxHeight = '100px';
    });
  };

  resizeSelector();

  const observer = new MutationObserver(resizeSelector);
  observer.observe(document.body, { childList: true, subtree: true });

  const removeRightDiv = () => {
    document.querySelectorAll('div[class^=index_bbs-post-web-body-right],.post-fix-title').forEach((el) => el.remove());
    document.querySelectorAll('div[class^=index_bbs-post-web-body-left]').forEach((el) => (el.style.flex = '1'));
    document.querySelectorAll('div[class^=index_bbs-post-web-main-title]').forEach((el) => (el.style.opacity = 0));
  };

  removeRightDiv();

  const observerForDiv = new MutationObserver(removeRightDiv);
  observerForDiv.observe(document.body, { childList: true, subtree: true });
})();
