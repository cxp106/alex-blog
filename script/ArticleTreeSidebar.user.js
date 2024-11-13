// ==UserScript==
// @name         文章树形侧边栏
// @namespace    http://tampermonkey.net/
// @version      1.0.2
// @description  使用采用树形缩进显示方式利用 F8 热键切换显示文章标题（H1~H6）的侧边栏，
// @author       South Wind
// @match        *://juejin.cn/post/*
// @match        *://juejin.cn/entry/*
// @match        *://sspai.com/*
// @match        *://zhuanlan.zhihu.com/p/*
// @match        *://mp.weixin.qq.com/*
// @match        *://cnodejs.org/topic/*
// @match        *://div.io/topic/*
// @match        *://www.zcfy.cc/article/*
// @grant        GM_addStyle
// @grant        GM_getValue
// @grant        GM_setValue
// ==/UserScript==

/**
 * 滚动到指定的 DOM 元素
 * @param {Element} element - 要滚动到的 DOM 元素
 * @param {Object} options - 可选参数
 * @param {boolean} options.behavior - 滚动行为，默认为 'smooth'
 * @param {string} options.block - 垂直对齐方式，默认为 'start'
 * @param {string} options.inline - 水平对齐方式，默认为 'nearest'
 */
function scrollToElement(element, options = {}) {
  if (!element) {
    console.error('Element not found');
    return;
  }

  const defaultOptions = {
    behavior: 'smooth', // 滚动行为：'auto' 或 'smooth'
    block: 'start', // 垂直对齐方式：'start', 'center', 'end', 'nearest'
    inline: 'nearest', // 水平对齐方式：'start', 'center', 'end', 'nearest'
  };

  const scrollOptions = { ...defaultOptions, ...options };

  element.scrollIntoView(scrollOptions);
}

function getSidebarStyles() {
  return `
    #toggleSidebar {
        position: fixed;
        top: 50%;
        left: -280px;
        transform: translateY(-50%);
        width: 280px;
        max-width: calc(100vw - 40px);
        height: calc(100vh - 40px);
        background-color: #f8f8f8;
        border-left: 1px solid #ddd;
        box-shadow: -3px 0 10px rgba(0, 0, 0, 0.1);
        transition: left .3s ease-in-out;
        z-index: 99999;
        overflow-y: auto;
        padding: 16px;
        box-sizing: border-box !important;
    }
    #toggleSidebar.open {
        left: 0;
    }
    #toggleSidebar ul {
        list-style-type: none;
        padding: 0;
        margin: 0;
    }
    #toggleSidebar li {
        margin-bottom: 0;
    }
    #toggleSidebar div {
        cursor: pointer;
        display: block;
        padding: 4px;
        margin: 0;
        color: #333;
        text-decoration: none;
        border-radius: 5px;
        padding: 6px 9px;
    }
    #toggleSidebar div:hover {
        background-color: #f0f0f0;
    }
  `;
}

function collectHeadings() {
  return Array.from(document.querySelectorAll('h1, h2, h3, h4, h5, h6'))
  .filter((heading) => {
    return !getContainingArticle(heading)?.querySelector('h1, h2, h3, h4, h5, h6').contains(heading);
  });
}

function getContainingArticle(element) {
  while (element) {
    if (element.matches('article, section, main')) {
      return element;
    }
    element = element.parentElement;
  }
  return null;
}

function createSidebarList() {
  const ul = document.createElement('ul');
  ul.innerHTML = '';
  return ul;
}

function getMinHeadingLevel(headings) {
  return headings.reduce((min, heading) => {
    const level = parseInt(heading.tagName.charAt(1));
    return level < min ? level : min;
  }, 6);
}

function createSidebarListItem(heading, minLevel) {
  const li = document.createElement('li');
  const div = document.createElement('div');
  div.onclick = () => scrollToElement(heading);
  div.textContent = heading.textContent;
  li.appendChild(div);
  li.style.textIndent = `${parseInt(heading.tagName.charAt(1)) - minLevel}em`;
  return li;
}

(function () {
  'use strict';

  const sidebar = createSidebar();
  document.body.appendChild(sidebar);
  const headings = collectHeadings();
  updateSidebar(headings);

  function createSidebar() {
    const sidebar = document.createElement('div');
    sidebar.id = 'toggleSidebar';
    GM_addStyle(getSidebarStyles());
    document.body.appendChild(sidebar);
    return sidebar;
  }

  function updateSidebar(headings) {
    // 清空旧数据
    sidebar.innerHTML = '';

    const ul = createSidebarList();
    const minLevel = getMinHeadingLevel(headings);
    headings.forEach((heading) => {
      if (heading.textContent) {
        ul.appendChild(createSidebarListItem(heading, minLevel));
      }
    });
    sidebar.appendChild(ul);
  }

  document.addEventListener('keydown', (event) => {
    if (event.key === 'F8') {
      toggleSidebar();
    }
  });

  function toggleSidebar() {
    sidebar.classList.toggle('open');
    GM_setValue('open', sidebar.classList.contains('open'));
  }

  const observer = new MutationObserver((mutations) => {
    for (const mutation of mutations) {
      if (!sidebar.contains(mutation.target)) {
        const headings = collectHeadings();
        updateSidebar(headings);
        break;
      }
    }
  });

  observer.observe(document.documentElement, {
    childList: true,
    subtree: true,
  });

  GM_getValue('open') && toggleSidebar();
})();
