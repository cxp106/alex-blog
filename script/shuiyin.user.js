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
  var today = new Date().toLocaleDateString();
  setCookie("catKillMark", today, 12);
  hideVerifyModal("verify-screen");
})();
//创建去水印按钮
function createRemarkBtn() {
  var killMarkObj = document.createElement("div");
  killMarkObj.setAttribute("class", "kill-mark-slide");
  document.body.appendChild(killMarkObj);
  //去水印
  var killBtnObj = document.createElement("span");
  killBtnObj.setAttribute("class", "kill-mark-btn");
  killBtnObj.innerHTML = "<i class='catfont benmao-shuiyin'></i> 去水印";
  killBtnObj.addEventListener("click", () => {
    killMarks();
  });
  killMarkObj.appendChild(killBtnObj);

  //看教程
  var tutorialBtnObj = document.createElement("a");
  tutorialBtnObj.setAttribute("class", "tutorial-btn");
  tutorialBtnObj.setAttribute("target", "_blank");
  tutorialBtnObj.setAttribute(
    "href",
    "https://www.benmao.vip/jufeng/info.html?id=212"
  );
  tutorialBtnObj.innerHTML = "<i class='catfont benmao-jiaocheng'></i> 看教程";
  killMarkObj.appendChild(tutorialBtnObj);
}

//去水印提示（搞定设计）
function gaodingRemarkTips() {
  var markTipScreen = document.createElement("div");
  markTipScreen.setAttribute("class", "remark-tips-screen");
  document.body.appendChild(markTipScreen);

  var markTipModal = document.createElement("div");
  markTipModal.setAttribute("class", "remark-tips-modal");
  markTipScreen.appendChild(markTipModal);

  var modalTipTitle = document.createElement("h3");
  modalTipTitle.setAttribute("class", "modal-title");
  modalTipTitle.textContent = "请确认是否添加屏蔽网络请求！";
  markTipModal.appendChild(modalTipTitle);

  var modalTipInfos = document.createElement("div");
  modalTipInfos.setAttribute("class", "modal-infos");
  markTipModal.appendChild(modalTipInfos);

  var stepOne = document.createElement("div");
  stepOne.setAttribute("class", "step-one");
  stepOne.textContent =
    "1. 作图完成以后按 F12 打开开发者工具，打开屏蔽网络请求";
  modalTipInfos.appendChild(stepOne);

  var stepOneImg = document.createElement("img");
  stepOneImg.setAttribute("class", "step-ong-img");
  stepOneImg.src =
    "https://api.benmao.vip/public/monkey/images/gdimgs/step_1.png";
  stepOne.appendChild(stepOneImg);

  var stepTwo = document.createElement("div");
  stepTwo.setAttribute("class", "step-two");
  stepTwo.textContent =
    "2. 添加屏蔽请求，输入屏蔽地址：blob:https://www.gaoding.com/*-*-*-*-*";
  modalTipInfos.appendChild(stepTwo);

  var stepTwoImg = document.createElement("img");
  stepTwoImg.setAttribute("class", "step-two-img");
  stepTwoImg.src =
    "https://api.benmao.vip/public/monkey/images/gdimgs/step_2.png";
  stepTwo.appendChild(stepTwoImg);

  var stepThree = document.createElement("div");
  stepThree.setAttribute("class", "step-three");
  stepThree.textContent = "3. 勾选请求阻止，刷新页面，此时页面中已经没有水印了";
  modalTipInfos.appendChild(stepThree);

  var stepThreeImg = document.createElement("img");
  stepThreeImg.setAttribute("class", "step-three-img");
  stepThreeImg.src =
    "https://api.benmao.vip/public/monkey/images/gdimgs/step_3.png";
  stepThree.appendChild(stepThreeImg);

  var killtipBtnsObj = document.createElement("div");
  killtipBtnsObj.setAttribute("class", "kill-tip-btns");
  markTipModal.appendChild(killtipBtnsObj);

  var closeBtnObj = document.createElement("span");
  closeBtnObj.setAttribute("class", "btn");
  closeBtnObj.textContent = "关闭";
  closeBtnObj.addEventListener("click", () => {
    hideVerifyModal("remark-tips-screen");
  });
  killtipBtnsObj.appendChild(closeBtnObj);

  var rekillBtnObj = document.createElement("span");
  rekillBtnObj.setAttribute("class", "btn");
  rekillBtnObj.textContent = "已添加，现在去水印";
  rekillBtnObj.addEventListener("click", () => {
    location.reload();
  });
  killtipBtnsObj.appendChild(rekillBtnObj);
}

//去水印功能
function killMarks() {
  const doctitle = document.title;
  if (/(稿定设计)/.test(doctitle)) {
    gaodingRemarkTips();
  } else if (/(易企秀)/.test(doctitle)) {
    $("div.eqc-watermark").css("position", "static");
    $(".eqc-wm-close").remove();
    let oldStr = window.document.body.innerHTML;
    var newStr = document.getElementsByClassName("safe-space")[0].innerHTML;
    newStr = newStr.replaceAll('data-hint="双击或从素材库拖拽进行替换"', "");
    newStr = newStr.replaceAll("hint--top", "");
  } else if (/(创客贴)/.test(doctitle)) {
    const newStr =
      document.getElementsByClassName("canvas-slot-inner")[0].innerHTML;
    window.document.body.innerHTML = newStr;
    $("div[style*='ckt-watermark']").remove();
    $("body").css("overflow", "visible");
  } else if (/(比格设计)/.test(doctitle)) {
    $("div.water").css("position", "static");
    $("div.tool-bar-container").remove();
    $(".water-tip").remove();
  } else if (/(爱设计)/.test(doctitle)) {
    $(
      "#editorDrag > div.undefined.scrolly > div.scrolly-viewport.editor-center > div > div:nth-child(1)"
    ).remove();
    $(".editor-watermask").remove();
    $(".editor-header").remove();
    $(".editor-aside").remove();
    $(".editor-panel").remove();
    $("#rongqi").remove();
    $("#outbuttons").remove();
    $(".control-panel").remove();
  } else if (/(标小智)/.test(doctitle)) {
    $(".watermarklayer").remove();
    $("#watermark").remove();
  } else if (/(标智客)/.test(doctitle)) {
    console.log(1111);
    $(".watermark").remove();
  }
}
//设置 Cookie
function setCookie(name, value, hours) {
  var d = new Date();
  d.setTime(d.getTime() + hours * 60 * 60 * 1000);
  var expires = "expires=" + d.toUTCString();
  document.cookie = name + "=" + value + ";" + expires + ";path=/";
}
//获取 Cookie
function getCookie(ckname) {
  var name = ckname + "=";
  var ca = document.cookie.split(";");
  for (var i = 0; i < ca.length; i++) {
    var c = ca[i];
    while (c.charAt(0) == "") c = c.substring(1);
    if (c.indexOf(name) != -1) return c.substring(name.length, c.length);
  }
  return "";
}
//关闭验证
function hideVerifyModal(elem) {
  $("." + elem).remove();
}
