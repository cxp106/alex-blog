// ==UserScript==
// @name         自动学习助手
// @namespace    http://tampermonkey.net/
// @version      1.0.1
// @description  自动快速看视频，自动答题并提交
// @author       千川汇海
// @match        https://service.cpma.org.cn/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=fusejs.io
// @grant        none
// ==/UserScript==

import { search } from "./flexsearch-implementation"
import calculateSimilarity from "./levenshtein"

// 手动触发点击事件
const event = new MouseEvent("click", {
  bubbles: true,
  cancelable: true,
  view: window,
})

// 多题尝试
let xuanzhong = 1
// 不要选漏
let resultCount = 0
// 页面停留 60 秒不对劲就刷新
let examTime = 0

const download = (dataArray) => {
  // 将数组数据转换为 JSON 字符串
  const jsonData = JSON.stringify(dataArray, null, 2)

  // 创建一个 Blob 对象，表示文件内容
  const blob = new Blob([jsonData], { type: "application/json" })

  // 创建一个 URL，用于指向 Blob 数据
  const url = URL.createObjectURL(blob)

  // 创建一个隐藏的 a 标签
  const a = document.createElement("a")
  a.href = url

  // 设置下载文件名
  const now = new Date()
  const formattedTime = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(
    2,
    "0"
  )} ${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}:${String(now.getSeconds()).padStart(2, "0")}`

  a.download = `${formattedTime}.json`

  // 将 a 标签添加到页面（但不显示）
  document.body.appendChild(a)

  // 自动触发点击事件，下载文件
  a.click()

  // 下载完成后移除 a 标签
  document.body.removeChild(a)

  // 释放 Blob URL
  URL.revokeObjectURL(url)
}

function selectAnswers(_, observer) {
  // 获取所有的 qu-box
  const quBoxes = document.querySelectorAll(".qu-box")

  quBoxes.forEach((box) => {
    // 获取当前 box 里的 qu-item 的内容
    const questionContent = document.querySelector(".qu-item .content").innerText.trim()
    console.log("%c questionContent => ", "font-size:13px; background:#baccd9; color:#000;", questionContent)

    // 调用查询函数，获取答案列表（假设返回一个数组）
    const correctAnswers = questionContent ? search(questionContent).filter((item) => item.score < 0.36) : []
    console.log("%c correctAnswers => ", "font-size:13px; background:#baccd9; color:#000;", correctAnswers)

    if (correctAnswers.length > 0) {
      observer?.disconnect()
      // 找到对应的 qu-answer 容器
      const answerContainer = document.querySelector(".qu-answer")
      console.log("%c answerContainer => ", "font-size:13px; background:#baccd9; color:#000;", answerContainer)

      // 遍历 qu-answer 里的所有选项，匹配正确答案
      const answerItems = [...answerContainer.querySelectorAll(".item")]
      console.log("%c answerItems => ", "font-size:13px; background:#baccd9; color:#000;", answerItems)
      // correctAnswers.forEach((item) => {
      //   console.log("%c item => ", "font-size:13px; background:#baccd9; color:#000;", item)
      const xuanzhongItem = correctAnswers[Math.floor(xuanzhong++ / 5)]
      console.log("%c xuanzhong => ", "font-size:13px; background:#baccd9; color:#000;", xuanzhong)
      if (!xuanzhongItem) {
        xuanzhong = 1
        location.reload()
      }
      if (typeof xuanzhongItem?.item.answer === "string") {
        const ans = xuanzhongItem?.item.answer
        answerItems.sort(
          (a, b) =>
            calculateSimilarity(ans, b.querySelector(".content").innerText.trim()) -
            calculateSimilarity(ans, a.querySelector(".content").innerText.trim())
        )
        !answerItems[0].classList.contains("active") && answerItems[0].dispatchEvent(event)
      } else {
        const type = xuanzhongItem?.item.type
        if (type === "填空题") {
          resultCount = xuanzhongItem?.item.answer.length
          xuanzhongItem?.item.answer.forEach((ans, index) => {
            const input = answerItems[index].querySelector("input")
            input.focus()
            input.value = ans
            const event = new Event("change", { bubbles: true })
            input.dispatchEvent(event)
            input.blur()
          })
        } else {
          resultCount = xuanzhongItem?.item.answer.length
          xuanzhongItem?.item.answer.forEach((ans) => {
            console.log("%c ans => ", "font-size:13px; background:#baccd9; color:#000;", ans)
            const result =
              answerItems.filter((item) => item.querySelector(".content").innerText.includes(ans)) ||
              answerItems.sort(
                (a, b) =>
                  calculateSimilarity(ans, b.querySelector(".content").innerText.trim()) -
                  calculateSimilarity(ans, a.querySelector(".content").innerText.trim())
              )
            console.log("%c answerItems => ", "font-size:13px; background:#baccd9; color:#000;", result[0])
            if (!result[0].classList.contains("active")) {
              result[0].dispatchEvent(event)
            }
          })
        }
      }
      // })
    } else {
      // const result =
      //   "[" +
      //   document.querySelector(".ant-alert-info").innerText.replace(/（.*?）/g, "") +
      //   "]\n69." +
      //   questionContent +
      //   "\n" +
      //   [...document.querySelectorAll(".qu-answer .item")].map((item) => item.innerText.replace("\n", ".")).join(" ") +
      //   "\n[这里替换为真实的答案，如 ABC 或者正确]\n"
      // if (noQu.includes(questionContent)) {
      // document.querySelector(".ant-btn.ant-btn-warning")?.click()
      // } else {
      //   noQu += result
      // }
      // console.log(noQu)
    }
  })
}

let mainList = JSON.parse(localStorage.getItem("mainList")) || []
let mainListTotal = localStorage.getItem("mainListTotal") || 0
let currentStudy = null
let videoList = []
let errorExam = null

;(function () {
  const originalXHR = window.XMLHttpRequest
  window.XMLHttpRequest = function () {
    const xhr = new originalXHR()
    const originalOpen = xhr.open
    const originalSend = xhr.send

    xhr.open = function () {
      console.log("XHR 请求：", arguments)
      return originalOpen.apply(this, arguments)
    }

    xhr.send = function () {
      this.addEventListener("load", function () {
        console.log("XHR 响应：", {
          url: this.responseURL,
          status: this.status,
          response: this.response,
        })
        if (this.responseURL.includes("exam-boot/course/study") && this.responseURL.includes("pageSize=12")) {
          // 解析 URL 查询参数
          // const urlParams = new URLSearchParams(this.responseURL.split("?")[1])

          // // 获取单个参数值
          // const pageNum = +urlParams.get("pageNo")

          console.log("%c  JSON.parse(this.response) => ", "font-size:13px; background:#baccd9; color:#000;", JSON.parse(this.response))
          const result = JSON.parse(this.response).result
          mainList = [...mainList, ...result.records.map((item) => item.id)]
          mainListTotal = result.total
          localStorage.setItem("mainList", JSON.stringify(mainList))
          localStorage.setItem("mainListTotal", mainListTotal)
        } else if (this.responseURL.includes("exam-boot/course/getCourseStudyDetail")) {
          console.log("%c currentStudy => ", "font-size:13px; background:#baccd9; color:#000;", JSON.parse(this.response))
          currentStudy = JSON.parse(this.response).result
        } else if (this.responseURL.includes("userExamResultDetail")) {
          console.log("%c errorExam => ", "font-size:13px; background:#baccd9; color:#000;", JSON.parse(this.response).result)
          errorExam = JSON.parse(this.response).result
        }
      })
      return originalSend.apply(this, arguments)
    }

    return xhr
  }

  const originalFetch = window.fetch
  window.fetch = function () {
    console.log("Fetch 请求：", arguments)
    return originalFetch.apply(this, arguments).then((response) => {
      response
        .clone()
        .text()
        .then((body) => {
          console.log("Fetch 响应：", {
            url: response.url,
            status: response.status,
            body: body,
          })
        })
      return response
    })
  }

  console.log("网络请求拦截器已启动。所有的 XHR 和 Fetch 请求及其响应将被打印到控制台。")
})()

let timeout = null
let lastExecTime = 0
function throttle(func, delay) {
  return function (...args) {
    const now = Date.now()
    if (now - lastExecTime >= delay) {
      func.apply(this, args)
      lastExecTime = now
    } else if (!timeout) {
      timeout = setTimeout(() => {
        func.apply(this, args)
        lastExecTime = now
        timeout = null
      }, delay - (now - lastExecTime))
    }
  }
}

// 保存原始的 window.open 方法
const originalWindowOpen = window.open

// 重写 window.open 方法
window.open = function (url, target, features) {
  // 如果指定的 target 是 '_blank'，则将其改为当前页面跳转
  if (target === "_blank") {
    window.location.href = url // 在当前 tab 跳转到目标页面
  } else {
    // 否则执行原始的 window.open 行为
    return originalWindowOpen(url, target, features)
  }
}

const jumpCourseDetails = (id) => {
  window.location.href = `https://service.cpma.org.cn/edu/course/courseDetails/${id}`
}
let nowStudy = ""
setInterval(() => {
  const currentPage = window.location.pathname
  console.log("%c currentPage => ", "font-size:13px; background:#baccd9; color:#000;", currentPage)
  if (currentPage.includes("course/study")) {
    console.log("%c  => ", "font-size:13px; background:#baccd9; color:#000;", "列表页", mainListTotal, mainList.length)
    if (mainListTotal && mainListTotal <= mainList.length) {
      jumpCourseDetails(mainList[0])
    } else {
      document.querySelector(".ant-pagination-next")?.click()
    }
  } else if (currentPage.includes("course/courseDetails")) {
    console.log("%c  => ", "font-size:13px; background:#baccd9; color:#000;", "课程详情页", currentStudy)
    // if (currentPage.includes(mainList[0])) {
    //   if (mainList.length > 1) {
    //     nowStudy = mainList.shift()
    //     localStorage.setItem("mainList", JSON.stringify(mainList))
    //     // jumpCourseDetails(mainList[0])
    //   } else {
    //     localStorage.setItem("mainList", JSON.stringify([]))
    //   }
    // }

    // if (currentStudy?.courseStudyProcess === 1) {
    //   if (mainList.length > 1) {
    //     mainList.shift()
    //     localStorage.setItem("mainList", JSON.stringify(mainList))
    //     jumpCourseDetails(mainList[0])
    //   } else {
    //     mainList = []
    //   }
    // } else {
    if (!currentStudy) return
    if (currentStudy?.finishNum < currentStudy?.catalogList.length) {
      window.location.href = `https://service.cpma.org.cn/edu/course/onlineStudy/${mainList[0]}`
    }

    if (currentStudy?.courseStudyProcess === 1) {
      // 有其他考试提示
      const other = document.querySelector(".ant-modal-body .ant-btn-primary")
      if (other) {
        document.querySelector(".ant-modal-body .ant-btn-primary").click()
      } else {
        document.querySelector("#rc-tabs-0-tab-courseExam")?.click()
        throttle(() => {
          // document.querySelector(".ant-space-item .ant-btn-primary")?.click()
          // // 手动触发点击事件
          // const event = new MouseEvent("click", {
          //   bubbles: true,
          //   cancelable: true,
          //   view: window,
          // })
          // 查看成绩
          const btnWarn = document.querySelector(".ant-space-item .ant-btn-warning")
          if (btnWarn) {
            btnWarn.dispatchEvent(event)
            if (document.querySelector(".ant-card-body .ant-tag").innerText.trim() === "通过") {
              if (mainList.length > 1) {
                nowStudy = mainList.shift()
                localStorage.setItem("mainList", JSON.stringify(mainList))
                jumpCourseDetails(mainList[0])
              } else {
                localStorage.setItem("mainList", JSON.stringify([]))
              }
            } else {
              document.querySelector(".ant-space-item .ant-btn-primary")?.dispatchEvent(event)
            }
          } else {
            document.querySelector(".ant-space-item .ant-btn-primary")?.dispatchEvent(event)
          }
        }, 5000)()
      }
    }

    console.log("课程未完成")
    // }
  } else if (currentPage.includes("course/onlineStudy")) {
    // exam/userexamresult/ExamDetail
    console.log("%c  => ", "font-size:13px; background:#baccd9; color:#000;", "播放页")
    const video = document.querySelector("video")
    if (videoList && !videoList.length) {
      console.log("%c videoList => ", "font-size:13px; background:#baccd9; color:#000;", videoList)
      videoList = [...document.querySelectorAll(".double-layer .section-title")]
    }

    if (video && (video.paused || video.playbackRate !== 16)) {
      console.log("%c video => ", "font-size:13px; background:#baccd9; color:#000;", video)
      video.volume = 0
      video.playbackRate = 16
      video.play()

      const fastForwardInterval = setInterval(() => {
        if (video.currentTime + 300 < video.duration) {
          video.currentTime += 300
        } else {
          video.currentTime = video.duration
          clearInterval(fastForwardInterval)
        }
      }, 1000)

      video.addEventListener("ended", () => {
        const next = videoList.shift()
        console.log("%c next => ", "font-size:13px; background:#baccd9; color:#000;", next)
        if (next && !next.querySelector(".task-hour").innerText.includes("已学完")) {
          next.click()
        } else {
          mainList[0] && jumpCourseDetails(mainList[0])
          console.log("%c  => ", "font-size:13px; background:#baccd9; color:#000;", "学完了")
        }
      })
    }
  } else if (currentPage.includes("exam/userexamresult")) {
    // exam/userexamresult/ExamDetail
    const noError = [...document.querySelectorAll(".ant-anchor-link")].every((item) => item.classList.contains("success"))
    errorExam &&
      throttle(() => {
        // 收集数据专用
        if (!noError) {
          download(errorExam)
          console.log("%c  => ", "font-size:13px; background:#baccd9; color:#000;")
          // const error = (JSON.parse(localStorage.getItem("errorStudys")) || []).push(nowStudy)
          // localStorage.setItem("errorStudys", JSON.stringify(error))
          document.querySelector(".score-card").addEventListener("click", () => {
            nowStudy = mainList[0]
            jumpCourseDetails(mainList[0])
          })
          setTimeout(() => {
            if ([...document.querySelectorAll(".score-box span")].some((item) => item.innerText.trim() === "通过")) {
              nowStudy = mainList[0]
              jumpCourseDetails(mainList[0])
            }
          }, 1000)
        } else {
          if (mainList.includes(nowStudy)) {
            if (mainList.length > 1) {
              mainList.shift()
              localStorage.setItem("mainList", JSON.stringify(mainList))
            } else {
              localStorage.setItem("mainList", JSON.stringify([]))
            }
          }
          setTimeout(() => {
            nowStudy = mainList[0]
            jumpCourseDetails(mainList[0])
          }, 1000)
        }
      }, 10000)()
    // if (hasError) {
    //   console.log("%c  => ", "font-size:13px; background:#baccd9; color:#000;", "评分页", errorExam)
    // } else {
    //   // jumpCourseDetails(mainList[0])
    // }
  } else if (currentPage.includes("exam/onlineExam")) {
    // if (++examTime === 60) {
    //   location.reload() // 刷新页面
    // }
    selectAnswers()
    const itemList = document.querySelectorAll(".qu-answer .item")
    const activeList = itemList && [...itemList]?.filter((item) => item.classList.contains("active") || item.querySelector("input")?.value)
    if (activeList.length && activeList.length === resultCount) {
      document.querySelector(".ant-btn.ant-btn-warning")?.click()
      xuanzhong = 1
      resultCount = 0
    }

    if (document.querySelector(".ant-progress-text svg")) {
      throttle(() => {
        // if (mainList.length > 1) {
        //   mainList.shift()
        //   localStorage.setItem("mainList", JSON.stringify(mainList))
        //   // jumpCourseDetails(mainList[0])
        // } else {
        //   localStorage.setItem("mainList", JSON.stringify([]))
        // }
        examTime = 0
        document.querySelector(".all-box-right .ant-btn.ant-btn-primary").click()
      }, 2000)()
    }
  }
}, 2000)
