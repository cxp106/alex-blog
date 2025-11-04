// ==UserScript==
// @name         虫部落自动签到助手
// @namespace    http://tampermonkey.net/
// @version      1.0.0
// @author       镇沧澜
// @description  当每天第一次访问虫部落任意页面时，自动跳转到签到页面进行签到。
// @match        https://www.chongbuluo.com/*
// @grant        GM_getValue
// @grant        GM_setValue
// @grant        GM_notification
// @grant        GM_xmlhttpRequest
// @run-at       document-start
// ==/UserScript==

;(function () {
  "use strict"

  /**
   * @class Config
   * @description 脚本配置管理模块。
   */
  const Config = {
    SIGN_IN_URL: "https://www.chongbuluo.com/plugin.php?id=wq_sign",
    LAST_SIGN_IN_DATE_KEY: "chongbuluo_last_sign_in_date",
    NOTIFICATION_TIMEOUT: 5000, // 通知显示时长，单位毫秒
  }

  /**
   * @class Utils
   * @description 通用辅助函数模块。
   */
  const Utils = {
    /**
     * @function getTodayDate
     * @description 获取当前日期的字符串表示（YYYY-MM-DD）。
     * @returns {string} 当前日期的字符串。
     */
    getTodayDate() {
      const now = new Date()
      const year = now.getFullYear()
      const month = String(now.getMonth() + 1).padStart(2, "0")
      const day = String(now.getDate()).padStart(2, "0")
      return `${year}-${month}-${day}`
    },

    /**
     * @function isChongbuluoDomain
     * @description 判断当前 URL 是否属于虫部落域名。
     * @param {string} url - 待判断的 URL。
     * @returns {boolean} 如果是虫部落域名则返回 true，否则返回 false。
     */
    isChongbuluoDomain(url) {
      return url.startsWith("https://www.chongbuluo.com/")
    },
  }

  /**
   * @class CoreLogic
   * @description 脚本核心逻辑模块，处理签到判断和执行。
   */
  const CoreLogic = {
    /**
     * @function shouldSignInToday
     * @description 判断今天是否需要签到。
     * @returns {boolean} 如果需要签到则返回 true，否则返回 false。
     */
    shouldSignInToday() {
      const today = Utils.getTodayDate()
      const lastSignInDate = GM_getValue(Config.LAST_SIGN_IN_DATE_KEY, "")
      return today !== lastSignInDate
    },

    /**
     * @function performSignIn
     * @description 执行签到操作。
     * @returns {Promise<void>} 无返回值。
     */
    async performSignIn() {
      GM_notification({
        title: "虫部落自动签到",
        text: "正在跳转到签到页面...",
        timeout: Config.NOTIFICATION_TIMEOUT,
      })

      // 跳转到签到页面
      window.location.href = Config.SIGN_IN_URL

      // 监听签到页面的加载，并尝试点击签到按钮
      // 注意：由于跳转会刷新页面，此处的逻辑需要在签到页面加载完成后执行
      // 因此，这部分逻辑将放在主入口的条件判断中，确保在签到页面时才执行。
    },

    /**
     * @function checkAndClickSignInButton
     * @description 检查签到页面状态并尝试点击签到按钮。
     * @returns {Promise<void>} 无返回值。
     */
    async checkAndClickSignInButton() {
      // 等待页面加载完成，确保 DOM 元素可用
      await new Promise((resolve) => window.addEventListener("load", resolve))

      const signInButton = document.querySelector(".wqpc_sign_btn_red")
      const signedInGreyButton = document.querySelector(".wqpc_sign_btn_grey")

      if (signedInGreyButton) {
        // 如果发现已签到按钮，则直接标记为已签到并返回首页
        GM_notification({
          title: "虫部落自动签到",
          text: "今日已签到，无需重复操作。",
          timeout: Config.NOTIFICATION_TIMEOUT,
        })
        GM_setValue(Config.LAST_SIGN_IN_DATE_KEY, Utils.getTodayDate())
        window.location.href = "https://www.chongbuluo.com/"
        return
      }

      if (signInButton) {
        signInButton.click()

        // 等待模态框出现
        await new Promise((resolve) => setTimeout(resolve, 1000)) // 等待 1 秒，确保模态框加载

        const messageInput = document.querySelector(".wqpc_textarea")
        const submitButton = document.querySelector(".wqpc_button")

        if (messageInput && submitButton) {
          const messages = [
            // 广府菜（经典粤菜）
            "白切鸡",
            "烧鹅",
            "叉烧",
            "煲仔饭",
            "肠粉",
            "虾饺",
            "干炒牛河",
            "云吞面",
            "老火靓汤",
            "豉汁蒸排骨",
            "萝卜牛杂",
            "及第粥",
            "双皮奶",
            "姜撞奶",
            "糯米鸡",
            "蜜汁叉烧包",
            "凤爪",
            "豉油皇炒面",
            "布拉肠粉",
            "生滚粥",

            // 潮汕菜（深圳潮汕人多）
            "潮汕牛肉火锅",
            "牛肉丸",
            "蚝烙",
            "砂锅粥",
            "卤鹅",
            "粿条汤",
            "普宁豆干",
            "反沙芋头",
            "鱼饭",
            "潮汕鱼丸",
            "红桃粿",
            "鼠曲粿",
            "菜脯煎蛋",
            "潮汕打冷",
            "生腌海鲜",

            // 客家菜（深圳客家人多）
            "客家酿豆腐",
            "梅菜扣肉",
            "盐焗鸡",
            "三杯鸭",
            "客家盆菜",
            "艾粄",
            "黄酒鸡",
            "苦笋煲",
            "萝卜粄",
            "客家算盘子",
            "猪肚包鸡",
            "客家焖猪肉",
            "煎酿三宝",
            "客家蛋角煲",
            "客家擂茶",

            // 糖水甜品
            "杨枝甘露",
            "芒果班戟",
            "榴莲千层",
            "芝麻糊",
            "红豆沙",
            "龟苓膏",
            "椰汁西米露",
            "陈皮绿豆沙",
            "杏仁茶",
            "番薯糖水",
            "腐竹白果糖水",
            "椰汁马蹄爽",
            "莲子百合",
            "凤凰奶糊",
            "冰糖炖雪梨",

            // 街头小吃
            "鸡蛋仔",
            "格仔饼",
            "咖喱鱼蛋",
            "碗仔翅",
            "煎酿三宝",
            "炸牛奶",
            "老婆饼",
            "鸡仔饼",
            "钵仔糕",
            "糖不甩",
            "咸水角",
            "炸云吞",
            "酥皮蛋挞",
            "菠萝油",
            "丝袜奶茶",

            // 海鲜类（深圳靠海）
            "清蒸石斑鱼",
            "椒盐濑尿虾",
            "蒜蓉粉丝蒸扇贝",
            "豉椒炒花甲",
            "避风塘炒蟹",
            "白灼基围虾",
            "姜葱炒蟹",
            "酱爆鱿鱼",
            "豆豉鲮鱼油麦菜",
            "鱼头豆腐汤",

            // 其他特色
            "深井烧鹅",
            "腊味煲仔饭",
            "陈皮骨",
            "芋头扣肉",
            "豉油鸡",
            "鱼皮饺",
            "牛三星",
            "猪脚姜",
            "马拉糕",
            "萝卜糕",
          ]
          const randomMessage = messages[Math.floor(Math.random() * messages.length)]
          messageInput.value = randomMessage
          setTimeout(() => {
            submitButton.click()

            GM_notification({
              title: "虫部落自动签到",
              text: "签到成功！",
              timeout: Config.NOTIFICATION_TIMEOUT,
            })
            GM_setValue(Config.LAST_SIGN_IN_DATE_KEY, Utils.getTodayDate())
          }, 2000)
        } else {
          GM_notification({
            title: "虫部落自动签到",
            text: "未找到签到留言框或提交按钮，请手动签到。",
            timeout: Config.NOTIFICATION_TIMEOUT,
          })
        }
      } else {
        GM_notification({
          title: "虫部落自动签到",
          text: "未找到签到按钮或页面结构异常。",
          timeout: Config.NOTIFICATION_TIMEOUT,
        })
      }

      const signedInText = document.querySelector('.wqpc_sign_btn_grey')

      if (signInButton && !signedInText) {
        // 确保按钮可见且未签到
        signInButton.click()
        // GM_notification({
        //     title: '虫部落自动签到',
        //     text: '签到按钮已点击！',
        //     timeout: Config.NOTIFICATION_TIMEOUT
        // });
        // GM_setValue(Config.LAST_SIGN_IN_DATE_KEY, Utils.getTodayDate());
      } else if (signedInText) {
        // GM_notification({
        //   title: "虫部落自动签到",
        //   text: "今日已签到，无需重复操作。",
        //   timeout: Config.NOTIFICATION_TIMEOUT,
        // })
        // GM_setValue(Config.LAST_SIGN_IN_DATE_KEY, Utils.getTodayDate()) // 确保已签到状态也更新日期
      } else {
        GM_notification({
          title: "虫部落自动签到",
          text: "未找到签到按钮或页面结构异常。",
          timeout: Config.NOTIFICATION_TIMEOUT,
        })
      }
    },
  }

  /**
   * @function main
   * @description 脚本主入口函数。
   */
  async function main() {
    // 确保 #nv_forum 的 background-image 永远为 none，通过注入 CSS 规则实现
    const style = document.createElement('style');
    style.type = 'text/css';
    style.innerHTML = '#nv_forum { background-image: none !important; }';
    document.head.appendChild(style);
    // 如果当前页面是签到页面
    if (window.location.href.startsWith(Config.SIGN_IN_URL)) {
      await CoreLogic.checkAndClickSignInButton()
    } else if (Utils.isChongbuluoDomain(window.location.href)) {
      // 如果是虫部落的其他页面，且今天需要签到
      if (CoreLogic.shouldSignInToday()) {
        await CoreLogic.performSignIn()
      }
    }
  }

  // 页面加载时执行主函数
  main()
})()
