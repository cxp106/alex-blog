/**
 * 比较两个字符串的相似度（基于 Levenshtein 距离）
 * @param {string} text1 文本 1
 * @param {string} text2 文本 2
 * @param {number} [precision=2] 小数位精确度，默认 2 位
 * @returns {string} 相似度百分比，例如：90.32
 */
export default function calculateSimilarity(text1, text2, precision = 2) {
  if (!text1 || !text2) return 0
  if (text1 === text2) return "100.00"

  const len1 = text1.length
  const len2 = text2.length
  const maxLength = Math.max(len1, len2)

  // Initialize two rows for dynamic programming (previous and current)
  let previousRow = Array(len2 + 1)
    .fill(0)
    .map((_, i) => i)
  let currentRow = Array(len2 + 1).fill(0)

  for (let i = 1; i <= len1; i++) {
    currentRow[0] = i
    for (let j = 1; j <= len2; j++) {
      const cost = text1[i - 1] === text2[j - 1] ? 0 : 1
      currentRow[j] = Math.min(
        previousRow[j] + 1, // Deletion
        currentRow[j - 1] + 1, // Insertion
        previousRow[j - 1] + cost // Substitution
      )
    }
    ;[previousRow, currentRow] = [currentRow, previousRow] // Swap rows
  }

  const similarity = ((1 - previousRow[len2] / maxLength) * 100).toFixed(precision)
  return similarity
}
