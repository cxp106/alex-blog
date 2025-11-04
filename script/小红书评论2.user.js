// ==UserScript==
// @name         小红书单篇笔记评论采集
// @namespace    老李
// @author       XiaoDou
// @version      1.0.0
// @license      MIT
// @description  小红书单篇笔记评论采集
// @match        https://www.xiaohongshu.com/explore/*
// @grant        GM_download
// ==/UserScript==

(function() {
    'use strict';
    function explorePageFunction() {
        // 创建用于显示当前采集数量的元素
        const countElement = document.createElement("div");
        countElement.textContent = "已采集评论数量：0";
        countElement.style.position = "fixed";
        countElement.style.bottom = "20px";
        countElement.style.right = "20px";
        countElement.style.zIndex = "9999";
        countElement.style.padding = "10px 20px";
        countElement.style.fontSize = "16px";
        countElement.style.backgroundColor = "#fff";
        countElement.style.border = "1px solid #000";
        countElement.style.borderRadius = "5px";
        document.body.appendChild(countElement);

        // 创建导出按钮
        const exportBtn = document.createElement("button");
        exportBtn.textContent = "导出评论";
        exportBtn.style.position = "fixed";
        exportBtn.style.bottom = "60px";
        exportBtn.style.right = "20px";
        exportBtn.style.zIndex = "9999";
        exportBtn.style.backgroundColor = "#FF5733";
        exportBtn.style.color = "#fff";
        exportBtn.style.border = "none";
        exportBtn.style.borderRadius = "5px";
        exportBtn.style.padding = "10px 20px";
        exportBtn.style.fontSize = "16px";
        exportBtn.style.cursor = "pointer";
        exportBtn.addEventListener("click", function() {
            exportToCSV(commentsData); // 导出到CSV
        });
        document.body.appendChild(exportBtn);

        let commentsData = []; // 用于存储评论信息的数组

        // 确保评论区域加载后开始监视
        const observer = new MutationObserver(() => {
            const commentsWrap = document.querySelector('.comments-container');
            if (commentsWrap) {
                observer.disconnect();
                collectComments();
                setInterval(() => {
                    collectComments();
                    countElement.textContent = `已采集评论数量：${commentsData.length}`;
                }, 500); // 每隔0.5秒更新一次评论数量
            }
        });

        observer.observe(document.body, { childList: true, subtree: true });

        // 收集评论信息
        function collectComments() {
            const newComments = document.querySelectorAll(".comment-item:not(.already-collected)");
            newComments.forEach(comment => {
                comment.classList.add("already-collected");
                const isSubComment = comment.classList.contains("comment-item-sub");
                const authorName = comment.querySelector(".author-wrapper .author .name")?.textContent.trim() || "匿名";
                let content = comment.querySelector(".content")?.textContent.trim() || "";
                if (isSubComment) {
                    const repliedTo = content.match(/回复\s+([^:]+):/)?.[1]?.trim();
                    content = repliedTo ? `回复${repliedTo}: ${content}` : `回复: ${content}`;
                }
                const date = comment.querySelector(".date")?.textContent.trim() || "";
                const likeCount = comment.querySelector(".like")?.textContent.trim() || "0";

                commentsData.push({authorName, content, date, likeCount});
            });
        }

        // 将数据导出为CSV文件
        function exportToCSV(data) {
            let csvContent = "\uFEFF"; // 添加BOM头，确保在Excel中正确显示UTF-8编码的内容
            csvContent += "作者,内容,日期,点赞数\n";

            data.forEach(info => {
                csvContent += `${info.authorName},${escapeSpecialCharacters(info.content.replace(/,/g, "，"))},${info.date},${info.likeCount}\n`;
            });

            const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
            const fileName = document.querySelector('.title').textContent.trim() + '.csv';
            if (navigator.msSaveBlob) { // For IE 10 and above
                navigator.msSaveBlob(blob, fileName);
            } else {
                const link = document.createElement("a");
                if (link.download !== undefined) {
                    const url = URL.createObjectURL(blob);
                    link.setAttribute("href", url);
                    link.setAttribute("download", fileName);
                    link.style.visibility = 'hidden';
                    document.body.appendChild(link);
                    link.click();
                    document.body.removeChild(link);
                }
            }
        }

        // 转义特殊字符
        function escapeSpecialCharacters(content) {
            return content.replace(/[\x00-\x1F\x7F-\x9F]/g, ''); // 去除控制字符
        }
    }

        explorePageFunction();

})();