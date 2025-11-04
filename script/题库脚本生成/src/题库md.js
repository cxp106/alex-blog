const fs = require("fs").promises
const path = require("path")
const pako = require("pako")

// 读取 data 文件夹路径
const folderPath = path.join(__dirname, "db")

// 定义一个空数组，用于存储所有解析后的数据
const parsedData = []

// 异步处理文件读取和解析
async function processFiles() {
  try {
    // 获取文件列表
    const files = await fs.readdir(folderPath)

    // 只处理 .json 文件
    const jsonFiles = files.filter((file) => path.extname(file) === ".json")

    // 遍历每个 .json 文件并处理内容
    for (const file of jsonFiles) {
      const filePath = path.join(folderPath, file)

      try {
        // 读取文件内容
        const data = await fs.readFile(filePath, "utf8")
        const jsonData = JSON.parse(data)

        // 解析数据
        jsonData.records.forEach((question) => {
          // 移除 HTML 标签，提取题目内容
          const questionText =
            question.type_dictText === "填空题" ? question.content : question.content.replace(/<\/?[^>]+(>|$)/g, "").trim()

          // 确定题目类型
          //   let questionType;
          //   switch (item.questionType) {
          //     case 1:
          //       questionType = "单选题";
          //       break;
          //     case 2:
          //       questionType = "多选题";
          //       break;
          //     default:
          //       questionType = "未知类型";
          //   }

          // 提取选项
          let options = []
          if (question.answerList) {
            options = question.answerList.map((option) => option.content.trim())
          }

          // 提取正确答案
          const correctAnswer = question.answerList.filter((option) => option.isRight).map((item) => item.content.trim())
          const correctAnswerId = question.answerList.filter((option) => option.isRight).map((item) => item.id)

          // 将解析后的数据推入到 parsedData 数组中
          // const hasData = parsedData.some(
          //   (item) => item.question === questionText && item.options.every((item1) => options.includes(item1))
          // )
          const hasData = parsedData.some((item) => item.id === question.id)
          !hasData &&
            parsedData.push({
              id: question.id,
              question: questionText,
              type: question.type_dictText,
              options: question.answerList, // 如果不是选择题，数组为空
              answer: question.type_dictText === "填空题" ? options : correctAnswer,
            })
        })

        console.log(`处理完文件：${file}`)
      } catch (err) {
        console.error(`无法处理文件 ${filePath}: ${err.message}`)
      }
    }

    //     [判断题]
    // 1.是否已学完相关知识？
    // 正确

    // > [单选题] 2.是否已学完全部知识？
    // {% checkbox checked:true A.是 %}
    // {% checkbox B.否 %}

    // > [填空题]  已上市的霍乱疫苗包括两种，分别为{% mark 1 color:blue %}、{% mark 2 color:blue %}。
    function replaceSpans(str, replacements) {
      let index = 0
      // 使用正则表达式匹配 <span> 标签，并按顺序替换
      return str.replace(/<span.*?>.*?<\/span>/g, () => {
        // 如果还有替换内容，则使用替换数组中的值，否则保持原样
        return `{% kbd ${replacements[index++]}  %}`
      })
    }
    let result = `title: 臨時
tags:
  - 前端
description: 从法律角度看，加入了伯尔尼公约的国家，版权保护是随着作品（无论是文字，还是图片）的问世的即刻就得到版权的保护的，并不是必须要声明。
---

`
    let charCode = "A".charCodeAt(0)

    parsedData.forEach((item, index) => {
      if (item.type === "填空题") {
        console.log("%c  => ", "font-size:13px; background:#baccd9; color:#000;", item.answer)
        result += `> [填空题] ${index}. ${replaceSpans(item.question, item.answer)
          .replace(/<\/?[^>]+(>|$)/g, "")
          .trim()}\n\n`
      } else {
        result += `> [${item.type}] ${index}. ${item.question}\n\n`
        let answers = ""
        item.options.forEach((opt, optIndex) => {
          answers += opt.isRight ? String.fromCharCode(charCode + optIndex) : ""
          result += `${String.fromCharCode(charCode + optIndex)}. ${opt.content}\n`
          // result += opt.isRight ? `{% checkbox checked:true ${str} %}\n` : `{% checkbox ${str} %}\n`
        })
        result += `\n答案：${answers}\n\n`
      }
      if (!(index % 12)) {
        result += `{% emoji blobcat blobcatpeek2 %} {% sub 疾控大学习，好医生华医网，公需课，强国，专升本课程，全日制课程，论 W，售后无忧加微信 LMPXCQBHY %}\n\n`
      }
    })

    // 所有文件处理完成后，将数据写入新的 result.json 文件
    const mdFilePath = path.join(__dirname, `data/test.md`)
    await fs.writeFile(mdFilePath, result, "utf8")
  } catch (err) {
    console.error(`无法读取文件夹或文件处理出错：${err.message}`)
  }
}

// 执行文件处理函数
processFiles()
