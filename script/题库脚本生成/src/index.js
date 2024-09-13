import { search } from "./flexsearch-implementation"
import calculateSimilarity from "./levenshtein"

function selectAnswers(_, observer) {
  // 获取所有的 qu-box
  const quBoxes = document.querySelectorAll(".qu-box")

  quBoxes.forEach((box) => {
    // 获取当前 box 里的 qu-item 的内容
    const questionContent = document.querySelector(".qu-item .content").innerText.trim()
    console.log("%c questionContent => ", "font-size:13px; background:#baccd9; color:#000;", questionContent)

    // 调用查询函数，获取答案列表（假设返回一个数组）
    const correctAnswers = questionContent ? search(questionContent) : []
    console.log("%c correctAnswers => ", "font-size:13px; background:#baccd9; color:#000;", correctAnswers)

    if (correctAnswers.length > 0) {
      observer?.disconnect()
      // 找到对应的 qu-answer 容器
      const answerContainer = document.querySelector(".qu-answer")
      console.log("%c answerContainer => ", "font-size:13px; background:#baccd9; color:#000;", answerContainer)

      // 遍历 qu-answer 里的所有选项，匹配正确答案
      const answerItems = [...answerContainer.querySelectorAll(".item")]
      console.log("%c answerItems => ", "font-size:13px; background:#baccd9; color:#000;", answerItems)

      if (typeof correctAnswers[0].item.answer === "string") {
        const ans = correctAnswers[0].item.answer
        answerItems.sort(
          (a, b) =>
            calculateSimilarity(ans, b.querySelector(".content").innerText.trim()) -
            calculateSimilarity(ans, a.querySelector(".content").innerText.trim())
        )
        !answerItems[0].classList.contains("active") && answerItems[0].click()
      } else {
        correctAnswers[0].item.answer.forEach((ans) => {
          answerItems.sort(
            (a, b) =>
              calculateSimilarity(ans, b.querySelector(".content").innerText.trim()) -
              calculateSimilarity(ans, a.querySelector(".content").innerText.trim())
          )
          !answerItems[0].classList.contains("active") && answerItems[0].click()
        })
      }
    }
  })
}

setInterval(() => {
  const currentPage = window.location.pathname
  console.log("%c currentPage => ", "font-size:13px; background:#baccd9; color:#000;", currentPage)
  if (currentPage.includes("course/study")) {
    console.log("%c  => ", "font-size:13px; background:#baccd9; color:#000;", "列表页")
  } else if (currentPage.includes("exam/userexamresult")) {
    // exam/userexamresult/ExamDetail
    console.log("%c  => ", "font-size:13px; background:#baccd9; color:#000;", "评分页")
  } else if (currentPage.includes("exam/onlineExam")) {
    selectAnswers()
    const itemList = document.querySelectorAll(".qu-answer .item")
    itemList &&
      [...itemList]?.some((item) => item.classList.contains("active")) &&
      document.querySelector(".ant-btn.ant-btn-warning")?.click()
    document.querySelector(".ant-progress-text svg") && document.querySelector(".all-box-right .ant-btn.ant-btn-primary").click()
  }
}, 1000)
