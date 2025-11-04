// ==UserScript==
// @name         自动算 Sprint 占用时间
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  自动计算每个 Sprint 占用的时长，并显示在页面上
// @author       South Wind
// @match        *://chipuller.atlassian.net/jira/software/c/projects/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=atlassian.net
// @grant        none
// ==/UserScript==

function parseTimeToHours(text) {
  // 匹配数字和单位，如"h"表示小时，"d"表示天
  const pattern = /(\d+)\s*(h|d)/gi;

  // 使用正则表达式匹配文本
  const matches = [...text.matchAll(pattern)];

  // 对匹配结果进行处理
  let totalHours = 0;
  matches.forEach((match) => {
    const value = parseInt(match[1]); // 提取数字部分
    const unit = match[2]; // 提取单位部分

    if (unit === 'h') {
      totalHours += value; // 直接添加小时数
    } else if (unit === 'd') {
      totalHours += value * 8; // 将天数转换成小时数（1d = 6h）
    }
  });

  return totalHours;
}

function floatDiv(content) {
  // Create a new div element
  const floatingDiv = document.createElement('div');

  // Set content for the floating div
  floatingDiv.textContent = content;

  // Add necessary styles to position and style the floating div
  floatingDiv.style.position = 'fixed';
  floatingDiv.style.top = '8px';
  floatingDiv.style.right = '390px';
  floatingDiv.style.backgroundColor = 'rgba(0, 0, 0, 0)';
  floatingDiv.style.color = '#7a869a';
  floatingDiv.style.padding = '10px';
  floatingDiv.style.borderRadius = '5px';
  floatingDiv.style.zIndex = '9999';

  // Check if a floating div already exists on the page
  const existingFloatingDiv = document.querySelector('#floating-div');

  // If a floating div exists, replace its content
  if (existingFloatingDiv) {
    existingFloatingDiv.textContent = content;
  } else {
    // If no floating div exists, append the new floating div to the body
    floatingDiv.id = 'floating-div';
    document.body.appendChild(floatingDiv);
  }
}

function findDraggableParent(element) {
  // 检查当前节点是否包含自定义属性 draggable
  if (element.getAttribute('draggable') === 'true') {
    return element;
  }

  // 如果当前节点不是根节点，继续查找其父节点
  if (element.parentNode !== null) {
    // 递归调用，查找父节点
    return findDraggableParent(element.parentNode);
  }

  // 如果到达根节点仍未找到，返回 null
  return null;
}

const timeList = ['.ghx-estimate', '[data-testid*="estimate.badge"]'];

(function () {
  'use strict';
  const timesMap = {};

  // Select the target node you want to observe
  const targetNode = document.querySelector('body');

  // Create a new instance of MutationObserver
  const observer = new MutationObserver(() => {
    let totalTime = 0;
    timeList.forEach((selector) => {
      const ghxEstimates = document.querySelectorAll(
        '[data-testid="platform-board-kit.ui.swimlane.swimlane-columns"] [data-component-selector="platform-board-kit.ui.column.draggable-column"]:nth-of-type(-n+4) ' +
          selector
      );

      // Iterate over the collection of elements
      ghxEstimates.forEach((element) => {
        // Retrieve the text content inside each element
        const estimateText = element.textContent;
        timesMap[findDraggableParent(element).querySelector('a').innerText] = parseTimeToHours(estimateText);

        // totalTime += parseTimeToHours(estimateText);

        // Process the retrieved text as needed
      });
    });

    totalTime = Object.values(timesMap).reduce((acc, val) => acc + val, 0);

    totalTime && floatDiv(totalTime);
  });

  // Configure the observer to monitor child elements addition/removal
  const config = { childList: true, subtree: true };

  // Start observing the target node with the configured options
  observer.observe(targetNode, config);
  // Your code here...
})();
