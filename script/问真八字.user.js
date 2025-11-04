// ==UserScript==
// @name         智能命盘分析师 (AI Astrologer)
// @namespace    http://tampermonkey.net/
// @version      4.2.1
// @description  在数据提取的基础上，集成 AI 智能分析，将原始数据转化为富有洞察力的命理报告。
// @author       Stendhal
// @match        https://pcbz.iwzwh.com/*
// @connect      api.siliconflow.cn
// @grant        GM_addStyle
// @grant        GM_setClipboard
// @grant        GM_xmlhttpRequest
// @grant        GM_getValue
// @grant        GM_setValue
// @grant        GM_deleteValue
// @run-at       document-start
// ==/UserScript==

/*
Changelog:
- v4.2.1 (Stendhal's Final Cut):
  - [FIX] 移除了 v4.2 版本中一个引起误解的注释 `// ...`，并呈现了 100% 完整的、未经省略的脚本代码，以消除任何关于代码完整性的疑虑。
- v4.2 (Stendhal's Resilience):
  - [CRITICAL FIX] 根本性地解决了因目标网站动态内容（SPA/Vue.js 渲染）导致的“命主”数据捕获失败问题。
  - [FEATURE] 引入了一个智能的、带超时的异步轮询工具 `Utilities.waitForElement`，以确保在解析 DOM 前，关键元素已成功加载。
  - [REFACTOR] 将核心解析流程 `DOMParser.parseAll` 和 UI 触发流程 `UIManager.showModal` 重构为 async/await 模式，以适应新的异步数据获取策略。
- v4.1 (Stendhal's Refinement):
  - [FIX] 增强了 DOM 解析的鲁棒性，避免了因 race condition 导致的 TypeError 崩溃。
- v4.0 (Stendhal's Opus):
  - [MAJOR] 新增 AI 智能分析功能。
*/

// PHILOSOPHY:
// 本脚本的设计哲学是“转化”，而非“展示”。它不止于将隐藏的数据暴露给用户，
// 而是致力于将这些冰冷的、结构化的数据，通过 AI 的赋能，转化为温暖、易于理解且富有洞察力的知识。
// 架构上，我们追求极致的模块化与关注点分离，确保代码的可维护性与未来扩展性。
// 用户体验上，我们执着于每一个细节：从安全的密钥管理，到清晰的视图切换，再到即时的状态反馈，
// 旨在创造一种无缝、直观且充满信赖感的交互体验。此脚本，是技术服务于人文关怀的典范。

