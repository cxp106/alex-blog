// ==UserScript==
// @name         小棉袄内容提取
// @namespace    http://tampermonkey.net/
// @version      2025-09-25
// @description  用于解析内容并将其作为结构化JSON复制到剪贴板
// @author       镇沧澜
// @match        https://haikuoshijie.cn/archives/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=haikuoshijie.cn
// @grant        GM_addStyle
// @grant        GM_setClipboard
// @run-at       document-end
// ==/UserScript==

(function() {
    'use strict';

    const CONFIG = {
        TARGET_SELECTOR: '.post-content-box p',
        BUTTON_CLASS: 'cd-copy-button',
        BUTTON_TEXT: '🌟复制',
        BUTTON_SUCCESS_TEXT: '已复制!',
        SUCCESS_DURATION_MS: 2000,
    };

    const STYLES = `
        .${CONFIG.BUTTON_CLASS} {
            display: inline-flex; align-items: center; justify-content: center;
            margin-left: 8px; padding: 2px 8px; font-size: 12px;
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
            color: currentColor; background-color: rgba(128, 128, 128, 0.15);
            border: 1px solid rgba(128, 128, 128, 0.3); border-radius: 4px;
            cursor: pointer; opacity: 0.6; transition: all 0.2s ease-in-out;
            vertical-align: middle;
        }
        .${CONFIG.BUTTON_CLASS}:hover {
            opacity: 1; background-color: rgba(128, 128, 128, 0.25);
        }
        .${CONFIG.BUTTON_CLASS}.success {
            background-color: #28a745; color: white;
            border-color: #28a745; opacity: 1;
        }
    `;

    const UI_MANAGER = {
        createCopyButton() {
            const button = document.createElement('button');
            button.textContent = CONFIG.BUTTON_TEXT;
            button.className = CONFIG.BUTTON_CLASS;
            button.setAttribute('type', 'button');
            button.setAttribute('aria-label', '将此段落数据复制为JSON格式');
            button.addEventListener('click', CORE_LOGIC.handleCopyClick);
            return button;
        },

        injectButton(paragraph) {
            if (paragraph.querySelector(`.${CONFIG.BUTTON_CLASS}`)) return;
            if (paragraph.textContent.trim().length > 0) {
                 const button = this.createCopyButton();
                 paragraph.appendChild(button);
            }
        },

        updateButtonState(button, isSuccess) {
            if (button._cdTimeoutId) clearTimeout(button._cdTimeoutId);

            if (isSuccess) {
                button.textContent = CONFIG.BUTTON_SUCCESS_TEXT;
                button.classList.add('success');
                button._cdTimeoutId = setTimeout(() => {
                    this.updateButtonState(button, false);
                }, CONFIG.SUCCESS_DURATION_MS);
            } else {
                button.textContent = CONFIG.BUTTON_TEXT;
                button.classList.remove('success');
            }
        }
    };

    const CORE_LOGIC = {
        parseParagraphToJson(paragraph) {
            const data = { title: '', introduction: '', link: '' };
            const firstLink = paragraph.querySelector('a');

            if (firstLink) {
                data.link = firstLink.href || '';
                data.title = firstLink.textContent.trim();
                const clone = paragraph.cloneNode(true);
                clone.querySelector('a').remove();
                data.introduction = clone.textContent.replace(CONFIG.BUTTON_TEXT,'').trim();
            } else {
                data.introduction = paragraph.textContent.trim();
            }
            return data;
        },

        async handleCopyClick(event) {
            event.preventDefault();
            event.stopPropagation();

            const button = event.currentTarget;
            const paragraph = button.parentElement;
            const data = CORE_LOGIC.parseParagraphToJson(paragraph); // Direct call, 'this' context not needed here
            const jsonString = JSON.stringify(data, null, 2);

            try {
                await navigator.clipboard.writeText(jsonString);
                UI_MANAGER.updateButtonState(button, true);
            } catch (err) {
                console.error('Clipboard API failed. Falling back to GM_setClipboard.', err);
                try {
                    GM_setClipboard(jsonString);
                    UI_MANAGER.updateButtonState(button, true);
                } catch (gmErr) {
                    console.error('GM_setClipboard also failed.', gmErr);
                    alert('复制失败！请检查浏览器权限或控制台错误。');
                }
            }
        }
    };

    const OBSERVER_ENGINE = {
        init() {
            const observer = new MutationObserver(mutations => {
                for (const mutation of mutations) {
                    if (mutation.type === 'childList' && mutation.addedNodes.length) {
                        mutation.addedNodes.forEach(node => {
                            if (node.nodeType === Node.ELEMENT_NODE) {
                                if (node.matches(CONFIG.TARGET_SELECTOR)) {
                                    UI_MANAGER.injectButton(node);
                                }
                                node.querySelectorAll(CONFIG.TARGET_SELECTOR)
                                    // 【CORRECTION】Using arrow function to preserve 'this' context
                                    .forEach(p => UI_MANAGER.injectButton(p));
                            }
                        });
                    }
                }
            });

            observer.observe(document.body, { childList: true, subtree: true });
        }
    };

    const APP = {
        init() {
            console.log("Stendhal's Content Distiller v1.0.1: Refined and reinforced.");
            GM_addStyle(STYLES);

            document.querySelectorAll(CONFIG.TARGET_SELECTOR)
                // 【CORRECTION】Using arrow function to preserve 'this' context
                .forEach(p => UI_MANAGER.injectButton(p));

            OBSERVER_ENGINE.init();
        }
    };

    APP.init();

})();