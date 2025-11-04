import Fuse from "fuse.js"

import { questionBank } from "./data/all.js"
import Pako from "pako"

// 配置 Fuse 选项
const options = {
  includeScore: true,
  // keys: ["question"],
  keys: ["id"],
  threshold:0, // 用 id 搜索的话就精确搜索
  useExtendedSearch: true,
}

// 创建 Fuse 实例
const uf8 = new Uint8Array(
  atob(questionBank)
    .split("")
    .map((char) => char.charCodeAt(0))
)
const data = JSON.parse(Pako.ungzip(uf8, { to: "string" }))
const fuse = new Fuse(data, options)

function calculateRelevance(question, query) {
  const normalizedQuestion = question.toLowerCase()
  const normalizedQuery = query.toLowerCase().split("")

  let matchCount = 0
  let lastIndex = -1

  for (const char of normalizedQuery) {
    const index = normalizedQuestion.indexOf(char, lastIndex + 1)
    if (index > -1) {
      matchCount++
      lastIndex = index
    }
  }

  const matchRatio = matchCount / normalizedQuery.length
  return matchRatio > 0 ? matchRatio * (1 / normalizedQuestion.length) : -1
}

export function search(query) {
  // 使用 Fuse 进行搜索
  const fuseResults = fuse.search(query)

  return fuseResults

  // 结合 Fuse 得分和自定义相关性计算
  const combinedResults = fuseResults.map((result) => {
    const customRelevance = calculateRelevance(result.item.question, query)
    const fuseRelevance = 1 - result.score // 将 Fuse 得分转换为相关性

    // 综合得分：自定义相关性和 Fuse 相关性的加权平均
    const combinedRelevance = customRelevance * 0.6 + fuseRelevance * 0.4

    return {
      ...result.item,
      relevance: combinedRelevance,
    }
  })

  // 按综合相关性得分排序
  combinedResults.sort((a, b) => b.relevance - a.relevance)

  // 返回前 5 个最相关的结果
  return combinedResults.slice(0, 5)
}