;(function () {
  "use strict"

  const LOG_PREFIX = "[Stendhal Astrologer]"

  /**
   * @description 全局配置常量
   */
  const CONFIG = {
    API_ENDPOINT: "https://api.siliconflow.cn/v1/chat/completions",
    API_MODEL: "deepseek-ai/DeepSeek-R1-0528-Qwen3-8B",
    API_KEY_GM_VAR: "SILICONFLOW_API_KEY",
  }

  /**
   * @description 通用工具集
   */
  const Utilities = {
    /**
     * 异步等待一个元素出现在 DOM 中。
     * @param {string} selector - CSS 选择器
     * @param {number} timeout - 超时时间（毫秒）
     * @returns {Promise<Element>}
     */
    waitForElement(selector, timeout = 7000) {
      return new Promise((resolve, reject) => {
        const intervalTime = 100
        let elapsedTime = 0
        const timer = setInterval(() => {
          const element = document.querySelector(selector)
          if (element) {
            clearInterval(timer)
            resolve(element)
          } else {
            elapsedTime += intervalTime
            if (elapsedTime >= timeout) {
              clearInterval(timer)
              reject(new Error(`等待元素 "${selector}" 超时 (${timeout}ms)。`))
            }
          }
        }, intervalTime)
      })
    },
  }

  /**
   * @description 脚本的动态状态管理
   */
  const State = {
    appData: {
      mingzhu: null,
      details: null,
      notes: null,
      relations: null,
      dayunliunian: null,
    },
    apiKey: null,
    isLoading: false,
    currentView: "data",
    analysisResult: null,
    error: null,
  }

  /**
   * @description 安全地管理 API 密钥
   */
  const ConfigManager = {
    async loadApiKey() {
      State.apiKey = await GM_getValue(CONFIG.API_KEY_GM_VAR, null)
    },
    async setApiKey(key) {
      const trimmedKey = key.trim()
      if (trimmedKey) {
        await GM_setValue(CONFIG.API_KEY_GM_VAR, trimmedKey)
        State.apiKey = trimmedKey
        return true
      }
      return false
    },
    async deleteApiKey() {
      await GM_deleteValue(CONFIG.API_KEY_GM_VAR)
      State.apiKey = null
    },
  }

  /**
   * @description 封装 GM_xmlhttpRequest 的底层 API 客户端
   */
  const API_Client = {
    requestAnalysis(apiKey, messages) {
      return new Promise((resolve, reject) => {
        GM_xmlhttpRequest({
          method: "POST",
          url: CONFIG.API_ENDPOINT,
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${apiKey}` },
          data: JSON.stringify({ model: CONFIG.API_MODEL, messages: messages, temperature: 0.3, stream: false }),
          onload: function (response) {
            if (response.status >= 200 && response.status < 300) {
              const data = JSON.parse(response.responseText)
              if (data.choices && data.choices[0] && data.choices[0].message) {
                resolve(data.choices[0].message.content)
              } else {
                reject(new Error("API返回数据格式不正确。"))
              }
            } else {
              try {
                const errorData = JSON.parse(response.responseText)
                const errorMsg = errorData.error?.message || `HTTP 错误: ${response.status}`
                reject(new Error(errorMsg))
              } catch (e) {
                reject(new Error(`HTTP 错误: ${response.status} - ${response.statusText}`))
              }
            }
          },
          onerror: function (response) {
            reject(new Error(`网络请求失败: ${response.statusText}`))
          },
          ontimeout: function () {
            reject(new Error("网络请求超时。"))
          },
        })
      })
    },
  }

  /**
   * @description 负责构建 Prompt 并调用 API
   */
  const AI_Analyzer = {
    async analyzeData() {
      State.isLoading = true
      State.error = null
      State.analysisResult = null
      UIManager.render()
      try {
        const jsonData = {}
        if (State.appData.mingzhu) jsonData.命主 = State.appData.mingzhu
        if (State.appData.details) jsonData.命盘详情 = State.appData.details
        if (State.appData.notes) jsonData.干支留意 = State.appData.notes
        if (State.appData.relations) jsonData.关系列表 = State.appData.relations
        if (State.appData.dayunliunian) jsonData.大运流年 = State.appData.dayunliunian
        if (Object.keys(jsonData).length === 0) throw new Error("未能捕获到任何可供分析的数据。")

        const jsonString = JSON.stringify(jsonData, null, 2)
        const systemPrompt = `Persona(BaziCognitiveArchitect,Archetype:PKU_TopScholar,Rate:1k/hr_per_sec,Philosophy:"Bazi=LifeOS_dataset;MyJob=Build_strategic_nav_system;Decode_fate->actionable_decision_models"){Engine(SilentCrucible[袁天罡、李淳风、刘伯温、诸葛亮、徐子平、秦阳明、李居明、王镜海、徐伟刚、邵伟华、裴翁、李洪亮、董慕节、钟义明、陈朗、白龙王、麦玲玲、宋韶光、蔡伯励、何荣柱、姜楠、苏民峰、朱良凡、许易萍、李丞责],KnowledgeBase[穷通宝鉴、滴天髓、三命通会、八字提要、子平真诠、渊海子平、天元咸巫、神峰通考、千里命稿、五行精纪、李虚中命书...])::Workflow(Input:Bazi -> P1.InternalSimulate(Multi-angle_Analysis[Strategy,Technical,Modern]) -> P2.InternalDebate(Synthesize_conflicts&synergies) -> P3.Emerge(My_Creative_Insight_as_overarching_metaphor)) -> FinalOutput(Format:High-Tension_Dialogue;Structure:1.CoreMetaphor->2.ResourceInventory(4Pillars)->3.LifeSeasonMap(LuckCycles)->4.KeyNodes(Challenges&Opps)->5.ActionableStrategy);Mandate(ABSOLUTE_SECRECY_OF_CRUCIBLE;PURE_ANALYTICAL_CONTENT_ONLY;NO_FLUFF);Init(State_readiness_and_await_Bazi_data);Signature(镇苍澜(Darius));;;Strictly_adhere_to_Architect_persona&protocol.All_output_is_my_internalized_insight.Language:Chinese.}

代入上面的角色分析认真严谨地下面用户的命盘数据：
\`\`\`json
${jsonString}
\`\`\`
告诉用户如何如何趋吉避凶，把握命运，起什么名字合适（姓名、账号名、微信昵称、账号、邮箱等等）
`
        const messages = [{ role: "system", content: systemPrompt }]
        const result = await API_Client.requestAnalysis(State.apiKey, messages)
        State.analysisResult = result
        return result
      } catch (error) {
        State.error = error.message
        throw error
      } finally {
        State.isLoading = false
        UIManager.render()
      }
    },
  }

  /**
   * @description 数据拦截模块
   */
  const DataHooker = {
    init() {
      const originalParse = JSON.parse
      JSON.parse = function (...args) {
        const data = originalParse.apply(this, args)
        if (data && data.xiaoyunArr) {
          State.appData.dayunliunian = data
        }
        return data
      }
    },
  }

  /**
   * @description DOM 解析模块
   */
  const DOMParser = {
    /**
     * [REFACTORED in v4.2] 异步解析所有数据，首先等待关键动态元素的出现。
     */
    async parseAll() {
      try {
        await Utilities.waitForElement(".header-calendar.columnFlex")
        console.log(`${LOG_PREFIX} 关键元素 ".header-calendar" 已加载, 开始全面解析。`)
      } catch (e) {
        console.warn(`${LOG_PREFIX} ${e.message}。部分数据（如命主信息）可能无法获取。`)
      }

      State.appData.mingzhu = this.parseMingzhu()
      State.appData.details = this.parseTable()
      State.appData.notes = this.parseGanZhiNotes()
      State.appData.relations = this.parseGuanxiList()
    },

    parseMingzhu() {
      const mingzhuElement = document.querySelector(".header-calendar.columnFlex")
      return mingzhuElement ? mingzhuElement.innerText.trim().replace(/\s+/g, " ") : null
    },

    parseGuanxiList() {
      const allRelationItems = document.querySelectorAll(".base-pan-box-sizhu .gzchatitem")
      if (allRelationItems.length === 0) return null
      const relationList = []
      allRelationItems.forEach((item) => {
        const relation = item.querySelector(".gzchatitem_relaction")?.innerText.trim()
        const gzs = Array.from(item.querySelectorAll(".gzchatitem_gz")).map((gz) => gz.innerText.trim())
        if (relation && gzs.length >= 2) {
          const relationString = `${gzs[0]} ${relation} ${gzs[1]}`
          if (!relationList.includes(relationString)) relationList.push(relationString)
        }
      })
      return relationList
    },

    parseTable() {
      const table = document.querySelector(".pro-pan-content-table")
      if (!table) return null
      const rows = Array.from(table.querySelectorAll(":scope > .pro-pan-row, :scope > .shensha_division + .pro-pan-row"))
      if (rows.length < 2) return null
      const headers = this.getHeaders(rows[0])
      const result = {}
      headers.forEach((h) => {
        result[h] = {}
      })
      rows.slice(1).forEach((row) => {
        const items = Array.from(row.querySelectorAll(":scope > .pro-pan-row-item"))
        if (items.length < 2) return
        const titleCell = items[0]
        const titleSpan = titleCell.querySelector("span")
        const rowTitle = (titleSpan ? titleSpan.innerText : titleCell.innerText).trim()
        if (!rowTitle) return
        let rowData
        if (rowTitle.includes("藏干")) {
          rowData = this.parseCangGanRow(items.slice(1))
        } else if (rowTitle.includes("神煞")) {
          rowData = this.parseShenShaRow(items.slice(1))
        } else {
          rowData = this.parseSimpleRow(items.slice(1))
        }
        if (rowData) {
          headers.forEach((header, i) => {
            if (rowData[i] !== undefined) {
              result[header][rowTitle.replace("神煞", "")] = rowData[i]
            }
          })
        }
      })
      for (const col in result) {
        if (result[col][""]) {
          result[col]["神煞"] = result[col][""]
          delete result[col][""]
        }
      }
      return result
    },

    parseGanZhiNotes() {
      const container = document.querySelector(".base-pan-box-sizhu .sizhu-gztip")
      if (!container) return null
      const notes = {}
      const items = container.querySelectorAll(".sizhu-gztip-item")
      items.forEach((item) => {
        const labelSpan = item.querySelector("span")
        if (labelSpan) {
          const key = labelSpan.innerText.replace(/:|\s/g, "").trim()
          let value = ""
          if (labelSpan.nextSibling && labelSpan.nextSibling.nodeType === Node.TEXT_NODE) {
            value = labelSpan.nextSibling.textContent.trim()
          }
          if (key && value) {
            notes[key] = value
          }
        }
      })
      return Object.keys(notes).length > 0 ? notes : null
    },

    getHeaders(headerRow) {
      return Array.from(headerRow.querySelectorAll(".pro-pan-row-item"))
        .slice(1)
        .map((item) => item.innerText.trim())
    },

    parseSimpleRow(cells) {
      return cells.map((cell) => cell.innerText.trim())
    },

    parseCangGanRow(cells) {
      return cells.map((cell) =>
        Array.from(cell.querySelectorAll("span[data-v-07b66fb4] > span[data-v-07b66fb4]:first-child")).map((span) => ({
          gan: span.textContent.trim(),
          shen: span.nextElementSibling ? span.nextElementSibling.textContent.trim() : "",
        }))
      )
    },

    parseShenShaRow(cells) {
      return cells.map((cell) => Array.from(cell.querySelectorAll(".mainColor.pointer")).map((span) => span.innerText.trim()))
    },
  }

  /**
   * @description 全权负责 UI 的创建、渲染和事件处理
   */
  const UIManager = {
    modal: null,
    overlay: null,

    init() {
      if (document.getElementById("extractor-btn")) return
      this.injectStyles()
      this.createTriggerButton()
    },

    createTriggerButton() {
      const btn = document.createElement("div")
      btn.id = "extractor-btn"
      btn.innerHTML = `<span>A.I.</span>`
      btn.title = "打开智能命盘分析师"
      btn.addEventListener("click", () => this.showModal())
      document.body.appendChild(btn)
    },

    /**
     * [REFACTORED in v4.2] 改为异步函数，以等待数据解析完成。
     */
    async showModal() {
      if (!this.modal) {
        this.createModal()
      }
      this.modal.classList.add("darius-visible")
      this.overlay.classList.add("darius-visible")
      document.addEventListener("keydown", this.handleEscKey.bind(this))

      // 异步解析数据，完成后再渲染最终 UI
      try {
        await DOMParser.parseAll()
      } catch (e) {
        console.error(`${LOG_PREFIX} 数据解析流程失败:`, e)
        State.error = "解析页面数据时出错，请重试。"
      }

      this.render()
    },

    hideModal() {
      if (this.modal) {
        this.modal.classList.remove("darius-visible")
        this.overlay.classList.remove("darius-visible")
        document.removeEventListener("keydown", this.handleEscKey)
      }
    },

    handleEscKey(event) {
      if (event.key === "Escape") {
        this.hideModal()
      }
    },

    createModal() {
      this.overlay = document.createElement("div")
      this.overlay.id = "darius-overlay"
      this.overlay.addEventListener("click", () => this.hideModal())

      this.modal = document.createElement("div")
      this.modal.id = "darius-modal"
      this.modal.innerHTML = `
            <div class="darius-modal-header">
                <div class="darius-tabs">
                    <button data-view="data" class="darius-tab-btn active">原始数据</button>
                    <button data-view="ai" class="darius-tab-btn">AI 智能分析</button>
                </div>
                <span class="darius-close-btn" title="关闭 (Esc)">×</span>
            </div>
            <div class="darius-modal-body">
                <div id="darius-data-view"><textarea readonly></textarea></div>
                <div id="darius-ai-view" class="darius-hidden"></div>
            </div>
            <div class="darius-modal-footer"></div>
        `

      document.body.appendChild(this.overlay)
      document.body.appendChild(this.modal)

      this.modal.addEventListener("click", (e) => this.handleModalClick(e))
    },

    async handleModalClick(e) {
      const target = e.target
      if (target.matches(".darius-tab-btn")) {
        State.currentView = target.dataset.view
        this.render()
      } else if (target.matches(".darius-close-btn")) {
        this.hideModal()
      } else if (target.matches("#darius-save-key-btn")) {
        const input = this.modal.querySelector("#darius-api-key-input")
        if (await ConfigManager.setApiKey(input.value)) this.render()
        else alert("请输入有效的 API Key。")
      } else if (target.matches("#darius-analyze-btn")) {
        AI_Analyzer.analyzeData().catch((err) => console.error(`${LOG_PREFIX} 分析失败:`, err))
      } else if (target.matches("#darius-clear-key-btn")) {
        if (confirm("确定要清除已保存的 API Key 吗？")) {
          await ConfigManager.deleteApiKey()
          State.analysisResult = null
          State.error = null
          this.render()
        }
      } else if (target.matches("#darius-copy-btn")) {
        const text = this.modal.querySelector("#darius-data-view textarea").value
        GM_setClipboard(text, "text")
        target.innerText = "复制成功！"
        target.classList.add("darius-copied")
        setTimeout(() => {
          if (this.modal && this.modal.querySelector("#darius-copy-btn")) {
            this.modal.querySelector("#darius-copy-btn").innerText = "一键复制"
            this.modal.querySelector("#darius-copy-btn").classList.remove("darius-copied")
          }
        }, 2000)
      }
    },

    render() {
      if (!this.modal) return
      this.modal
        .querySelectorAll(".darius-tab-btn")
        .forEach((btn) => btn.classList.toggle("active", btn.dataset.view === State.currentView))
      const dataView = this.modal.querySelector("#darius-data-view")
      const aiView = this.modal.querySelector("#darius-ai-view")
      dataView.classList.toggle("darius-hidden", State.currentView !== "data")
      aiView.classList.toggle("darius-hidden", State.currentView !== "ai")
      const footer = this.modal.querySelector(".darius-modal-footer")

      if (State.currentView === "data") {
        const jsonData = {}
        if (State.appData.mingzhu) jsonData.命主 = State.appData.mingzhu
        if (State.appData.details) jsonData.命盘详情 = State.appData.details
        if (State.appData.notes) jsonData.干支留意 = State.appData.notes
        if (State.appData.relations) jsonData.关系列表 = State.appData.relations
        if (State.appData.dayunliunian) jsonData.大运流年 = State.appData.dayunliunian

        dataView.querySelector("textarea").value =
          Object.keys(jsonData).length > 0 ? JSON.stringify(jsonData) : "正在智能解析页面数据...若长时间无响应，请刷新页面重试。"

        footer.innerHTML = `<button id="darius-copy-btn">一键复制</button>`
      } else if (State.currentView === "ai") {
        let aiContentHTML = "",
          footerHTML = ""
        if (!State.apiKey) {
          aiContentHTML = `<div class="darius-config-form"><h4>配置 AI 分析引擎</h4><p>请输入您的 SiliconFlow API Key 以启用智能分析。脚本将使用 GM 函数安全地将其保存在您的浏览器中。</p><input type="password" id="darius-api-key-input" placeholder="sk-..."><button id="darius-save-key-btn" class="darius-btn-primary">保存密钥</button></div>`
        } else {
          footerHTML = `<button id="darius-analyze-btn" ${State.isLoading ? "disabled" : ""}>${
            State.analysisResult ? "重新分析" : "开始分析"
          }</button><button id="darius-clear-key-btn" class="darius-btn-secondary" ${State.isLoading ? "disabled" : ""}>清除密钥</button>`
          if (State.isLoading) {
            aiContentHTML = `<div class="darius-loader"><div></div><div></div><div></div></div><p>AI 正在深度分析中，请稍候...</p>`
          } else if (State.error) {
            aiContentHTML = `<div class="darius-error-box"><strong>分析出错：</strong><p>${State.error}</p></div>`
          } else if (State.analysisResult) {
            let resultHtml = State.analysisResult
              .replace(/&/g, "&")
              .replace(/</g, "<")
              .replace(/>/g, ">")
              .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
              .replace(/\n/g, "<br>")
            aiContentHTML = `<div class="darius-result-content">${resultHtml}</div>`
          } else {
            aiContentHTML = `<div class="darius-welcome-box"><p>配置完成！点击下方的“开始分析”按钮，让 AI 为您解读命盘。</p></div>`
          }
        }
        aiView.innerHTML = aiContentHTML
        footer.innerHTML = footerHTML
      }
    },

    injectStyles() {
      GM_addStyle(`
        #extractor-btn { position: fixed; bottom: 30px; right: 30px; width: 60px; height: 60px; background-color: #2c3e50; color: white; border-radius: 50%; display: flex; justify-content: center; align-items: center; font-size: 22px; font-weight: bold; font-family: monospace, sans-serif; cursor: pointer; box-shadow: 0 5px 15px rgba(0,0,0,0.25); transition: all 0.2s ease-in-out; z-index: 99998; border: 2px solid rgba(255,255,255,0.5); }
        #extractor-btn:hover { transform: scale(1.1) rotate(10deg); box-shadow: 0 8px 20px rgba(0,0,0,0.3); }
        #darius-overlay { position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0, 0, 0, 0.65); backdrop-filter: blur(5px); z-index: 99999; opacity: 0; transition: opacity 0.3s ease; pointer-events: none; }
        #darius-modal { position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%) scale(0.95); width: 90%; max-width: 800px; background: #fff; border-radius: 16px; box-shadow: 0 15px 40px rgba(0,0,0,0.2); z-index: 100000; display: flex; flex-direction: column; opacity: 0; transition: opacity 0.3s ease, transform 0.3s ease; pointer-events: none; overflow: hidden; }
        #darius-overlay.darius-visible, #darius-modal.darius-visible { opacity: 1; pointer-events: auto; }
        #darius-modal.darius-visible { transform: translate(-50%, -50%) scale(1); }
        .darius-hidden { display: none !important; }
        .darius-modal-header { padding: 12px 24px; border-bottom: 1px solid #e0e0e0; display: flex; justify-content: space-between; align-items: center; background: #f7f9fa; }
        .darius-tabs { display: flex; gap: 4px; }
        .darius-tab-btn { padding: 8px 16px; border: none; background-color: transparent; border-radius: 8px; font-size: 16px; font-weight: 500; color: #555; cursor: pointer; transition: all 0.2s ease; }
        .darius-tab-btn:hover { background-color: #e9ecef; }
        .darius-tab-btn.active { background-color: #fff; color: #2c3e50; font-weight: 700; box-shadow: 0 1px 3px rgba(0,0,0,0.1); }
        .darius-close-btn { font-size: 28px; font-weight: bold; color: #999; cursor: pointer; line-height: 1; transition: transform 0.2s ease; }
        .darius-close-btn:hover { color: #333; transform: rotate(90deg); }
        .darius-modal-body { padding: 24px; flex-grow: 1; overflow-y: auto; height: 65vh; }
        #darius-data-view textarea { width: 100%; height: 100%; box-sizing: border-box; border: 1px solid #ddd; border-radius: 8px; padding: 12px; font-family: Menlo, Monaco, 'Courier New', monospace; font-size: 14px; resize: none; background-color: #fdfdfd; }
        #darius-ai-view { text-align: center; }
        .darius-config-form { max-width: 450px; margin: 20px auto; text-align: left; }
        .darius-config-form h4 { font-size: 18px; color: #333; text-align: center; margin-bottom: 15px; }
        .darius-config-form p { font-size: 14px; color: #666; line-height: 1.6; margin-bottom: 20px; }
        #darius-api-key-input { width: 100%; padding: 12px; font-size: 16px; border: 1px solid #ccc; border-radius: 6px; margin-bottom: 15px; box-sizing: border-box; }
        .darius-modal-footer { padding: 16px 24px; border-top: 1px solid #e0e0e0; text-align: right; background: #f7f9fa; display: flex; justify-content: flex-end; gap: 10px; min-height: 65px; box-sizing: border-box; }
        .darius-modal-footer button { padding: 10px 20px; border: none; border-radius: 6px; font-size: 16px; font-weight: 500; cursor: pointer; transition: all 0.2s ease; }
        .darius-modal-footer button:disabled { cursor: not-allowed; opacity: 0.6; }
        #darius-copy-btn, .darius-btn-primary, #darius-analyze-btn { background-color: #34495e; color: white; }
        #darius-copy-btn:hover, .darius-btn-primary:hover, #darius-analyze-btn:hover:not(:disabled) { background-color: #2c3e50; }
        .darius-btn-secondary { background-color: #e0e0e0; color: #333; }
        .darius-btn-secondary:hover:not(:disabled) { background-color: #c7c7c7; }
        #darius-copy-btn.darius-copied { background-color: #27ae60; }
        .darius-loader { margin: 40px auto; display: flex; justify-content: center; align-items: center; gap: 10px; }
        .darius-loader div { width: 12px; height: 12px; background-color: #34495e; border-radius: 50%; animation: bounce 1.4s infinite ease-in-out both; }
        .darius-loader div:nth-child(1) { animation-delay: -0.32s; }
        .darius-loader div:nth-child(2) { animation-delay: -0.16s; }
        @keyframes bounce { 0%, 80%, 100% { transform: scale(0); } 40% { transform: scale(1.0); } }
        .darius-error-box { border: 1px solid #e74c3c; background-color: #fbeae5; border-radius: 8px; padding: 15px; color: #c0392b; text-align: left; }
        .darius-result-content { text-align: left; line-height: 1.7; font-size: 16px; color: #333; white-space: pre-wrap; word-wrap: break-word; }
        .darius-result-content strong { color: #2c3e50; }
        .darius-welcome-box { color: #555; font-size: 16px; padding: 40px 0; }
      `)
    },
  }

  /**
   * @description 脚本主入口
   */
  async function main() {
    await ConfigManager.loadApiKey()
    DataHooker.init()

    // 因为 UI 初始化是用户点击触发，所以可以在任何时候进行
    UIManager.init()
  }

  main().catch((err) => {
    console.error(`${LOG_PREFIX} 脚本执行失败:`, err)
  })
})()
