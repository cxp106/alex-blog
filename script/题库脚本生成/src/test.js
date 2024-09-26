const fs = require("fs").promises
const path = require("path")

const data1 = require("./data/2024_09_21_10_38_55.json")
const data2 = require("./data/2024_09_21_13_11_06.json")

const result = []

data1.forEach((element) => {
  if (element.prompt.toLocaleLowerCase().includes("hypno")) {
    result.push(element)
  }
})
data2.forEach((element) => {
  if (element.personality.toLocaleLowerCase().includes("hypno")) {
    result.push(element)
  }
})

const filePath = path.join(__dirname, `data/test.json`)
fs.writeFile(filePath, JSON.stringify(result, null, 2))
