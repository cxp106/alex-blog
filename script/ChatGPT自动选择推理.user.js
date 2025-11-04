// ==UserScript==
// @name         ChatGPT - Enforce Default Pill V7
// @namespace    http://tampermonkey.net/
// @version      0.9
// @description  Monitors for active system hint "pill". If not present, opens menu and selects the last option as default.
// @author       Your Name (or AI)
// @match        https://chatgpt.com/*
// @grant        none
// @run-at       document-idle
// ==/UserScript==

(function() {
    'use strict';

    // --- 配置 ---
    const HINT_BUTTON_SELECTOR = '#system-hint-button';
    const ACTIVE_PILL_SELECTOR = '[data-testid="active-system-hint-pill"]'; // 关键：已选中项的“药丸”
    const MENU_ITEM_SELECTOR = 'div[role="menuitemradio"].__menu-item';
    const MENU_CONTAINER_OPEN_SELECTOR = 'div[role="menu"][data-state="open"]';

    const INITIAL_DELAY = 1000;
    const ACTION_DEBOUNCE_DELAY = 500;
    const CHECK_INTERVAL = 1500;

    let mainObserver = null;
    let actionTimeoutId = null;

    console.log('[ChatGPT Pill V7] Script loaded.');

    // --- 辅助函数 (robustClick, isItemSelected 等保持不变) ---
    async function robustClick(element, elementName = 'Element') {
        if (!element) { console.error(`[V7] ${elementName} not found for robustClick.`); return false; }
        console.log(`[V7] Attempting robust click on ${elementName}:`, element);
        try { element.focus({ preventScroll: true }); } catch (e) { /* silent */ }
        const stepDelay = 50;
        const dispatch = (type, opts = {}) => {
            if (!element) return;
            try {
                const event = new MouseEvent(type, { bubbles: true, cancelable: true, view: window, ...opts });
                element.dispatchEvent(event);
            } catch (e) { /* silent */ }
        };
        dispatch('pointerdown', { pointerType: "mouse", isPrimary: true }); await new Promise(r => setTimeout(r, stepDelay));
        dispatch('mousedown'); await new Promise(r => setTimeout(r, stepDelay));
        dispatch('pointerup', { pointerType: "mouse", isPrimary: true }); await new Promise(r => setTimeout(r, stepDelay));
        dispatch('mouseup'); await new Promise(r => setTimeout(r, stepDelay));
        dispatch('click');
        console.log(`[V7] Robust click sequence attempted on ${elementName}.`);
        return true;
    }

    function isItemSelected(item) {
        if (!item) return false;
        return item.getAttribute('aria-checked') === 'true' || item.getAttribute('data-state') === 'checked';
    }

    // --- 核心操作函数 ---
    async function selectLastMenuItem() {
        console.log('[V7] Trying to find and select the last menu item.');
        let attempts = 0;
        const maxAttempts = 15;
        return new Promise((resolve) => {
            const intervalId = setInterval(async () => {
                const menuItems = document.querySelectorAll(MENU_ITEM_SELECTOR);
                const visibleMenuItems = Array.from(menuItems).filter(item =>
                    item && window.getComputedStyle(item).display !== 'none' && item.closest(MENU_CONTAINER_OPEN_SELECTOR)
                );

                if (visibleMenuItems.length > 0) {
                    clearInterval(intervalId);
                    const lastMenuItem = visibleMenuItems[visibleMenuItems.length - 1];
                    console.log('[V7] Found visible menu items. Clicking the last one:', lastMenuItem);
                    await robustClick(lastMenuItem, 'Last Menu Item');
                    resolve(true);
                } else {
                    attempts++;
                    if (attempts >= maxAttempts) {
                        clearInterval(intervalId);
                        console.warn('[V7] Timed out waiting for visible menu items to appear.');
                        resolve(false);
                    }
                }
            }, 300);
        });
    }

    // --- 主决策逻辑 ---
    async function checkAndEnforceDefault() {
        console.log('[V7 DEBUG] Running checkAndEnforceDefault...');

        const activePill = document.querySelector(ACTIVE_PILL_SELECTOR);
        if (activePill) {
            // console.log('[V7] Active pill found. No action needed.');
            return; // “药丸”存在，说明已有选择，任务完成
        }

        console.log('[V7] Active pill NOT found. Default selection needs to be enforced.');

        const hintButton = document.querySelector(HINT_BUTTON_SELECTOR);
        if (!hintButton) {
            console.warn('[V7] Hint button not found, cannot enforce default.');
            return;
        }

        const isMenuOpen = hintButton.getAttribute('data-state') === 'open' || hintButton.getAttribute('aria-expanded') === 'true';

        if (!isMenuOpen) {
            console.log('[V7] Menu is closed. Clicking hint button to open it.');
            await robustClick(hintButton, 'Hint Button');
            // Give menu time to open before proceeding to select an item
            await new Promise(r => setTimeout(r, ACTION_DEBOUNCE_DELAY));
        }

        // Whether menu was already open or we just opened it, proceed to select last item
        await selectLastMenuItem();
    }

    function debouncedCheck() {
        clearTimeout(actionTimeoutId);
        actionTimeoutId = setTimeout(checkAndEnforceDefault, ACTION_DEBOUNCE_DELAY);
    }

    function startMonitoring() {
        console.log('[V7] Starting monitoring...');
        // This observer's main job is to detect when the active pill is added or removed.
        mainObserver = new MutationObserver((mutationsList, observer) => {
            for (const mutation of mutationsList) {
                if (mutation.type === 'childList') {
                    const addedNodes = Array.from(mutation.addedNodes);
                    const removedNodes = Array.from(mutation.removedNodes);
                    const relevantNodeChanged = (node) => node.nodeType === 1 && (node.matches(ACTIVE_PILL_SELECTOR) || node.querySelector(ACTIVE_PILL_SELECTOR));

                    if (addedNodes.some(relevantNodeChanged) || removedNodes.some(relevantNodeChanged)) {
                        console.log('[V7] MutationObserver: Active pill was added or removed. Triggering check.');
                        debouncedCheck();
                        return; // Found a change, no need to check other mutations
                    }
                }
            }
        });

        // Observe the container of the hint button and pill, or a higher stable parent
        const targetNode = document.querySelector('[data-testid="composer-footer-actions"]')?.parentElement || document.body;
        console.log('[V7] Observing target node:', targetNode);
        mainObserver.observe(targetNode, { childList: true, subtree: true });

        // A fallback periodic check is still useful for initial load and missed mutations
        setInterval(checkAndEnforceDefault, CHECK_INTERVAL);

        // Perform an initial check
        console.log('[V7] Performing initial check.');
        checkAndEnforceDefault();
    }

    // --- Script Entry Point ---
    setTimeout(startMonitoring, INITIAL_DELAY);

    window.addEventListener('unload', () => {
        if (mainObserver) mainObserver.disconnect();
        if (actionTimeoutId) clearTimeout(actionTimeoutId);
        console.log('[V7] Script unloaded, observers cleared.');
    });

})();