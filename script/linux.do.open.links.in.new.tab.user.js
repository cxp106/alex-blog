// ==UserScript==
// @name         Discourse: Open Links in New Tab (在新标签页打开链接) - v1.8 Absolute URL Fix
// @namespace    http://tampermonkey.net/
// @version      1.8
// @description  修复v1.7中打开URL错误的问题，确保使用绝对路径打开新标签页。
// @author       Frontend Architect (接近完美!)
// @match        *://linux.do/*
// @grant        window.open
// @grant        GM_openInTab
// @run-at       document-idle
// @license      MIT
// ==/UserScript==

(function() {
    'use strict'; // Re-enabled strict mode
    console.log("Tampermonkey Script (Discourse New Tab - v1.8 Absolute URL Fix) Initializing..."); // Log 1

    // --- 配置区域 ---
    const LINK_SELECTORS = [
        '.cooked a',
        'a.topic-title',
        '.topic-list-item .title a',
        'a.title.raw-link.raw-topic-link'
    ];
    const SELECTORS_STRING = LINK_SELECTORS.join(', ');
    console.log("Tampermonkey Script (v1.8) Selectors configured:", SELECTORS_STRING); // Log 2

    // --- 核心逻辑：文档捕获阶段的事件委托 ---
    function handleDocumentCaptureClick(event) {
        let targetLink = event.target.closest(SELECTORS_STRING);

        if (!targetLink) {
            return; // Not a link we care about
        }

        const originalHref = targetLink.getAttribute('href');
        // console.log("Tampermonkey (v1.8): Matched link found, original href:", originalHref); // Debug log

        // --- URL Resolution ---
        let absoluteUrl;
        try {
            // Check if href is valid and not an anchor or javascript link BEFORE resolving
             if (!originalHref || originalHref.startsWith('#') || originalHref.toLowerCase().startsWith('javascript:')) {
                // console.log("Tampermonkey (v1.8): Skipping anchor or javascript link:", originalHref); // Debug log
                return;
            }
            // Resolve the href (relative or absolute) against the current page's location
            absoluteUrl = new URL(originalHref, location.href).toString();
             console.log(`Tampermonkey (v1.8): Resolved URL: ${absoluteUrl} (from: ${originalHref})`); // Log: Show resolved URL

        } catch (e) {
             console.error("Tampermonkey (v1.8): Failed to parse or resolve URL", originalHref, e);
             return; // Stop if URL is invalid
        }
        // --- End URL Resolution ---


        // 仅处理普通左键点击 (非中键、右键，无修饰键)
        if (event.button === 0 && !event.ctrlKey && !event.shiftKey && !event.metaKey && !event.altKey) {

            // --- 阻止事件并手动打开 ---
            console.log(`Tampermonkey (v1.8 Capture): Intercepting click on "${originalHref}". Opening resolved URL: ${absoluteUrl}`); // Log 3: Interception with resolved URL
            event.preventDefault();
            event.stopPropagation();

            try {
                // Use the RESOLVED absoluteUrl now
                if (typeof GM_openInTab === 'function') {
                    console.log("Tampermonkey (v1.8): Using GM_openInTab for absolute URL."); // Log 4a
                    GM_openInTab(absoluteUrl, { active: true, insert: true });
                } else {
                    console.log("Tampermonkey (v1.8): Using window.open fallback for absolute URL."); // Log 4b
                    const newWindow = window.open(absoluteUrl, '_blank');
                    if (newWindow) {
                        newWindow.opener = null;
                    } else {
                        console.warn("Tampermonkey (v1.8): window.open might have been blocked.");
                    }
                }
            } catch (e) {
                console.error("Tampermonkey (v1.8): Error opening link in new tab.", absoluteUrl, e);
            }
        }
    } // End of handleDocumentCaptureClick

    // --- 初始化事件监听器 ---
    try {
        document.addEventListener('click', handleDocumentCaptureClick, true); // true for capture phase
        console.log("Tampermonkey Script (v1.8) Capture phase click listener attached successfully."); // Log 5: Success!
    } catch (e) {
         console.error("Tampermonkey Script (v1.8) FAILED TO ATTACH click listener:", e); // Log 5b: Failure!
    }

    console.log("Tampermonkey Script (Discourse New Tab - v1.8 Absolute URL Fix) Initialization finished."); // Log 6

})(); // End of IIFE