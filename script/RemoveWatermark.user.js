// ==UserScript==
// @name         搞定水印 RemoveWatermark（搞定设计、创客贴、比格设计、爱设计、易企秀、标小智、标智客等）
// @namespace    https://www.benmao.vip
// @version      1.1.1
// @description  🔥搞定水印 RemoveWatermark 插件是由笨猫小站开发的一款去水印工具，支持去除在线图文设计平台水印，包括有搞定设计、创客贴、比格设计、爱设计、易企秀、标小智、标智客图片水印。
// @author       笨猫
// @icon         https://achengovo.com/greasyfork/logo.png
// @match        https://*.gaoding.com/*
// @match        https://*.eqxiu.com/*
// @match        https://*.chuangkit.com/*
// @match        https://bigesj.com/*
// @match        https://www.isheji.com/*
// @match        https://www.logosc.cn/*
// @match        https://www.focodesign.com/*
// @match        https://www.logomaker.com.cn/*
// @require      https://update.greasyfork.org/scripts/502757/1422896/Jquery331.js
// @require      https://greasyfork.org/scripts/448541-dom-to-image-js/code/dom-to-imagejs.js?version=1074759
// @require      https://update.greasyfork.org/scripts/457525/1134363/html2canvas%20141.js
// @license      AGPL-3.0
// @grant        GM_addStyle
// @grant        GM_xmlhttpRequest
// @grant        unsafeWindow
// @compatible    firefox
// @compatible    chrome
// @compatible    opera safari edge
// @compatible    safari
// @compatible    edge
// ==/UserScript==

(function () {
  "use strict";

  const alifont = "https://at.alicdn.com/t/c/font_2324127_m4c36wjifv.css";
  const cssurl = "https://api.benmao.vip/public/monkey/css/remark.css";

  GM_addStyle(`@import url('${alifont}');`);
  GM_addStyle(`@import url('${cssurl}');`);

  createRemarkBtn();

  // 创建去水印按钮
  function createRemarkBtn() {
    const killMarkObj = createElement('div', { class: 'kill-mark-slide' });
    document.body.appendChild(killMarkObj);

    const killBtnObj = createElement('span', { class: 'kill-mark-btn' }, "<i class='catfont benmao-shuiyin'></i> 去水印");
    killBtnObj.addEventListener("click", killMarks);
    killMarkObj.appendChild(killBtnObj);

    const tutorialBtnObj = createElement('a', {
      class: 'tutorial-btn',
      href: "https://www.benmao.vip/jufeng/info.html?id=212",
      target: "_blank"
    }, "<i class='catfont benmao-jiaocheng'></i> 看教程");
    killMarkObj.appendChild(tutorialBtnObj);
  }

  // 通用元素创建函数
  function createElement(tag, attributes, innerHTML = '') {
    const elem = document.createElement(tag);
    for (const [key, value] of Object.entries(attributes)) {
      elem.setAttribute(key, value);
    }
    elem.innerHTML = innerHTML;
    return elem;
  }

  // 去水印提示（搞定设计）
  function gaodingRemarkTips() {
    const markTipScreen = createElement('div', { class: 'remark-tips-screen' });
    document.body.appendChild(markTipScreen);

    const markTipModal = createElement('div', { class: 'remark-tips-modal' });
    markTipScreen.appendChild(markTipModal);

    const modalTipTitle = createElement('h3', { class: 'modal-title' }, "请确认是否添加屏蔽网络请求！");
    markTipModal.appendChild(modalTipTitle);

    const modalTipInfos = createElement('div', { class: 'modal-infos' });
    markTipModal.appendChild(modalTipInfos);

    const steps = [
      {
        text: "1. 作图完成以后按 F12 打开开发者工具，打开屏蔽网络请求",
        img: "https://api.benmao.vip/public/monkey/images/gdimgs/step_1.png"
      },
      {
        text: "2. 添加屏蔽请求，输入屏蔽地址：blob:https://www.gaoding.com/*-*-*-*-*",
        img: "https://api.benmao.vip/public/monkey/images/gdimgs/step_2.png"
      },
      {
        text: "3. 勾选请求阻止，刷新页面，此时页面中已经没有水印了",
        img: "https://api.benmao.vip/public/monkey/images/gdimgs/step_3.png"
      }
    ];

    steps.forEach(step => {
      const stepElem = createElement('div', { class: `step-${steps.indexOf(step) + 1}` }, step.text);
      const stepImg = createElement('img', { class: `step-${steps.indexOf(step) + 1}-img`, src: step.img });
      stepElem.appendChild(stepImg);
      modalTipInfos.appendChild(stepElem);
    });

    const killtipBtnsObj = createElement('div', { class: 'kill-tip-btns' });
    markTipModal.appendChild(killtipBtnsObj);

    const closeBtnObj = createElement('span', { class: 'btn' }, '关闭');
    closeBtnObj.addEventListener("click", () => hideVerifyModal("remark-tips-screen"));
    killtipBtnsObj.appendChild(closeBtnObj);

    const rekillBtnObj = createElement('span', { class: 'btn' }, '已添加，现在去水印');
    rekillBtnObj.addEventListener("click", () => location.reload());
    killtipBtnsObj.appendChild(rekillBtnObj);
  }

  // 去水印功能
  function killMarks() {
    const doctitle = document.title;

    // 各个平台水印移除处理
    const platforms = [
      { name: '稿定设计', handler: gaodingRemarkTips },
      { name: '易企秀', handler: removeYiQiXiuWatermark },
      { name: '创客贴', handler: removeChuangKeTieWatermark },
      { name: '比格设计', handler: removeBiGeDesignWatermark },
      { name: '爱设计', handler: removeAiDesignWatermark },
      { name: '标小智', handler: removeBiaoXiaoZhiWatermark },
      { name: '标智客', handler: removeBiaoZhiKeWatermark }
    ];

    for (let platform of platforms) {
      if (new RegExp(platform.name).test(doctitle)) {
        platform.handler();
        return;
      }
    }
  }

  // 各个平台的水印移除处理函数
  function removeYiQiXiuWatermark() {
    $("div.eqc-watermark").css("position", "static");
    $(".eqc-wm-close").remove();
    const newStr = document.getElementsByClassName("safe-space")[0].innerHTML
      .replaceAll('data-hint="双击或从素材库拖拽进行替换"', "")
      .replaceAll("hint--top", "");
    window.document.body.innerHTML = newStr;
  }

  function removeChuangKeTieWatermark() {
    const newStr = document.getElementsByClassName("canvas-slot-inner")[0].innerHTML;
    window.document.body.innerHTML = newStr;
    $("div[style*='ckt-watermark']").remove();
    $("body").css("overflow", "visible");
  }

  function removeBiGeDesignWatermark() {
    $("div.water").css("position", "static");
    $("div.tool-bar-container").remove();
    $(".water-tip").remove();
  }

  function removeAiDesignWatermark() {
    $("#editorDrag > div.undefined.scrolly > div.scrolly-viewport.editor-center > div > div:nth-child(1)").remove();
    $(".editor-watermask, .editor-header, .editor-aside, .editor-panel, #rongqi, #outbuttons, .control-panel").remove();
  }

  function removeBiaoXiaoZhiWatermark() {
    $(".watermarklayer").remove();
    $("#watermark").remove();
  }

  function removeBiaoZhiKeWatermark() {
    $(".watermark").remove();
  }

  // 关闭验证框
  function hideVerifyModal(elem) {
    $("." + elem).remove();
  }
})();
