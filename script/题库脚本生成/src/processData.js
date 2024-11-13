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
          const questionText = question.content.replace(/<\/?[^>]+(>|$)/g, "").trim()

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
              options: options, // 如果不是选择题，数组为空
              answer: question.type_dictText === "填空题" ? options : correctAnswer,
              answerId: question.type_dictText === "填空题" ? options : correctAnswerId,
            })
        })

        console.log(`处理完文件：${file}`)
      } catch (err) {
        console.error(`无法处理文件 ${filePath}: ${err.message}`)
      }
    }

    // 所有文件处理完成后，将数据写入新的 result.json 文件
    const outputJsonFilePath = path.join(__dirname, `data/db.json`)
    await fs.writeFile(outputJsonFilePath, JSON.stringify(parsedData, null, 2), "utf8")
    console.log("%c parsedData => ", "font-size:13px; background:#baccd9; color:#000;", parsedData.length)
    console.log(`Json 解析后的数据已成功写入 ${outputJsonFilePath}`)
    const jsonContent = JSON.stringify(parsedData)
    const compressData = pako.gzip(jsonContent)
    const base64Str = `export const questionBank = \`${Buffer.from(compressData).toString("base64")}\``
    const gzipFilePath = path.join(__dirname, `data/all.js`)
    await fs.writeFile(gzipFilePath, base64Str)
  } catch (err) {
    console.error(`无法读取文件夹或文件处理出错：${err.message}`)
  }
}

// 执行文件处理函数
processFiles()
