// ==UserScript==
// @name         移动端微软Rewards每日任务脚本 (Stendhal 重构版)
// @version      2025.8.31
// @description  由 Stendhal 重构，注入了持久化状态机灵魂。精确、可靠、可控。
// @author       镇沧澜
// @match        https://*.bing.com/*
// @license      GNU GPLv3
// @icon         https://www.bing.com/favicon.ico
// @connect      api.pearktrue.cn
// @connect      zj.v.api.aa1.cn
// @run-at       document-end
// @grant        GM_registerMenuCommand
// @grant        GM_setValue
// @grant        GM_getValue
// @grant        GM_xmlhttpRequest
// @namespace    Stendhal.Reforged
// ==/UserScript==

// PHILOSOPHY:
// 一个脚本的价值，不在于其代码行数，而在于其逻辑的严谨性。此脚本的核心被重塑为一个“跨页面状态机”。
// 它不再是每次加载都重新运行的无头苍蝇，而是一个拥有记忆的实体。通过将任务状态（是否运行、进度、关键词列表）
// 持久化存储，脚本在每次页面加载时都能精确地知道自己要做什么：是继续执行任务，还是静默等待命令。
// 这种架构从根本上解决了逻辑冲突与重复执行的问题，赋予了脚本前所未有的可靠性。

