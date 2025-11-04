// ==UserScript==
// @name         V2EX 无痕密使 (V2EX Invisible Emissary)
// @namespace    http://tampermonkey.net/
// @version      2.0
// @description  当您访问V2EX任意页面时，在后台自动检查并完成每日签到任务，全程无感、无刷新、无打扰。
// @author       Stendhal
// @match        https://www.v2ex.com/*
// @exclude      /https?:\/\/www\.v2ex\.com\/mission\/daily\/redeem.*/
// @icon         https://www.google.com/s2/favicons?sz=64&domain=v2ex.com
// @grant        GM_setValue
// @grant        GM_getValue
// @grant        GM_xmlhttpRequest
// @connect      self
// @run-at       document-start
// ==/UserScript==

// PHILOSOPHY:
// 本脚本的设计哲学是“主动代理”与“绝对静默”。它不再是被动地在特定页面等待指令，
// 而是在整个V2EX域内成为一个有感知的“无痕密使”。其核心逻辑被设计为极致轻量，
// 在每个页面加载之初进行瞬时检查。只有在“需要行动”的条件下，它才会启动一个
// 完全在后台运行、由两阶段网络请求组成的、对用户完全透明的自动化任务链。
// 并发控制（会话锁）和全面的错误处理确保了其在复杂浏览场景下的健壮性。
// 它的目标，是让用户彻底忘记“每日签到”这件事。

(function() {
    'use strict';

    const LOG_PREFIX = '[V2EX Invisible Emissary]';
    const STORAGE_KEY_LAST_SIGNED = 'v2ex_last_signed_date';
    const SESSION_KEY_LOCK = 'v2ex_signin_lock';
    const LOCK_TIMEOUT_MS = 5 * 60 * 1000; // 5分钟

    /**
     * @description 封装了所有操作的智能代理对象
     */
    const MissionAgent = {
        /**
         * @description 脚本主入口，协调所有操作
         */
        async init() {
            if (await this.hasSignedToday()) {
                // console.log(`${LOG_PREFIX} 今日已签到，密使休眠。`);
                return;
            }

            if (!this.acquireLock()) {
                // console.log(`${LOG_PREFIX} 其他密使正在行动，本实例静默。`);
                return;
            }

            console.log(`${LOG_PREFIX} 密使已唤醒，开始执行签到流程...`);
            try {
                await this.runSignInProcess();
            } catch (error) {
                console.error(`${LOG_PREFIX} 执行过程中遭遇意外错误:`, error);
            } finally {
                this.releaseLock();
            }
        },

        /**
         * @description 检查今天是否已经签到过
         * @returns {Promise<boolean>}
         */
        async hasSignedToday() {
            const lastSigned = await GM_getValue(STORAGE_KEY_LAST_SIGNED, null);
            const today = new Date().toLocaleDateString();
            return lastSigned === today;
        },

        /**
         * @description 获取会话锁，防止多个标签页同时执行
         * @returns {boolean} - true if lock was acquired, false otherwise.
         */
        acquireLock() {
            const lockTimestamp = sessionStorage.getItem(SESSION_KEY_LOCK);
            if (lockTimestamp) {
                // 检查锁是否超时（死锁）
                if (Date.now() - parseInt(lockTimestamp, 10) > LOCK_TIMEOUT_MS) {
                    console.warn(`${LOG_PREFIX} 发现一个陈旧的锁，判定为死锁并强制获取。`);
                } else {
                    return false; // 锁仍然有效
                }
            }
            sessionStorage.setItem(SESSION_KEY_LOCK, Date.now().toString());
            return true;
        },

        /**
         * @description 释放会话锁
         */
        releaseLock() {
            sessionStorage.removeItem(SESSION_KEY_LOCK);
        },

        /**
         * @description 记录签到日期
         */
        async updateLastSignedDate() {
            const today = new Date().toLocaleDateString();
            await GM_setValue(STORAGE_KEY_LAST_SIGNED, today);
            console.log(`${LOG_PREFIX} 任务完成，功绩已记录。签到日期: ${today}`);
        },

        /**
         * @description 执行由两阶段组成的后台签到流程
         */
        async runSignInProcess() {
            // Stage 1: 侦察 - 获取任务页面信息
            console.log(`${LOG_PREFIX} 阶段1: 正在后台侦察 /mission/daily 页面...`);
            const missionPageHtml = await this.fetchPage('/mission/daily');

            // 分析情报：检查是否已签到
            if (missionPageHtml.includes('每日登录奖励已领取')) {
                console.log(`${LOG_PREFIX} 情报分析: 发现任务已由其他方式完成。`);
                await this.updateLastSignedDate(); // 同步状态
                return;
            }

            // 分析情报：提取 once 参数
            const onceMatch = missionPageHtml.match(/\/mission\/daily\/redeem\?once=(\d+)/);
            if (!onceMatch || !onceMatch[0]) {
                console.error(`${LOG_PREFIX} 情报分析失败: 未能从页面中提取到 'once' 参数。V2EX页面结构可能已改变。`);
                return;
            }
            const redeemUrl = onceMatch[0];
            console.log(`${LOG_PREFIX} 情报分析成功: 已获取到任务指令 (URL: ${redeemUrl})。`);

            // Stage 2: 执行 - 提交签到请求
            console.log(`${LOG_PREFIX} 阶段2: 正在后台执行签到...`);
            await this.fetchPage(redeemUrl);

            // 任务完成后更新本地记录
            await this.updateLastSignedDate();
        },

        /**
         * @description 封装了 GM_xmlhttpRequest 的通用页面请求函数
         * @param {string} path - The path to fetch (e.g., '/mission/daily')
         * @returns {Promise<string>} - The response text of the page
         */
        fetchPage(path) {
            return new Promise((resolve, reject) => {
                GM_xmlhttpRequest({
                    method: "GET",
                    url: `https://www.v2ex.com${path}`,
                    onload: function(response) {
                        if (response.status >= 200 && response.status < 400) {
                            resolve(response.responseText);
                        } else {
                            reject(new Error(`HTTP Error: ${response.status} ${response.statusText}`));
                        }
                    },
                    onerror: function(error) {
                        reject(new Error(`Network Error: ${error.details}`));
                    },
                    ontimeout: function() {
                        reject(new Error('Request timed out.'));
                    }
                });
            });
        }
    };

    // 启动智能代理
    MissionAgent.init();

})();