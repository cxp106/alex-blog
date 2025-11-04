const fs = require("fs").promises
const path = require("path")
const pako = require("pako")

const dbData = require("./data/db.json")
const Fuse = require('fuse.js')

// 配置 Fuse 选项
const options = {
  includeScore: true,
  keys: ["question"],
  useExtendedSearch: true,
}

const fuse = new Fuse(dbData, options)

async function readIniFiles(directoryPath) {
  try {
    // Read all files in the directory
    const files = await fs.readdir(directoryPath)

    // Filter for .ini files
    const iniFiles = files.filter((file) => path.extname(file).toLowerCase() === ".ini")

    // Read each .ini file as string
    const fileContents = await Promise.all(
      iniFiles.map(async (file) => {
        const filePath = path.join(directoryPath, file)
        const content = await fs.readFile(filePath, "utf8")
        return { file, content }
      })
    )

    return fileContents
  } catch (error) {
    console.error("Error reading INI files:", error)
    throw error
  }
}

function parseIniToJSON(iniText) {
  // 正则表达式匹配题目部分
  // const questionPattern =
  //   /\[(\S*?)\]\s*\d+\.([^\n]+)\s*([^\n]+)\s*([^\n]+)\s+/gms;
  const questionPattern = /\[(\S*?)\]\s*\d+\.([^\n]+\s*)([^\n]+\s*)([^\n^\[]+\s?)?/gms

  const parsedData = []
  let match

  // 循环匹配所有符合格式的题目
  while ((match = questionPattern.exec(iniText)) !== null) {
    const questionType = match ? match[1] : null // 题目类型
    const questionText = match[2]?.trim() // 题目内容
    const nodb = !fuse.search(questionText).filter((item) => item.score < 0.36).length
    if (nodb) {
      if (questionType === "单选题" || questionType === "多选题") {
        const optionsRaw = match[3]?.trim() // 原始选项
        const answerRaw = match[4]?.trim() // 正确答案
        // 将选项根据空格拆分为数组并去掉 "A. "、"B. " 之类的前缀
        const options = optionsRaw?.split(/\s+(?=[A-Z]\.)/).map((option) => option.slice(2).trim()) || []

        // 根据答案字母来选择对应选项
        const correctAnswer =
          answerRaw
            ?.split("")
            .map((item) => options[item.charCodeAt(0) - "A".charCodeAt(0)])
            .filter(Boolean) ?? []

        // 构建解析后的对象
        parsedData.push({
          question: questionText,
          type: questionType,
          options: options,
          answer: correctAnswer,
        })
      } else if (questionType === "判断题") {
        const answer = match[3]?.trim() // 正确答案
        parsedData.push({
          question: questionText,
          type: questionType,
          options: [],
          answer,
        })
      } else if (questionType === "填空题") {
        const answer = match[3]?.trim().split(" ") // 正确答案
        parsedData.push({
          question: questionText,
          type: questionType,
          options: [],
          answer,
        })
      }
    }
  }

  return parsedData
}

async function questionBankAsync() {
  let result = dbData
  const dataPath = path.join(__dirname, "data")
  await readIniFiles(dataPath)
    .then((parsedFiles) => {
      console.log("Parsed INI files:")
      parsedFiles.forEach(({ file, content }) => {
        const parsedJSON = parseIniToJSON(content)
        result = [...result, ...parsedJSON]
      })
    })
    .catch((error) => {
      console.error("Failed to parse INI files:", error)
    })
  // Create JSON object with file content
  console.log("%c result => ", "font-size:13px; background:#baccd9; color:#000;", result.length)
  // const jsonContent = JSON.stringify(result, null, 2)

  // const jsonFilePath = path.join(__dirname, `data/all.json`)
  // await fs.writeFile(jsonFilePath, jsonContent)

  const jsonContent = JSON.stringify(result)
  const compressData = pako.gzip(jsonContent)
  const base64Str = `export const questionBank = \`${Buffer.from(compressData).toString("base64")}\``
  const jsonFilePath = path.join(__dirname, `data/all.js`)
  await fs.writeFile(jsonFilePath, base64Str)
}

questionBankAsync()