(function () {
    'use strict';

    /**
     * @description 全局配置
     */
    const CONFIG = {
        MAX_REWARDS: 30, // 重复执行的总次数
        PAUSE_INTERVAL: 5, // 每执行 N 次搜索后暂停
        PAUSE_DURATION_MS: 1.2 * 60 * 1000, // 暂停时长 (9分钟)
        STATE_STORAGE_KEY: 'BING_REWARDS_STATE', // GM存储键
        // API列表，用于获取搜索词
        API_LIST: [
            {
                url: `https://api.pearktrue.cn/api/dailyhot/?title=${'哔哩哔哩，百度，知乎，百度贴吧，少数派，IT之家，澎湃新闻，今日头条，36氪，稀土掘金，腾讯新闻'.split('，').sort(() => Math.random() - 0.5)[6]}`,
                handler: (data) => data.data.map(item => item.title)
            },
            {
                url: 'https://zj.v.api.aa1.cn/api/wenan-shici/?type=json',
                handler: (data) => data.msg.split('——')
            },
            {
                url: `https://api.pearktrue.cn/api/guide/?keyword=${["宠物","糖果","窗帘","架子","机械","用品","手工","工具","试纸","烹饪","智能","配件","胶棒","洗衣","地板","器材","胶带","甜瓜","雨衣","黑蒜","精华","台灯","套装","方法","温度","材料","罩子","书法","彩票","菜谱","烤箱"].sort(() => Math.random() - 0.5)[6]}`,
                handler: (data) => data.data
            },
        ]
    };

    /**
     * @description 统一的状态管理器，负责所有持久化数据的读写
     */
    const StateManager = {
        /**
         * 获取当前状态
         * @returns {{isRunning: boolean, count: number, keywords: string[]}}
         */
        getState: () => {
            const stateStr = GM_getValue(CONFIG.STATE_STORAGE_KEY, '{}');
            const defaults = { isRunning: false, count: 0, keywords: [] };
            try {
                return { ...defaults, ...JSON.parse(stateStr) };
            } catch (e) {
                return defaults;
            }
        },
        /**
         * 保存状态
         * @param {object} newState - 新的状态对象
         */
        setState: (newState) => {
            const currentState = StateManager.getState();
            const updatedState = { ...currentState, ...newState };
            GM_setValue(CONFIG.STATE_STORAGE_KEY, JSON.stringify(updatedState));
        },
        /**
         * 清理所有状态，恢复到初始
         */
        clearState: () => {
            GM_setValue(CONFIG.STATE_STORAGE_KEY, '{}');
            console.log('[Stendhal] 状态已重置.');
        }
    };

    /**
     * @description 动作控制器，执行具体任务
     */
    const ActionController = {
        /**
         * 开始一个新任务
         */
        async startTask() {
            if (StateManager.getState().isRunning) {
                alert('任务已在运行中。请先强制停止任务。');
                return;
            }
            console.log('[Stendhal] 开始获取搜索关键词...');
            const keywords = await Utils.fetchKeywords();

            if (!keywords || keywords.length === 0) {
                alert('获取搜索关键词失败，请检查网络或API。任务无法开始。');
                console.error('[Stendhal] 关键词列表为空，任务终止。');
                return;
            }

            console.log(`[Stendhal] 成功获取 ${keywords.length} 个关键词。准备开始任务...`);
            StateManager.setState({ isRunning: true, count: 0, keywords: keywords.sort(() => Math.random() - 0.5) });
            this.performNextSearch();
        },

        /**
         * 继续当前任务（在页面加载时由主路由调用）
         */
        continueTask() {
            const state = StateManager.getState();

            // 滚动页面
            Utils.smoothScrollToBottom().then(() => {
                console.log('[Stendhal] 页面滚动完成。');
                // 执行下一次搜索
                this.performNextSearch();
            });
        },

        /**
         * 执行下一次搜索的核心逻辑
         */
        performNextSearch() {
            const state = StateManager.getState();
            const { count, keywords } = state;

            // 检查任务是否完成
            if (count >= CONFIG.MAX_REWARDS) {
                console.log('[Stendhal] 任务完成！');
                document.title = `[任务完成] ${document.title}`;
                StateManager.clearState();
                return;
            }

            const nowtxt = keywords[count % keywords.length]; // 循环使用关键词
            const randomDelay = Math.floor(Math.random() * 20000) + 10000; // 10-30秒随机延迟

            console.log(`[Stendhal] 第 ${count + 1}/${CONFIG.MAX_REWARDS} 次搜索。关键词: "${nowtxt}". ${randomDelay / 1000}秒后执行...`);
            document.title = `[运行中 ${count + 1}/${CONFIG.MAX_REWARDS}] ${nowtxt}`;

            // 判断是否需要暂停
            if ((count + 1) % CONFIG.PAUSE_INTERVAL === 0) {
                console.warn(`[Stendhal] 已达到 ${CONFIG.PAUSE_INTERVAL} 次搜索，将暂停 ${CONFIG.PAUSE_DURATION_MS / 60000} 分钟。`);
                Utils.updateTitleWithCountdown(CONFIG.PAUSE_DURATION_MS);
                setTimeout(() => {
                    this.navigateToSearch(nowtxt, count);
                }, CONFIG.PAUSE_DURATION_MS);
            } else {
                setTimeout(() => {
                    this.navigateToSearch(nowtxt, count);
                }, randomDelay);
            }
        },

        /**
         * 更新状态并导航到新的搜索页面
         * @param {string} keyword - 搜索词
         * @param {number} currentCount - 当前的计数值
         */
        navigateToSearch(keyword, currentCount) {
            // 在导航前更新状态
            StateManager.setState({ count: currentCount + 1 });

            const randomString = Utils.generateRandomString(4);
            const randomCvid = Utils.generateRandomString(32);

            // 前半段任务用 www.bing.com，后半段用 cn.bing.com
            const domain = currentCount <= CONFIG.MAX_REWARDS / 2 ? 'www.bing.com' : 'cn.bing.com';

            location.href = `https://${domain}/search?q=${encodeURIComponent(keyword)}&form=${randomString}&cvid=${randomCvid}`;
        }
    };

    /**
     * @description 工具函数集合
     */
    const Utils = {
        generateRandomString: (length) => {
            const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
            return Array.from({ length }, () => characters.charAt(Math.floor(Math.random() * characters.length))).join('');
        },
        smoothScrollToBottom: () => {
            return new Promise(resolve => {
                const distance = document.body.scrollHeight - window.innerHeight;
                const duration = Math.random() * 2000 + 1000; // 1-3秒的随机滚动时间
                let start = null;

                window.requestAnimationFrame(function step(timestamp) {
                    if (!start) start = timestamp;
                    const progress = timestamp - start;
                    const percentage = Math.min(progress / duration, 1);
                    window.scrollTo(0, distance * percentage);
                    if (progress < duration) {
                        window.requestAnimationFrame(step);
                    } else {
                        resolve();
                    }
                });
            });
        },
        fetchKeywords: async () => {
            let allKeywords = [];
            for (const api of CONFIG.API_LIST) {
                try {
                    const response = await new Promise((resolve, reject) => {
                        GM_xmlhttpRequest({
                            method: 'GET',
                            url: api.url,
                            timeout: 5000,
                            onload: (res) => {
                                if (res.status === 200) resolve(JSON.parse(res.responseText));
                                else reject(new Error(`HTTP ${res.status}`));
                            },
                            onerror: reject,
                            ontimeout: reject
                        });
                    });
                    const processedKeywords = api.handler(response);
                    if (Array.isArray(processedKeywords) && processedKeywords.length > 0) {
                        allKeywords = allKeywords.concat(processedKeywords);
                    }
                } catch (error) {
                    console.error(`[Stendhal] API请求失败: ${api.url}`, error.message);
                }
            }
            return allKeywords.filter(Boolean); // 过滤掉空字符串或null
        },
        updateTitleWithCountdown(duration) {
            let remaining = duration;
            const interval = setInterval(() => {
                remaining -= 1000;
                if (remaining <= 0) {
                    clearInterval(interval);
                    return;
                }
                const minutes = Math.floor(remaining / 60000);
                const seconds = Math.floor((remaining % 60000) / 1000).toString().padStart(2, '0');
                document.title = `[暂停中 ${minutes}:${seconds}] ...`;
            }, 1000);
        }
    };

    /**
     * @description 主路由，脚本的唯一入口点
     */
    function MainRouter() {
        const state = StateManager.getState();

        // 如果任务正在运行，并且当前页面是搜索结果页，则继续任务
        if (state.isRunning && window.location.pathname.includes('/search')) {
            ActionController.continueTask();
        } else {
            // 否则，脚本处于空闲状态，等待用户通过菜单启动
            console.log('[Stendhal] 脚本空闲，等待指令...');
            const state = StateManager.getState();
            if (state.isRunning) {
                 document.title = `[任务暂停中 ${state.count}/${CONFIG.MAX_REWARDS}]`;
            }
        }
    }

    // --- 脚本启动 ---
    GM_registerMenuCommand('开始执行任务', ActionController.startTask.bind(ActionController));
    GM_registerMenuCommand('强制停止/重置任务', () => {
        StateManager.clearState();
        alert('任务状态已清除。您可以重新开始任务。');
        location.reload();
    });

    MainRouter();

})();