// 获取所有链接元素, atob 方法在外部加载了，这里无需引入
const links = document.querySelectorAll("[data-link]")
// 给所有链接元素绑定点击事件
links.forEach((link) => {
  link.addEventListener("click", (e) => {
    // 阻止默认行为
    e.preventDefault()
    // 跳转到目标页面，并传递加密后的链接地址作为参数
    window.open(atob(link.dataset.link), "_blank")
  })
})
/**
 * @function getQueryParam
 * @description 使用 URLSearchParams API 安全、高效地获取指定 URL 查询参数的值。
 * @param {string} paramName - 需要获取的参数名 (例如 'q').
 * @returns {string | null} - 返回参数的值。如果参数不存在，则返回 null。
 */
function getQueryParam(paramName) {
  try {
    // 1. 获取当前页面的查询字符串 (例如 "?q=前端架构&id=123")
    const queryString = window.location.search

    // 2. 创建 URLSearchParams 实例，它会自动解析查询字符串
    const urlParams = new URLSearchParams(queryString)

    // 3. 使用 .get() 方法获取指定参数的值
    // API 会自动处理 URL 解码 (例如 %E5%89%8D%E7%AB%AF 会被转为 "前端")
    const value = urlParams.get(paramName)

    return value
  } catch (error) {
    console.error("[getQueryParam] Error parsing URL parameters:", error)
    // 在非浏览器环境（如 Node.js 服务端渲染的早期阶段）或发生未知错误时，返回 null
    return null
  }
}

// --- 使用示例 ---

// 获取 'q' 参数的值
const queryValue = getQueryParam("q")

// FILE: ./src/client.js (或直接放入 <script> 标签)

/**
 * @function replaceContainerWithFilteredElements
 * @description 清空指定容器的内容，并用一组经过筛选的、从文档其他地方移动过来的 DOM 元素填充它。
 *              此操作是破坏性的，会移除容器内的原始内容。
 * @param {string} containerSelector - 目标容器的 CSS 选择器 (例如 '.container')。
 * @param {string} elementSelector - 待筛选元素的 CSS 选择器 (例如 '[data-link]')。
 * @param {string} filterQuery - 用于过滤 innerText 的查询字符串 (不区分大小写)。
 */
function replaceContainerWithFilteredElements(containerSelector, elementSelector, filterQuery) {
  // --- 1. 定位目标容器 ---
  const container = document.querySelector(containerSelector)

  // 错误处理：如果容器不存在，则打印警告并静默退出，防止脚本崩溃。
  if (!container) {
    console.warn(`[replaceContainer] Target container with selector "${containerSelector}" not found.`)
    return
  }

  // --- 2. 准备筛选和收集 ---
  const allElements = document.querySelectorAll(elementSelector)
  // ADR-001: 使用 DocumentFragment 聚合 DOM 操作，以实现最佳性能。
  const fragment = document.createDocumentFragment()
  const lowerCaseQuery = (filterQuery || "").toLowerCase()

  // --- 3. 执行过滤并将匹配项移动到 Fragment ---
  allElements.forEach((element) => {
    const elementText = (element.innerText || "").toLowerCase()

    // 如果查询字符串为空，则不匹配任何项（这是一个安全默认行为）。
    // 或者，如果元素文本包含查询字符串，则认为匹配。
    if (lowerCaseQuery && elementText.includes(lowerCaseQuery)) {
      // ADR-002: 使用 appendChild 将元素从其原始位置“移动”到 Fragment 中。
      fragment.appendChild(element)
    }
  })

  // 包裹起来
  const wrapperDiv = document.createElement("div")
  wrapperDiv.className = "grid grid-cols-2 gap-4 sm:grid-cols-6 md:grid-cols-8"
  wrapperDiv.appendChild(fragment)

  // --- 4. 清空容器并注入新内容 ---
  // 清空容器。`innerHTML = ''` 是执行此操作的最快方式之一。
  container.innerHTML = ""
  // 一次性将 Fragment 中的所有元素添加到容器中，只触发一次 DOM 重排。
  container.appendChild(wrapperDiv)

  console.log(`[replaceContainer] Container "${containerSelector}" has been updated with filtered elements.`)
}

// --- 使用示例 ---
// 定义常量以提高可维护性
const CONTAINER_SELECTOR = ".container"
const ELEMENT_SELECTOR = "[data-link]"
const FILTER_QUERY = queryValue // 实际应用中可以从 URL 参数动态获取

// 在 DOM 加载完成后执行逻辑，确保所有元素都已渲染。
document.addEventListener("DOMContentLoaded", () => {
  FILTER_QUERY && replaceContainerWithFilteredElements(CONTAINER_SELECTOR, ELEMENT_SELECTOR, FILTER_QUERY)
})

// 如果你的脚本是放在 </body> 标签之前，可以不用 DOMContentLoaded 事件监听器，直接调用：
// replaceContainerWithFilteredElements(CONTAINER_SELECTOR, ELEMENT_SELECTOR, FILTER_QUERY);
