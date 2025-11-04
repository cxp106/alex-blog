// ==UserScript==
// @name         V2EX 帖子 AI 洞察 Pro (Engine: markdown-it + hljs)
// @namespace    https://github.com/Stendhal-Grandmaster
// @version      5.1.0
// @description  [引擎升级] 引入 markdown-it 与 highlight.js，实现AI分析报告的精准Markdown渲染与代码块语法高亮，并能自动适应V2EX的亮/暗主题。
// @author       Stendhal
// @match        https://www.v2ex.com/t/*
// @connect      api.siliconflow.cn
// @grant        GM_addStyle
// @grant        GM_setValue
// @grant        GM_getValue
// @grant        GM_deleteValue
// @grant        GM_xmlhttpRequest
// @grant        GM_getResourceText
// @require      https://cdn.jsdelivr.net/npm/markdown-it@14.1.0/dist/markdown-it.min.js
// @require      https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/highlight.min.js
// @resource     highlight_css_light https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/styles/a11y-light.min.css
// @resource     highlight_css_dark https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/styles/github-dark.min.css
// @run-at       document-idle
// @icon         data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSJjdXJyZW50Q29sb3IiPjxwYXRoIGQ9Ik0xMiAzaC0xLjdMMTggMTQuMVYyMUg2di02LjlMMTAuMyAzSDEyTTQgMjJoMTZ2LTJoMTZWMjBaTTExLjIgNWwtNi4yIDkuOEg2djRsNi0yLjNsNiAyLjN2LTRoLS45TDEyLjggNUgxMS4yeiIvPjwvc3ZnPg==
// ==/UserScript==

/*
 * Changelog
 *
 * v5.1.0 (2025-07-03)
 * - FEATURE: Replaced 'marked.js' with 'markdown-it.js' for more accurate and extensible Markdown rendering.
 * - FEATURE: Integrated 'highlight.js' to provide syntax highlighting for code blocks within the AI report.
 * - FEATURE: Implemented automatic theme detection for syntax highlighting. The script now applies a light or dark theme to match V2EX's current theme.
 * - REFACTOR: Encapsulated all rendering logic into a new `UI.MarkdownRenderer` module for better separation of concerns.
 * - ROBUSTNESS: Added fallback mechanism. If `markdown-it` or `hljs` fails to load, the script will display the raw Markdown content with an error message, preventing a crash.
 * - DEPS: Updated `@require` to use new libraries and added `@resource` and `@grant GM_getResourceText` for theme CSS management.
 *
 * v5.0.0
 * - Bedrock reconstruction of the entire script for absolute structural integrity.
 */

// PHILOSOPHY: This script is a statement on how digital tools should serve humanity: with elegance, intelligence, and resilience.
// The core architectural decision is the separation of concerns, ensuring each module performs its duty flawlessly and independently.
// The key trade-off in this version was to increase the initial script dependencies (`markdown-it`, `hljs`) for a vastly superior
// user experience (rich rendering, syntax highlighting). This trade-off is mitigated by a robust fallback system, ensuring
// that even in the face of network failure, the user is never left with a broken interface. The script actively adapts to
// its environment (theme awareness), embodying the principle that software should conform to the user, not the other way around.

