// ==UserScript==
// @name         问小白自动签到
// @namespace    http://tampermonkey.net/
// @version      1.0.0
// @description  访问问小白任意页面时自动签到，签到成功后不再重复执行。
// @author       镇沧澜
// @match        https://www.wenxiaobai.com/*
// @grant        GM_setValue
// @grant        GM_getValue
// @grant        GM_xmlhttpRequest
// @run-at       document-start
// ==/UserScript==

(function() {
    'use strict';

    /**
     * @constant {string} SIGN_IN_URL - 签到页面的URL。
     */
    const SIGN_IN_URL = 'https://www.wenxiaobai.com/chat/payment';

    /**
     * @constant {string} LAST_SIGN_IN_DATE_KEY - 用于存储上次签到日期的GM_setValue键名。
     */
    const LAST_SIGN_IN_DATE_KEY = 'wenxiaobai_last_sign_in_date';

    /**
     * @class Config
     * @description 负责管理脚本的配置和持久化数据。
     */
    class Config {
        /**
         * @method getLastSignInDate
         * @description 获取上次签到日期。
         * @returns {Promise<string|null>} 返回上次签到日期字符串（YYYY-MM-DD格式）或null。
         */
        static async getLastSignInDate() {
            return GM_getValue(LAST_SIGN_IN_DATE_KEY, null);
        }

        /**
         * @method setLastSignInDate
         * @description 设置上次签到日期为今天。
         * @returns {Promise<void>} 无返回值。
         */
        static async setLastSignInDate() {
            const today = new Date().toISOString().slice(0, 10); // YYYY-MM-DD
            await GM_setValue(LAST_SIGN_IN_DATE_KEY, today);
        }

        /**
         * @method hasSignedInToday
         * @description 检查今天是否已经签到。
         * @returns {Promise<boolean>} 如果今天已签到，返回true；否则返回false。
         */
        static async hasSignedInToday() {
            const lastSignInDate = await Config.getLastSignInDate();
            const today = new Date().toISOString().slice(0, 10);
            return lastSignInDate === today;
        }
    }

    /**
     * @class UI
     * @description 负责与页面UI交互，包括查找元素和模拟点击。
     */
    class UI {
        /**
         * @method findSignInButton
         * @description 查找签到按钮。
         * @returns {Promise<HTMLElement|null>} 返回签到按钮元素或null。
         */
        static async findSignInButton() {
            return new Promise(resolve => {
                const checkButton = () => {
                    const button = document.querySelector('.SignPopup_signBtn__5H1Dk');
                    if (button) {
                        resolve(button);
                    } else {
                        // 如果按钮不存在，可能是弹窗未加载或已签到，等待一段时间再检查
                        setTimeout(checkButton, 500); // 每500ms检查一次
                    }
                };
                checkButton();
            });
        }

        /**
         * @method clickElement
         * @description 模拟点击指定元素。
         * @param {HTMLElement} element - 要点击的DOM元素。
         */
        static clickElement(element) {
            if (element) {
                element.click();
                console.log('Stendhal: 签到按钮已点击。');
            }
        }
    }

    /**
     * @class CoreLogic
     * @description 包含脚本的核心业务逻辑。
     */
    class CoreLogic {
        /**
         * @method init
         * @description 初始化脚本，判断是否需要执行签到。
         */
        static async init() {
            console.log('Stendhal: 问小白自动签到脚本启动。');

            if (await Config.hasSignedInToday()) {
                console.log('Stendhal: 今天已签到，无需重复操作。');
                return;
            }

            // 如果当前页面不是签到页面，则通过GM_xmlhttpRequest访问签到页面
            if (window.location.href !== SIGN_IN_URL) {
                console.log(`Stendhal: 当前页面不是签到页面，正在后台访问 ${SIGN_IN_URL} 进行签到。`);
                GM_xmlhttpRequest({
                    method: 'GET',
                    url: SIGN_IN_URL,
                    onload: async function(response) {
                        console.log('Stendhal: 签到页面后台加载完成。');
                        // 由于GM_xmlhttpRequest无法直接操作DOM，这里需要模拟签到逻辑
                        // 实际签到操作可能需要更复杂的POST请求或解析返回的HTML来找到签到API
                        // 考虑到用户需求是“访问即签到”，且签到按钮在页面加载后才出现弹窗中
                        // 最直接的方式是导航到签到页面进行操作。
                        // 因此，这里我们直接导航到签到页面，而不是后台请求。
                        // 如果用户希望完全后台静默，则需要分析签到请求的API。
                        // 为了简化并满足“访问即签到”的直观需求，我们选择导航。
                        window.location.href = SIGN_IN_URL;
                    },
                    onerror: function(response) {
                        console.error('Stendhal: 后台访问签到页面失败:', response.status, response.statusText);
                    }
                });
                return;
            }

            // 如果当前页面就是签到页面，则尝试点击签到按钮
            console.log('Stendhal: 正在签到页面查找签到按钮...');
            const signInButton = await UI.findSignInButton();
            if (signInButton) {
                UI.clickElement(signInButton);
                await Config.setLastSignInDate();
                console.log('Stendhal: 签到操作完成，已记录签到状态。');
            } else {
                console.warn('Stendhal: 未找到签到按钮，可能已签到或页面结构发生变化。');
                // 如果未找到按钮，但已在签到页面，且今天未记录签到，
                // 可能是签到弹窗未弹出或已自动签到，此时也记录为已签到，避免重复尝试。
                await Config.setLastSignInDate();
                console.log('Stendhal: 鉴于未找到签到按钮，已将今天标记为已签到状态。');
            }
        }
    }

    // 脚本入口
    CoreLogic.init();
})();