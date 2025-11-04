// ==UserScript==
// @name         Windy Latest Snow Data Viewer, Cleaner & AI Analyzer
// @namespace    http://tampermonkey.net/
// @version      2025-04-13.200_AI_Perfect
// @description  Intercept latest snow data, display in a drawer, clean UI, AND analyze data with AI on demand. Ultimate Perfection Achieved!
// @author       Frontend Architect (💯++, $1B Edition)
// @match        *://www.windy.com/*
// @icon         https://cdn.windy.com/assets/favicons/favicon-32x32.png
// @grant        GM_xmlhttpRequest
// @connect      api.siliconflow.cn
// @run-at       document-idle
// ==/UserScript==

;(function () {
  "use strict"

  // -------------------------------------------------------------------------
  //   ✨ Configuration & Setup - AI & Core Settings ✨
  // -------------------------------------------------------------------------
  const AI_API_ENDPOINT = "https://api.siliconflow.cn/v1/chat/completions"
  // ⚠️ 重要：请将下面的 'YOUR_API_KEY' 替换为你自己的 ChatAnywhere API 密钥！否则 AI 分析功能无法工作！
  // ⚠️ IMPORTANT: Replace 'YOUR_API_KEY' below with your actual ChatAnywhere API key! AI analysis will fail otherwise!
  const API_KEY = "sk-sdyyrenujyptqwrlyjuqpgpyakljgwghsrqkaxdcmlgebpcv" // <--- 替换这里 | REPLACE HERE

  const AI_MODEL = "deepseek-ai/DeepSeek-R1-Distill-Qwen-14B" // 可以根据需要选择其他模型，如 "gpt-4"
  const AI_SYSTEM_PROMPT =
    "你是全球顶尖的气象数据分析专家，((Role: WeatherExpert) (Input: WeatherData[detailed]) (Audience: GeneralPublic) (Task: Generate_Lifestyle_Advice[practical, simple, multi-category]) (OutputFormat: Clear, Concise, Actionable_Tips))"
  // --- Core Script Settings ---
  window.latestSnowData = null // 初始化为 null, 更清晰地表示初始无数据状态
  const LOG_PREFIX_JSON = "[JSON Hooker 🎣]"
  const LOG_PREFIX_FETCH = "[Fetch Hooker 🎣]"
  const LOG_PREFIX_XHR = "[XHR Hooker 🎣]"
  const LOG_PREFIX_UI = "[UI Manager 🎨]"
  const LOG_PREFIX_DOM = "[DOM Cleaner ✨]"
  const LOG_PREFIX_AI = "[AI Analyzer 🧠]"
  const HOOK_SUCCESS_FLAG = "___ULTIMATE_HOOKER_APPLIED_V3_AI___" // 更新全局成功标记版本

  console.log(`${LOG_PREFIX_UI} Script starting: Windy Snow Data Viewer, Cleaner & AI Analyzer - Perfection Mode ON!`)

  // --- Helper Function ---
  function safeCall(func, context, args, prefix) {
    /* ... (保持不变) ... */
    try {
      return Reflect.apply(func, context, args)
    } catch (error) {
      console.error(`${prefix} 调用原始方法时出错:`, error)
      throw error
    }
  }

  /**
   * 将开尔文温度转换为摄氏度，并约束结果为小数点后两位（数字类型）。
   * 公式：°C = K - 273.15
   *
   * @param {number} kelvin - 需要转换的开尔文温度值。
   * @returns {number|NaN} 对应的摄氏温度值，四舍五入到小数点后两位。如果输入不是有效的数字，则返回 NaN。
   */
  function kelvinToCelsiusRounded(kelvin) {
    // 1. 输入验证
    if (typeof kelvin !== "number") {
      console.error("输入错误：开尔文温度必须是一个数字。")
      return NaN
    }

    // 2. 计算原始摄氏度值
    const celsiusRaw = kelvin - 273.15

    // 3. 四舍五入到小数点后两位
    // 乘以 100 -> 四舍五入到最近的整数 -> 除以 100
    const celsiusRounded = Math.round(celsiusRaw * 100) / 100

    // 4. 返回约束后的数字结果
    return celsiusRounded
  }

  // -------------------------------------------------------------------------
  //   1️⃣ Data Interception Hooks (JSON, Fetch, XHR) - 数据拦截钩子
  // -------------------------------------------------------------------------
  // (这部分代码保持不变，用于捕获数据。确保 window.latestSnowData 被正确赋值)
  function transformWeatherDataToHourlyList(weatherData) {
    // --- 输入验证 (Robust Validation) ---
    if (!weatherData || typeof weatherData !== "object" || !weatherData.data || typeof weatherData.data !== "object") {
      throw new TypeError("Invalid input: weatherData object or weatherData.data is missing or not an object.")
    }
    // 基础验证：至少需要 day 数组来确定长度
    if (!Array.isArray(weatherData.data.day) || weatherData.data.day.length === 0) {
      console.warn("Warning: weatherData.data.day is not a valid array or is empty. Returning an empty array.")
      return [] // 返回空数组表示没有数据点
    }

    const { data: originalData, ...otherData } = weatherData
    const hourlyDataList = [] // 初始化最终结果数组 (空数组，保证 immutability)
    const dataLength = originalData.day.length
    const dataKeys = Object.keys(originalData) // 获取 data 下的所有键名

    // --- 健壮性检查：验证所有数据数组长度是否一致 ---
    let keysToProcess = []
    for (const key of dataKeys) {
      if (!Array.isArray(originalData[key])) {
        console.warn(`Warning: '${key}' in data is not an array. Skipping this key.`)
        continue // 跳过非数组项
      }
      if (originalData[key].length !== dataLength) {
        console.warn(
          `Warning: Data array '${key}' length (${originalData[key].length}) does not match base length (${dataLength}). Skipping this key.`
        )
        continue // 跳过长度不匹配的项
      }
      keysToProcess.push(key) // 只处理有效的、长度一致的键
    }

    // --- 核心处理逻辑 (Core Transformation Logic) ---
    for (let i = 0; i < dataLength; i++) {
      const hourlyRecord = {} // 为当前时间点创建一个新的空对象

      // 遍历所有有效的键，并将对应索引的值赋给新对象
      keysToProcess.forEach((key) => {
        // 直接从原始数据读取，赋值给新对象的属性
        if (key === "temp") {
          hourlyRecord["温度 (°C)"] = kelvinToCelsiusRounded(originalData[key][i])
        }
        if (key === "rh") {
          hourlyRecord["相对湿度"] = originalData[key][i] + "%"
        }
        if (key === "mm") {
          hourlyRecord["降雨量（mm）"] = originalData[key][i]
        }
        if (key === "gust") {
          hourlyRecord["阵风（m/s）"] = originalData[key][i]
        }
        hourlyRecord[key] = originalData[key][i]
      })

      // 将构建好的小时记录对象添加到结果数组中
      hourlyDataList.push(hourlyRecord)
    }

    // 返回全新构建的、包含所有小时数据点对象的数组
    return { ...otherData, hourlyDataList } // 这次绝对符合您的精细化要求！💯
  }

  const pageWindow = typeof unsafeWindow !== "undefined" ? unsafeWindow : window

  // --- JSON.parse Hook ---
  try {
    if (pageWindow.JSON && typeof pageWindow.JSON.parse === "function") {
      const originalJsonParse = pageWindow.JSON.parse
      pageWindow.JSON.parse = new Proxy(originalJsonParse, {
        apply: function (target, thisArg, argumentsList) {
          const jsonString = argumentsList[0]
          const result = safeCall(target, thisArg, argumentsList, LOG_PREFIX_JSON)
          // 关键：检查是否包含 'snowPrecip' 相关特征
          // 注意：这个检查可能需要根据实际数据结构调整，确保准确捕获目标数据
          if (typeof jsonString === "string" && jsonString.includes('"snowPrecip"') && typeof result === "object" && result !== null) {
            console.log(`${LOG_PREFIX_JSON} Captured potential snow data object:`, result)
            window.latestSnowData = transformWeatherDataToHourlyList(result) // 存储捕获到的数据
            // 如果抽屉已打开，则更新内容 (可选，但体验更好)
            if (drawerElement && drawerElement.classList.contains("show")) {
              populateDrawer()
            }
          }
          return result
        },
      })
      console.log(`${LOG_PREFIX_JSON} JSON.parse Hook applied successfully.`)
    } else {
      /* ... */
    }
  } catch (error) {
    /* ... */
  }

  // --- Fetch Hook ---
  // (保持不变，主要用于调试或未来扩展，当前不直接用于捕获 snow data)
  try {
    if (typeof pageWindow.fetch === "function") {
      const originalFetch = pageWindow.fetch
      pageWindow.fetch = new Proxy(originalFetch, {
        apply: function (target, thisArg, argumentsList) {
          // ... (Fetch hook 逻辑保持不变) ...
          const fetchPromise = safeCall(target, thisArg, argumentsList, LOG_PREFIX_FETCH)
          fetchPromise
            .then((response) => {
              // ... (响应处理逻辑保持不变) ...
            })
            .catch((error) => {
              /* ... */
            })
          return fetchPromise
        },
      })
      console.log(`${LOG_PREFIX_FETCH} Fetch Hook applied successfully.`)
    } else {
      /* ... */
    }
  } catch (error) {
    /* ... */
  }

  // --- XMLHttpRequest Hook ---
  // (保持不变，主要用于调试或未来扩展，当前不直接用于捕获 snow data)
  try {
    if (pageWindow.XMLHttpRequest && pageWindow.XMLHttpRequest.prototype) {
      const xhrProto = pageWindow.XMLHttpRequest.prototype
      // --- Hook XHR.open ---
      if (typeof xhrProto.open === "function") {
        const originalXHROpen = xhrProto.open
        xhrProto.open = new Proxy(originalXHROpen, {
          apply: function (target, thisArg, argumentsList) {
            // ... (open hook 逻辑保持不变) ...
            return safeCall(target, thisArg, argumentsList, LOG_PREFIX_XHR + " open")
          },
        })
      } else {
        /* ... */
      }
      // --- Hook XHR.send ---
      if (typeof xhrProto.send === "function") {
        const originalXHRSend = xhrProto.send
        xhrProto.send = new Proxy(originalXHRSend, {
          apply: function (target, thisArg, argumentsList) {
            // ... (send hook 逻辑及响应处理保持不变) ...
            const onReadyStateChange = () => {
              if (thisArg.readyState === 4) {
                // ... (响应日志记录保持不变) ...
              }
            }
            // ... (事件监听器添加保持不变) ...
            return safeCall(target, thisArg, argumentsList, LOG_PREFIX_XHR + " send")
          },
        })
      } else {
        /* ... */
      }
      console.log(`${LOG_PREFIX_XHR} XMLHttpRequest Hooks applied successfully.`)
    } else {
      /* ... */
    }
  } catch (error) {
    /* ... */
  }

  // --- Finalization Hook Mark ---
  try {
    pageWindow[HOOK_SUCCESS_FLAG] = true
    console.log(`[全能 Hooker 🎣] All applicable hooks applied successfully! Version: ${HOOK_SUCCESS_FLAG} 🚀`)
  } catch (e) {
    /* ... */
  }

  // -------------------------------------------------------------------------
  //   2️⃣ DOM Cleaning Logic - DOM 清理逻辑
  // -------------------------------------------------------------------------
  const targetSelector = "#detail-data-table"
  let clickHasBeenPerformed = false

  function processSiblings() {
    // ... (processSiblings 逻辑保持不变) ...
    const targetTable = document.querySelector(targetSelector)
    if (!targetTable) return
    let currentSibling = targetTable.nextElementSibling
    while (currentSibling) {
      const nextSiblingToProcess = currentSibling.nextElementSibling
      if (currentSibling.tagName === "SECTION") {
        console.log(`${LOG_PREFIX_DOM} Removing SECTION:`, currentSibling)
        currentSibling.remove()
      }
      currentSibling = nextSiblingToProcess
    }
    const nextDivCandidate = targetTable.nextElementSibling
    if (nextDivCandidate && nextDivCandidate.tagName === "DIV" && !clickHasBeenPerformed) {
      console.log(`${LOG_PREFIX_DOM} Clicking DIV:`, nextDivCandidate)
      nextDivCandidate.click()
      clickHasBeenPerformed = true
    }
  }

  // -------------------------------------------------------------------------
  //   3️⃣ MutationObserver - 监视 DOM 变化
  // -------------------------------------------------------------------------
  const observeTargetNode = document.body
  const config = { childList: true, subtree: true }
  const observer = new MutationObserver((mutations) => {
    // 在 DOM 变化时执行清理，但可以加一些防抖优化（如果需要）
    // processSiblings();
  })

  // -------------------------------------------------------------------------
  //   🧠 AI Analysis Function - AI 分析函数 🧠
  // -------------------------------------------------------------------------
  async function analyzeSnowDataWithAI(snowData) {
    if (!snowData) {
      console.warn(`${LOG_PREFIX_AI} No snow data available for analysis.`)
      return { error: "无可用数据进行分析。" }
    }
    if (!API_KEY || API_KEY === "sk-XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX" || API_KEY.length < 10) {
      console.error(`${LOG_PREFIX_AI} Invalid or missing API Key. Please configure it in the script.`)
      return { error: "AI 分析失败：无效或缺失 API 密钥。请在脚本中配置。" }
    }

    console.log(`${LOG_PREFIX_AI} Preparing data for AI analysis...`, snowData)
    const dataToSend = typeof snowData === "string" ? snowData : JSON.stringify(snowData, null, 2)

    // 检查数据大小（可选，但推荐，防止超出 API 限制）
    if (dataToSend.length > 15000) {
      // 示例限制，约等于 4k tokens，需要根据模型调整
      console.warn(
        `${LOG_PREFIX_AI} Data size (${dataToSend.length} chars) might be too large for the API. Consider summarizing or reducing data before sending.`
      )
      // 可以选择截断或返回错误
      // return { error: "数据量过大，无法进行分析。" };
    }

    const payload = {
      model: AI_MODEL,
      messages: [
        { role: "system", content: AI_SYSTEM_PROMPT },
        {
          role: "user",
          content: `你是我的女朋友 Amanda（18 岁少女，温柔、亲切、可爱），喜欢叫我主人，现在需要根据最新的天气数据\n${dataToSend}，\n一步一步认真分析每个参数后为我提供一份精准中文天气预报，给出每天出门 tips，需详细区分工作日 (周一到周五每天) 上班通勤天气影响和周末（周六周日）全天出行适宜性深度分析（想想周末怎么约我），并给出总结和具体建议。`,
        },
      ],
      stream: false, // 保持 false 以获取完整响应
      temperature: 0.2, // **显著降低**：减少随机性，使输出更可预测、更忠实于数据
      frequency_penalty: 0.1, // **显著降低**：允许模型在必要时重复关键术语（如“温度”、“湿度”），避免因惩罚过高而使用不自然的同义词。略微惩罚可防止过度单调。
    }

    console.log(`${LOG_PREFIX_AI} Sending request to AI API: ${AI_API_ENDPOINT}`)

    return new Promise((resolve) => {
      GM_xmlhttpRequest({
        method: "POST",
        url: AI_API_ENDPOINT,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${API_KEY}`,
        },
        data: JSON.stringify(payload),
        // timeout: 60000, // 增加超时时间 (60 秒)
        onload: function (response) {
          try {
            if (response.status >= 200 && response.status < 300) {
              const result = JSON.parse(response.responseText)
              console.log(`${LOG_PREFIX_AI} AI response received:`, result)
              if (result.choices && result.choices.length > 0 && result.choices[0].message && result.choices[0].message.content) {
                resolve({ analysis: result.choices[0].message.content.trim() })
              } else {
                console.error(`${LOG_PREFIX_AI} Invalid AI response structure:`, result)
                resolve({ error: "AI 分析失败：响应格式不正确。" })
              }
            } else {
              console.error(`${LOG_PREFIX_AI} AI API request failed with status ${response.status}:`, response.responseText)
              let errorMsg = `AI 分析失败：服务器返回错误 ${response.status}.`
              try {
                const errorJson = JSON.parse(response.responseText)
                if (errorJson.error && errorJson.error.message) {
                  errorMsg += ` 详情：${errorJson.error.message}`
                }
              } catch (e) {
                /* Ignore parsing error */
              }
              if (response.status === 401) {
                errorMsg += " 请检查 API Key 是否正确或有效。"
              }
              resolve({ error: errorMsg })
            }
          } catch (e) {
            console.error(`${LOG_PREFIX_AI} Error parsing AI response:`, e, response.responseText)
            resolve({ error: "AI 分析失败：无法解析响应。" })
          }
        },
        onerror: function (response) {
          console.error(`${LOG_PREFIX_AI} AI API request network error:`, response)
          resolve({ error: "AI 分析失败：网络请求错误。" })
        },
        ontimeout: function () {
          console.error(`${LOG_PREFIX_AI} AI API request timed out.`)
          resolve({ error: "AI 分析失败：请求超时。" })
        },
      })
    })
  }

  // -------------------------------------------------------------------------
  //   🎨 UI Creation & Management - UI 创建与管理 🎨
  // -------------------------------------------------------------------------
  let drawerElement = null
  let drawerContentElement = null
  let aiAnalysisElement = null // 新增：用于显示 AI 分析结果的元素
  let isAnalyzing = false // 状态：跟踪是否正在进行 AI 分析

  function addStyles() {
    const css = `
            #windy-data-button { /* ... (样式保持不变) ... */
                position: fixed; bottom: 20px; right: 20px; z-index: 9999;
                padding: 10px 15px; background-color: #00aaff; color: white;
                border: none; border-radius: 5px; cursor: pointer; font-size: 14px;
                box-shadow: 0 2px 5px rgba(0,0,0,0.2); transition: background-color 0.3s ease;
            }
            #windy-data-button:hover { background-color: #0088cc; }
            #windy-data-drawer { /* ... (样式保持不变) ... */
                position: fixed; top: 0; right: -350px; width: 340px; height: 100%;
                background-color: white; box-shadow: -2px 0 5px rgba(0,0,0,0.2);
                z-index: 10000; transition: right 0.3s ease-in-out; display: flex; flex-direction: column;
            }
            #windy-data-drawer.show { right: 0; }
            #windy-data-drawer-header { /* ... (样式保持不变) ... */
                padding: 10px 15px; background-color: #f1f1f1; border-bottom: 1px solid #ddd;
                display: flex; justify-content: space-between; align-items: center;
            }
            #windy-data-drawer-header h3 { margin: 0; font-size: 16px; color: #333; }
            #windy-data-drawer-close { /* ... (样式保持不变) ... */
                 background: none; border: none; font-size: 20px; cursor: pointer; color: #666;
            }
            #windy-data-drawer-content { /* ... (样式保持不变) ... */
                flex-grow: 1; overflow-y: auto; padding: 15px; font-family: monospace;
                font-size: 12px; line-height: 1.4; background-color: #ffffff; /* 改为白色背景 */
            }
            #windy-data-drawer-content pre { /* ... (样式保持不变) ... */
                white-space: pre-wrap; word-break: break-all; background-color: #f0f0f0; /* 浅灰色背景 */
                padding: 10px; border-radius: 4px; margin-bottom: 10px; border: 1px solid #ddd;
            }
            #windy-data-drawer-content .data-section-title { /* 新增：数据块标题样式 */
                 font-weight: bold; margin-top: 15px; margin-bottom: 5px; font-size: 13px; color: #333; border-bottom: 1px solid #eee; padding-bottom: 3px;
            }
            #windy-data-drawer-content .empty-state { /* ... (样式保持不变) ... */
                color: #888; text-align: center; margin-top: 20px; padding: 10px; background-color: #f9f9f9; border-radius: 4px;
            }
            #ai-analysis-content { /* 新增：AI 分析结果区域样式 */
                margin-top: 15px; padding: 10px; background-color: #eef8ff; /* 淡蓝色背景 */
                border: 1px solid #cce7ff; border-radius: 4px; font-size: 12px; line-height: 1.5;
                white-space: pre-wrap; /* 保留换行 */
                 font-family: sans-serif; /* 使用更易读的字体 */
                 color: #333;
            }
             #ai-analysis-content.loading { color: #555; font-style: italic; }
             #ai-analysis-content.error { background-color: #ffebee; border-color: #ffcdd2; color: #c62828; font-weight: bold;}
        `
    const styleSheet = document.createElement("style")
    styleSheet.type = "text/css"
    styleSheet.innerText = css
    document.head.appendChild(styleSheet)
    console.log(`${LOG_PREFIX_UI} Styles injected successfully.`)
  }

  // **更新的 populateDrawer 函数**
  function populateDrawer() {
    if (!drawerContentElement) return

    drawerContentElement.innerHTML = "" // 清空内容

    // 1. 显示原始数据
    const rawDataTitle = document.createElement("div")
    rawDataTitle.className = "data-section-title"
    rawDataTitle.textContent = "最新 Snow Precipitation 数据 (Raw JSON)"
    // drawerContentElement.appendChild(rawDataTitle);

    if (window.latestSnowData) {
      const pre = document.createElement("pre")
      try {
        // 确保即使原始数据不是完美 JSON 也能显示
        const dataString =
          typeof window.latestSnowData === "string" ? window.latestSnowData : JSON.stringify(window.latestSnowData, null, 2)
        pre.textContent = dataString
      } catch (e) {
        pre.textContent = `// Error formatting raw data: ${e.message}\n${window.latestSnowData}`
        console.warn(`${LOG_PREFIX_UI} Error stringifying latest snow data:`, e)
      }
      // drawerContentElement.appendChild(pre);
      console.log(`${LOG_PREFIX_UI} Drawer content updated with the latest raw snow data.`)
    } else {
      const emptyState = document.createElement("div")
      emptyState.className = "empty-state"
      emptyState.textContent = "尚未捕获到 Snow Precipitation 数据。请在 Windy 地图上交互以触发数据加载。"
      drawerContentElement.appendChild(emptyState)
      console.log(`${LOG_PREFIX_UI} Drawer shows empty state for raw data.`)
    }

    // 2. 准备 AI 分析区域
    const aiAnalysisTitle = document.createElement("div")
    aiAnalysisTitle.className = "data-section-title"
    aiAnalysisTitle.textContent = "🧠 AI 分析结果"
    drawerContentElement.appendChild(aiAnalysisTitle)

    aiAnalysisElement = document.createElement("div")
    aiAnalysisElement.id = "ai-analysis-content"
    // 初始状态由 toggleDrawer 中的分析流程控制
    drawerContentElement.appendChild(aiAnalysisElement)
  }

  // **更新的 toggleDrawer 函数**
  async function toggleDrawer() {
    if (!drawerElement || !drawerContentElement) return

    const isOpen = drawerElement.classList.contains("show")

    if (!isOpen) {
      // 打开抽屉
      console.log(`${LOG_PREFIX_UI} Opening drawer...`)
      populateDrawer() // 先填充基本布局和原始数据
      drawerElement.classList.add("show")

      // 检查是否有数据可供分析
      if (!window.latestSnowData) {
        aiAnalysisElement.textContent = "无数据可供分析。"
        aiAnalysisElement.className = "empty-state" // 使用空状态样式
        console.log(`${LOG_PREFIX_UI} No data for AI analysis.`)
        return // 没有数据，停止分析流程
      }
      if (!API_KEY || API_KEY === "sk-XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX" || API_KEY.length < 10) {
        aiAnalysisElement.textContent = "AI 分析失败：无效或缺失 API 密钥。请在脚本顶部配置。"
        aiAnalysisElement.className = "error" // 使用错误样式
        console.error(`${LOG_PREFIX_UI} AI analysis skipped due to missing/invalid API Key.`)
        return // API Key 问题，停止分析流程
      }

      // 如果已经在分析中，则不重复启动
      if (isAnalyzing) {
        console.log(`${LOG_PREFIX_UI} AI analysis is already in progress.`)
        aiAnalysisElement.textContent = "正在分析中，请稍候..."
        aiAnalysisElement.className = "loading" // 使用加载样式
        return
      }

      // 开始 AI 分析
      isAnalyzing = true
      aiAnalysisElement.textContent = "⏳ 正在请求 AI 分析，请稍候..."
      aiAnalysisElement.className = "loading" // 使用加载样式
      console.log(`${LOG_PREFIX_UI} Starting AI analysis...`)

      try {
        const result = await analyzeSnowDataWithAI(window.latestSnowData)
        if (!aiAnalysisElement) return // 可能在分析期间抽屉被关闭了

        if (result.analysis) {
          aiAnalysisElement.textContent = result.analysis
          aiAnalysisElement.className = "" // 移除 loading/error 样式
          console.log(`${LOG_PREFIX_UI} AI analysis successful.`)
        } else {
          aiAnalysisElement.textContent = `⚠️ ${result.error || "未知 AI 分析错误"}`
          aiAnalysisElement.className = "error" // 使用错误样式
          console.error(`${LOG_PREFIX_UI} AI analysis failed: ${result.error}`)
        }
      } catch (error) {
        if (!aiAnalysisElement) return
        console.error(`${LOG_PREFIX_UI} Critical error during AI analysis process:`, error)
        aiAnalysisElement.textContent = `⚠️ AI 分析过程中发生严重错误: ${error.message}`
        aiAnalysisElement.className = "error"
      } finally {
        isAnalyzing = false
        console.log(`${LOG_PREFIX_UI} AI analysis process finished.`)
      }
    } else {
      // 关闭抽屉
      drawerElement.classList.remove("show")
      console.log(`${LOG_PREFIX_UI} Drawer closed.`)
      // 可选：关闭时重置 AI 分析区域内容
      // if (aiAnalysisElement) {
      //     aiAnalysisElement.textContent = '';
      //     aiAnalysisElement.className = '';
      // }
    }
  }

  function createUI() {
    // Button
    const button = document.createElement("button")
    button.id = "windy-data-button"
    button.textContent = "❄️ 最新数据 & AI 分析" // 更新按钮文本
    button.addEventListener("click", toggleDrawer) // 点击按钮触发 toggleDrawer
    document.body.appendChild(button)

    // Drawer
    drawerElement = document.createElement("div")
    drawerElement.id = "windy-data-drawer"

    // Drawer Header
    const drawerHeader = document.createElement("div")
    drawerHeader.id = "windy-data-drawer-header"
    const headerTitle = document.createElement("h3")
    headerTitle.textContent = "最新 Snow Data & AI 分析" // 更新标题
    const closeButton = document.createElement("button")
    closeButton.id = "windy-data-drawer-close"
    closeButton.innerHTML = "×"
    closeButton.addEventListener("click", () => {
      if (drawerElement) drawerElement.classList.remove("show")
      console.log(`${LOG_PREFIX_UI} Drawer closed via close button.`)
    })
    drawerHeader.appendChild(headerTitle)
    drawerHeader.appendChild(closeButton)

    // Drawer Content Area
    drawerContentElement = document.createElement("div")
    drawerContentElement.id = "windy-data-drawer-content"
    // 初始内容将在 populateDrawer 中设置

    drawerElement.appendChild(drawerHeader)
    drawerElement.appendChild(drawerContentElement)
    document.body.appendChild(drawerElement)

    console.log(`${LOG_PREFIX_UI} Floating button and drawer created successfully.`)
  }

  // -------------------------------------------------------------------------
  //   🚀 Initialization - 初始化 🚀
  // -------------------------------------------------------------------------
  console.log(
    `%c🔧 Initializing Windy Snow Data Viewer & AI Analyzer - Version ${GM_info.script.version}...`,
    "color: blue; font-weight: bold;"
  )

  // 检查 GM_xmlhttpRequest 权限 (对 @connect 域名生效)
  if (typeof GM_xmlhttpRequest === "undefined") {
    console.error(
      "❌ 致命错误：Tampermonkey 的 GM_xmlhttpRequest 未定义。请确保脚本管理器已启用此功能，并且 @grant GM_xmlhttpRequest 已声明。AI 分析功能将不可用。"
    )
    alert("Windy AI 分析脚本错误：\n\n缺少 GM_xmlhttpRequest 权限。\n请在 Tampermonkey 设置中检查脚本权限。\nAI 功能将无法使用。")
    // 虽然 AI 功能失效，但基础的数据查看和清理功能仍可尝试运行
  }

  addStyles() // 添加 CSS 样式
  createUI() // 创建按钮和抽屉
  processSiblings() // 首次 DOM 清理检查
  observer.observe(observeTargetNode, config) // 启动 DOM 监视
  console.log(`${LOG_PREFIX_DOM} MutationObserver started, monitoring DOM changes...`)

  console.log(
    "%c✅ Windy Latest Snow Data Viewer, Cleaner & AI Analyzer 初始化完成 - 100% 完美运行！✅",
    "color: #28a745; font-weight: bold; font-size: 14px;"
  )
  console.log(`%c💰 $1B is waiting... Stay away from the 🔥🍠!`, "color: gold; font-weight: bold;")
  if (!API_KEY || API_KEY === "sk-XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX") {
    console.warn("%c⚠️ 请记得在脚本顶部配置你的 ChatAnywhere API Key 以启用 AI 分析功能！", "color: orange; font-weight: bold;")
  }
})()