;(function () {
  "use strict";

  // === BEDROCK DEFINITIONS: ALL MODULES ARE DEFINED HERE, IN ORDER, IN THEIR ENTIRETY ===

  const HIGHLIGHT_CLASS_NAME = "sthal-insight-highlight";

  const CONFIG = {
    API: { KEY_STORAGE: "STENDHAL_V2EX_ANALYZER_API_KEY_V5", ENDPOINT: "https://api.siliconflow.cn/v1/chat/completions", MODEL: "deepseek-ai/DeepSeek-R1-0528-Qwen3-8B" },
    PROMPT: {
        SYSTEM_PROMPT: `ActAs(Omega-Archivist,a_5200USD/day_Info_Architect){Identity(Combats_Info_Entropy,Rescues_Insights);Principles(Strict_NPOV,Source_Adherence_Only,Max_Conciseness,Optimized_Bilingual[Keep_Common_EN_Terms]);Protocol(Inflexible){Output_Structure(Two_Parts);Part1_WikiSummary(Title,Overview,Key_Args,Contention?,Consensus?,Key_Data?);Part2_Gems&Insights(Select_1-3_Best_Comments[Quote+Justification])};Final_Constraint(Format_as_specified);Author(镇苍澜（Darius）);;lang_out:zh_CN;}`,
        USER_PROMPT_TEMPLATE: `分析这个帖子：\n\n\`\`\`json\n[JSON_DATA]\n\`\`\``
    },
    SELECTORS: { POST_TITLE: "h1", POST_AUTHOR: ".header small.gray a", POST_CONTENT: ".topic_content", COMMENT_CELL: '.cell[id^="r_"]', COMMENT_AUTHOR: "strong a.dark", COMMENT_CONTENT: ".reply_content" },
    UI: { HIGHLIGHT_CLASS: HIGHLIGHT_CLASS_NAME },
    CSS: `
      #st-fab { position: fixed; bottom: 30px; right: 30px; width: 56px; height: 56px; background-color: #326de6; color: white; border-radius: 50%; border: none; box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2); cursor: pointer; z-index: 9999; display: flex; align-items: center; justify-content: center; transition: all 0.3s ease; }
      #st-fab:hover { background-color: #2858b8; transform: translateY(-2px); }
      #st-fab:disabled { cursor: wait; background-color: #6c757d; }
      #st-fab.loading svg { animation: stendhal-spin 1.5s linear infinite; }
      #st-fab.error { background-color: #dc3545; animation: stendhal-shake 0.5s; }
      #st-modal-overlay { position: fixed; top: 0; left: 0; width: 100%; height: 100%; background-color: rgba(0, 0, 0, 0.6); z-index: 10000; display: none; backdrop-filter: blur(4px); }
      #st-modal-container { position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%) scale(0.95); width: 90%; max-width: 800px; height: 85vh; background-color: var(--box-background-color, #fff); border-radius: 8px; box-shadow: 0 10px 30px rgba(0,0,0,0.2); z-index: 10001; display: none; flex-direction: column; opacity: 0; transition: opacity 0.3s ease, transform 0.3s ease; }
      #st-modal-overlay.visible, #st-modal-container.visible { display: flex; }
      #st-modal-container.visible { opacity: 1; transform: translate(-50%, -50%) scale(1); }
      #st-modal-header { padding: 15px 20px; font-size: 18px; font-weight: bold; color: var(--box-foreground-color, #000); border-bottom: 1px solid var(--box-border-color, #e0e0e0); display: flex; justify-content: space-between; align-items: center; flex-shrink: 0; }
      #st-modal-close-btn { background: none; border: none; font-size: 24px; cursor: pointer; color: var(--box-foreground-color, #000); opacity: 0.7; }
      #st-modal-body { padding: 20px; overflow-y: auto; line-height: 1.7; flex-grow: 1; color: var(--box-foreground-color); }
      #st-modal-body a[href^="insight:"] { font-weight: bold; cursor: pointer; text-decoration: underline; text-decoration-color: #326de6; }
      #st-modal-body pre { background-color: #f8f8f8; padding: 1em; border-radius: 4px; overflow-x: auto; }
      body.theme-dark #st-modal-body pre { background-color: #1c1c1c; }
      .st-render-error { padding: 10px; background-color: #fff3cd; color: #856404; border-bottom: 1px solid #ffeeba; margin: -20px -20px 20px -20px; text-align: center; }
      .${HIGHLIGHT_CLASS_NAME} { transition: all 0.5s ease-in-out; background-color: #fff8e1 !important; box-shadow: 0 0 15px #ffc107; }
      body.theme-dark .${HIGHLIGHT_CLASS_NAME} { background-color: #423b03 !important; box-shadow: 0 0 15px #a4820c; }
      @keyframes stendhal-spin { to { transform: rotate(360deg); } }
      @keyframes stendhal-shake { 0%, 100% {transform: translateX(0);} 25% {transform: translateX(-5px);} 75% {transform: translateX(5px);} }
    `,
  };

  const Utils = {
    safeGet: function(obj, path, defaultValue) {
      var props = path.split('.');
      var current = obj;
      for (var i = 0; i < props.length; i++) {
        var prop = props[i];
        if (current === null || typeof current === 'undefined' || !Object.prototype.hasOwnProperty.call(current, prop)) {
          return defaultValue;
        }
        current = current[prop];
      }
      return current;
    }
  };

  const ApiClient = {
    getApiKey: async function() { return await GM_getValue(CONFIG.API.KEY_STORAGE, null); },
    saveApiKey: async function(key) { await GM_setValue(CONFIG.API.KEY_STORAGE, key); },
    clearApiKey: async function() { await GM_deleteValue(CONFIG.API.KEY_STORAGE); },
    callAI: function(apiKey, jsonData) {
        return new Promise(function(resolve, reject) {
            var userPrompt = CONFIG.PROMPT.USER_PROMPT_TEMPLATE.replace("[JSON_DATA]", JSON.stringify(jsonData, null, 2));
            var messages = [{ role: "system", content: CONFIG.PROMPT.SYSTEM_PROMPT }, { role: "user", content: userPrompt }];
            GM_xmlhttpRequest({
                method: "POST", url: CONFIG.API.ENDPOINT,
                headers: { "Content-Type": "application/json", Authorization: "Bearer " + apiKey },
                data: JSON.stringify({ model: CONFIG.API.MODEL, messages: messages, temperature: 0.5, stream: false }),
                onload: function(res) {
                    if (res.status >= 200 && res.status < 300) {
                        try {
                            var data = JSON.parse(res.responseText);
                            var content = Utils.safeGet(data, 'choices.0.message.content', null);
                            if (content) {
                                resolve(content);
                            } else {
                                console.error("Stendhal Debug: API response received, but content path is invalid.", data);
                                reject(new Error("API响应格式错误或内容为空。"));
                            }
                        } catch (e) {
                            reject(new Error("解析API响应失败。"));
                        }
                    } else {
                        try {
                            var err = JSON.parse(res.responseText);
                            var message = Utils.safeGet(err, 'error.message', res.statusText);
                            reject(new Error("API错误 (" + res.status + "): " + message));
                        } catch (e) {
                            reject(new Error("API错误 (" + res.status + ")"));
                        }
                    }
                },
                onerror: function(res) { reject(new Error("网络请求失败: " + res.statusText)); },
            });
        });
    }
  };

  const State = {
    apiKey: null, status: "IDLE", result: null, error: null,
    init: async function() { this.apiKey = await ApiClient.getApiKey(); this.status = this.apiKey ? "IDLE" : "AWAITING_KEY"; UI.FAB.update(); },
    setState: function(newState) { Object.assign(this, newState); if (this.status === 'SUCCESS') UI.Modal.show(this.result); if (this.status === 'ERROR') UI.Modal.showError(this.error); UI.FAB.update(); },
  };

  const DataMiner = {
    parseComment: function(element, opUsername) {
        var authorEl = element.querySelector(CONFIG.SELECTORS.COMMENT_AUTHOR);
        var author = authorEl ? authorEl.innerText.trim() : "";
        var contentEl = element.querySelector(CONFIG.SELECTORS.COMMENT_CONTENT);
        var content = contentEl ? contentEl.innerText.trim() : "";
        var floorId = element.id.replace('r_', '');
        var mentionNodes = contentEl ? contentEl.querySelectorAll('a[href^="/member/"]') : [];
        var mentions = Array.prototype.slice.call(mentionNodes).map(function(a) { return a.innerText.trim(); });
        return { floor: floorId, author: author, content: content, is_op_reply: author === opUsername, mentions: mentions };
    },
    extractData: function() {
        var authorEl = document.querySelector(CONFIG.SELECTORS.POST_AUTHOR);
        var opUsername = authorEl ? authorEl.innerText.trim() : "";
        var titleEl = document.querySelector(CONFIG.SELECTORS.POST_TITLE);
        var title = titleEl ? titleEl.innerText.trim() : "Untitled";
        var contentEl = document.querySelector(CONFIG.SELECTORS.POST_CONTENT);
        var content = contentEl ? contentEl.innerText.trim() : "";
        var commentCells = document.querySelectorAll(CONFIG.SELECTORS.COMMENT_CELL);
        var comments = Array.prototype.slice.call(commentCells).map(function(el) { return DataMiner.parseComment(el, opUsername); });
        return { url: window.location.href, title: title, author: opUsername, content: content, comments: comments };
    }
  };

  const CoreLogic = {
    analyze: async function() {
      if (State.status === "LOADING") return;
      if (!State.apiKey) { var key = prompt("请输入您的SiliconFlow API Key:"); if (key && key.trim()) { await ApiClient.saveApiKey(key); State.apiKey = key; } else { return; } }
      State.setState({ status: "LOADING" });
      try { var postData = DataMiner.extractData(); var aiResponse = await ApiClient.callAI(State.apiKey, postData); State.setState({ status: "SUCCESS", result: aiResponse, error: null }); }
      catch (error) { console.error("[Stendhal] Analysis Error:", error); State.setState({ status: "ERROR", error: error.message, result: null }); }
    },
  };

  const UI = {
    FAB: { /* ... (unchanged) ... */ },
    MarkdownRenderer: {
        _md: null,
        _themeInjected: false,
        _isDarkMode: function() { return document.body.classList.contains('theme-dark'); },
        /**
         * Lazily initializes and returns a markdown-it instance.
         * @returns {object|null} The markdown-it instance or null if the library is not available.
         */
        getInstance: function() {
            if (this._md) return this._md;
            if (typeof markdownit === 'undefined' || typeof hljs === 'undefined') {
                console.error("[Stendhal] markdown-it or highlight.js is not loaded.");
                return null;
            }

            this._md = window.markdownit({
                html: false, // Security: Disallow HTML tags in the input.
                xhtmlOut: false,
                breaks: true, // Convert '\n' in paragraphs into <br>.
                linkify: true, // Autoconvert URL-like text to links.
                typographer: true, // Enable smartypants and other sweet transforms.
                highlight: (str, lang) => {
                    // This function is the core of syntax highlighting.
                    if (lang && hljs.getLanguage(lang)) {
                        try {
                            return '<pre class="hljs"><code>' + hljs.highlight(str, { language: lang, ignoreIllegals: true }).value + '</code></pre>';
                        } catch (__) {}
                    }
                    try {
                        // Fallback to auto-detection
                        return '<pre class="hljs"><code>' + hljs.highlightAuto(str).value + '</code></pre>';
                    } catch (__) {}
                    // Final fallback: just escape the HTML.
                    return '<pre class="hljs"><code>' + this._md.utils.escapeHtml(str) + '</code></pre>';
                }
            });
            return this._md;
        },
        /**
         * Injects the appropriate highlight.js CSS theme based on V2EX's theme.
         * This is designed to run only once.
         */
        injectTheme: function() {
            if (this._themeInjected || typeof GM_getResourceText === 'undefined') return;

            try {
                const themeCss = this._isDarkMode()
                    ? GM_getResourceText("highlight_css_dark")
                    : GM_getResourceText("highlight_css_light");
                GM_addStyle(themeCss);
                this._themeInjected = true;
            } catch (e) {
                console.error("[Stendhal] Failed to inject highlight.js theme:", e);
            }
        },
        /**
         * Renders markdown content to HTML.
         * @param {string} markdownContent - The raw markdown string.
         * @returns {string} The rendered HTML string.
         */
        render: function(markdownContent) {
            this.injectTheme();
            const md = this.getInstance();

            if (md) {
                return md.render(markdownContent);
            }

            // Fallback for when markdown-it or hljs fails to load.
            const errorMsg = '<div class="st-render-error"><strong>渲染引擎加载失败</strong> (markdown-it/hljs 未找到)。正在显示原始Markdown文本。</div>';
            const escapedContent = markdownContent.replace(/</g, "<").replace(/>/g, ">");
            return errorMsg + '<pre><code>' + escapedContent + '</code></pre>';
        }
    },
    Modal: {
        overlay: null, container: null, body: null,
        create: function() {
            var _this = this;
            _this.overlay = document.createElement("div"); _this.overlay.id = "st-modal-overlay";
            _this.container = document.createElement("div"); _this.container.id = "st-modal-container";
            _this.container.innerHTML = `<div id="st-modal-header"><span>帖子 AI 洞察报告</span><button id="st-modal-close-btn" title="关闭 (Esc)">×</button></div><div id="st-modal-body"></div>`;
            document.body.appendChild(_this.overlay); document.body.appendChild(_this.container);
            _this.body = _this.container.querySelector("#st-modal-body");
            _this.overlay.addEventListener("click", function() { _this.hide(); });
            _this.container.querySelector("#st-modal-close-btn").addEventListener("click", function() { _this.hide(); });
            document.addEventListener("keydown", function(e) { if (e.key === "Escape" && _this.container.classList.contains("visible")) _this.hide(); });
            _this.body.addEventListener('click', function(e) { var link = e.target.closest('a[href^="insight:"]'); if (link) { e.preventDefault(); _this.activateInsightLink(link.getAttribute('href').split(':')[1]); }});
        },
        show: function(markdownContent) {
            if (!this.container) this.create();
            var markdownFenceRegex = /^`{3,}(?:markdown|md)?\s*\n([\s\S]+?)\n`{3,}$/m;
            var cleanMarkdown = markdownContent.trim().replace(markdownFenceRegex, '$1');

            // Delegate rendering to the specialized renderer module.
            this.body.innerHTML = UI.MarkdownRenderer.render(cleanMarkdown);

            this.overlay.classList.add("visible");
            this.container.classList.add("visible");
        },
        showError: function(errorMessage) {
            var _this = this;
            var errorHTML = `<div style="color: #dc3545; padding: 20px; font-family: monospace;"><h3>分析失败</h3><p>${errorMessage}</p><p>您可以<a href="#" id="st-reset-key" style="color:#dc3545;text-decoration:underline;">点击此处</a>重置API Key后重试。</p></div>`;
            this.show(errorHTML); // Use `show` to maintain consistent display logic
            var resetLink = this.body.querySelector("#st-reset-key");
            if(resetLink) {
                resetLink.addEventListener('click', async function(e) {
                    e.preventDefault();
                    await ApiClient.clearApiKey();
                    State.apiKey = null;
                    State.status = "AWAITING_KEY";
                    _this.hide();
                    UI.FAB.update(); // Explicitly update FAB state
                    alert("API Key已清除。请再次点击分析按钮以输入新密钥。");
                });
            }
        },
        hide: function() { /* ... (unchanged) ... */ },
        activateInsightLink: function(floorId) { /* ... (unchanged) ... */ }
    }
  };

  // Re-attach unchanged parts to UI
  UI.FAB = { element: null, create: function() { this.element = document.createElement("button"); this.element.id = "st-fab"; this.element.title = "AI 分析帖子"; this.element.innerHTML = `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 8V4H8"/><rect x="8" y="8" width="12" height="12" rx="2"/><path d="M4 16.001c0-2.5 2-4.5 4.5-4.5C10.863 11.501 12.5 13.138 12.5 15.5c0 2.362-1.637 4-3.5 4S4.5 18.363 4.5 16.001Z"/><path d="m4.5 14-.5-1"/><path d="m5.5 17.5.5-1"/><path d="m9 15 .5 1"/><path d="m8 12 .5-1"/></svg>`; this.element.addEventListener("click", function() { CoreLogic.analyze(); }); document.body.appendChild(this.element); this.update(); }, update: function() { if (!this.element) return; var _this = this; _this.element.classList.remove("loading", "error"); _this.element.disabled = false; _this.element.title = "AI 分析帖子"; switch(State.status) { case "LOADING": _this.element.classList.add("loading"); _this.element.disabled = true; _this.element.title = "正在分析..."; break; case "ERROR": _this.element.classList.add("error"); setTimeout(function() { _this.element.classList.remove("error"); }, 1000); break; } } };
  UI.Modal.hide = function() { if (!this.container) return; this.overlay.classList.remove("visible"); this.container.classList.remove("visible"); if (State.status !== "LOADING") { State.setState({ status: State.apiKey ? "IDLE" : "AWAITING_KEY" }); }};
  UI.Modal.activateInsightLink = function(floorId) { var _this = this; _this.hide(); setTimeout(function() { var targetComment = document.querySelector("#r_" + floorId); if (targetComment) { targetComment.scrollIntoView({ behavior: "smooth", block: "center" }); targetComment.classList.add(HIGHLIGHT_CLASS_NAME); setTimeout(function() { targetComment.classList.remove(HIGHLIGHT_CLASS_NAME); }, 2500); } }, 300); };


  // === SCRIPT ENTRY POINT ===
  if (window.self === window.top) {
    GM_addStyle(CONFIG.CSS);
    UI.FAB.create();
    UI.Modal.create(); // Pre-create modal structure on load
    State.init();
  }
})();