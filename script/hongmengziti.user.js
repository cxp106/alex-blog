// ==UserScript==
// @name        方正楷体
// @namespace   方正楷体
// @version     1.5
// @description 在网页中使用方正楷体，优先尝试加载本地字体资源，若不存在则从网络加载。
// @author      千川汇海
// @license     MIT
// @match       *://*/*
// @run-at      document-start
// ==/UserScript==

GM_addStyle('@import url("https://cdn.jsdelivr.net/gh/meetqy/aspoem/public/fonts/FZKai-Z03/result.css"); * { font-family: "FZKai-Z03", sans-serif !important; }');


// // ==UserScript==
// // @name        鸿蒙字体
// // @namespace   鸿蒙字体
// // @version     1.5
// // @description 在网页中使用华为鸿蒙字体，优先尝试加载本地字体资源，若不存在则从网络加载。
// // @author      千川汇海
// // @license     MIT
// // @match       *://*/*
// // @exclude     *://fanqienovel.com/reader/*
// // @exclude     *://*.android.google.cn/*
// // @exclude     *://www.bilibili.com/*
// // @run-at      document-start
// // ==/UserScript==
 
// (function() {
//     'use strict';
 
//     // 检查本地是否已安装华为鸿蒙字体，若已安装则直接使用，否则加载网络字体资源
//     const fontName = 'HarmonyOS Sans';
//     if (!document.fonts.check(`12px "${fontName}"`)) {
//         const link = document.createElement('link');
//         link.rel = 'stylesheet';
//         link.href = 'https://developer.huawei.com/config/commonResource/font/font.css';
//         document.head.appendChild(link);
//     }
 
//     // 应用字体样式至所有元素
//     const style = document.createElement('style');
//     document.head.appendChild(style);
//     style.textContent = `
//         * {
//             font-family: '${fontName}', sans-serif !important;
//         }
//     `;
// })();