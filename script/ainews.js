const https = require("https")

// 忽略证书错误
const options = (hostname, path) => ({
  hostname,
  path,
  method: "GET",
  rejectUnauthorized: false, // 忽略 SSL 证书错误
})

// 发送请求的函数
const sendRequest = (hostname, path) => {
  return new Promise((resolve, reject) => {
    const req = https.request(options(hostname, path), (res) => {
      let data = ""

      // 接收数据
      res.on("data", (chunk) => {
        data += chunk
      })

      // 处理结束
      res.on("end", () => {
        // 计算本周一的日期
        const firstDayOfWeek = new Date()
        firstDayOfWeek.setDate(firstDayOfWeek.getDate() - firstDayOfWeek.getDay() + 1) // 周一的日期
        firstDayOfWeek.setHours(0, 0, 0, 0) // 设置时、分、秒和毫秒为 0
        const weekNews = JSON.parse(data).filter((article) => {
          const publishDate = new Date(article.publish_time)
          return publishDate >= firstDayOfWeek
        })
        resolve(weekNews)
      })
    })

    req.on("error", (e) => {
      reject(e)
    })

    // 发送请求
    req.end()
  })
}

// 定义备选接口
const endpoints = [
  { hostname: "www.petnexus.tech", path: "/get_articles.php" },
  { hostname: "aigcxtool.com", path: "/get_articles.php" }, // 备选接口 1
  { hostname: "www.fluxpro.fun", path: "/get_articles.php" }, // 备选接口 2
]

// 尝试每个接口
const fetchDataFromEndpoints = async (endpoints) => {
  for (const endpoint of endpoints) {
    try {
      const data = await sendRequest(endpoint.hostname, endpoint.path)
      //   console.log("成功获取数据：", data)

      const fs = require("fs")
      const path = require("path")

      // Markdown 文件的内容
      const markdownContent = data.reduce((a, b, i) => a + `${i + 1}. ${b.publish_time}\n${b.summary}\n\n`, "")

      // 设置 Markdown 文件的路径
      const filePath = path.join(__dirname, "example.md")

      // 写入内容到 Markdown 文件
      fs.writeFile(filePath, markdownContent, (err) => {
        if (err) {
          console.error("写入文件时出错：", err)
          return
        }
        console.log("Markdown 文件已创建：", filePath)
      })
      return // 成功后返回
    } catch (error) {
      console.error(`请求 ${endpoint.hostname}${endpoint.path} 失败:`, error.message)
    }
  }
  console.error("所有接口请求均失败")
}

// 执行请求
fetchDataFromEndpoints(endpoints)
