/**
 * 完善下面函数，补充下面要求的功能
 * 1.测速线程数。
 * 一次同时可发起对 30（可配置 1-100，默认是 30）条备选 DNS 项进行测速。
 * 该参数值越大，测速就越快。但会消耗更多的计算机资源。
 * 2.单项超时值。
 * 向任一条备选 DNS 查询域名时，若 800（可配置 50-10000，默认是 800）毫秒没有反应就当作没响应。
 * 该参数值越小，测速就越快。但可能使得一些反映迟钝的备选 DNS 项测速无响应。
 * 3.取样次数。
 * 重复 3（可配置 1-20，默认是 3）次对同一条备选 DNS 进行测速，取平均值作为最终结果。
 * 该参数值越大，测速结果越准确。但测速会变慢。
 */
const dns = require("dns").promises

async function startTest(list = [], sampleCount = 9, timeoutValue = 800) {
  const result = []
  const promises = list.map(async (dns) => {
    const i = { dns }
    const delays = []
    let successCount = 0 // 成功计数

    for (let j = 0; j < sampleCount; j++) {
      try {
        i.delay = `测量中... (${j + 1}/${sampleCount})`

        // 设置超时逻辑
        const response = await Promise.race([
          measureDnsLookup(i.domain),
          new Promise((_, reject) => setTimeout(() => reject(new Error("超时")), timeoutValue)),
        ])

        delays.push(response)
        successCount++
      } catch (err) {
        console.error(`Error looking up ${i.domain} on attempt ${j + 1}:`, err)
        delays.push(null)
      }
    }

    const validDelays = delays.filter((delay) => delay !== null)
    const averageDelay =
      validDelays.length > 0 ? (validDelays.reduce((sum, delay) => sum + delay, 0) / validDelays.length).toFixed(2) + " ms" : "请求超时"

    const successRate = ((successCount / sampleCount) * 100).toFixed(2) + "%"

    i.delay = averageDelay
    i.successRate = successRate
    result.push(i)
  })

  await Promise.all(promises)

  return result // 返回结果
}

async function measureDnsLookup(domain) {
  const startTime = Date.now()
  await dns.lookup(domain)
  return Date.now() - startTime
}

function isValidIP(ip) {
  // IPv4 正则表达式
  const ipv4Pattern =
    /^(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/

  // IPv6 正则表达式
  const ipv6Pattern =
    /^(?:[0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}|(?:[0-9a-fA-F]{1,4}:){1,7}:|(?:[0-9a-fA-F]{1,4}:){1,6}:[0-9a-fA-F]{1,4}|(?:[0-9a-fA-F]{1,4}:){1,5}(?::[0-9a-fA-F]{1,4}){1,2}|(?:[0-9a-fA-F]{1,4}:){1,4}(?::[0-9a-fA-F]{1,4}){1,3}|(?:[0-9a-fA-F]{1,4}:){1,3}(?::[0-9a-fA-F]{1,4}){1,4}|(?:[0-9a-fA-F]{1,4}:){1,2}(?::[0-9a-fA-F]{1,4}){1,5}|[0-9a-fA-F]{1,4}:(?::[0-9a-fA-F]{1,4}){1,6}|:((?::[0-9a-fA-F]{1,4}){1,7}|:)|fe80:(?::[0-9a-fA-F]{0,4}){0,4}::(?:[0-9a-fA-F]{1,4}:[0-9a-fA-F]{1,4}|:)|::(ffff(:0{1,4}){0,1}:){0,1}((25[0-5]|(2[0-4][0-9]|[01]?[0-9][0-9]?)(\.|$)){3}|([0-9a-fA-F]{1,4}:){1,4}:((25[0-5]|(2[0-4][0-9]|[01]?[0-9][0-9]?)(\.|$)){3}))$/

  return ipv4Pattern.test(ip) || ipv6Pattern.test(ip)
}

const data1 = require("./1.json")
const data2 = require("./2.json")

let name = ""
let indexName = ""
let index = 0
let result = {}
const ipList = []

;[...data1, ...data2].forEach((item) => {
  if (isValidIP(item)) {
    !ipList.includes(item) && ipList.push(item)
  }
  if (Object.entries(result).some((item1) => item1[1].includes(item))) {
    return
  } else if (!isValidIP(item)) {
    name = item
    indexName = item
    index = 0
  } else if (result[indexName]) {
    result[indexName] = [...result[indexName], item]
    if (result[name].length >= 2) {
      indexName = name + "_" + ++index
    }
  } else {
    result[indexName] = [item]
  }
})

const guangdong = require("./guangdong.json")
guangdong.forEach((item) => {
  !ipList.includes(item.DNS) && ipList.push(item.DNS)
  if (Object.entries(result).some((item1) => item1[1].includes(item.DNS))) {
    return
  } else if (result[name]) {
    name = `${item.省份}-${item.地区}-${item.运营商}`
    indexName = `${item.省份}-${item.地区}-${item.运营商}`
    index = 0
  } else if (result[indexName]) {
    result[indexName] = [...result[indexName], item]
    if (result[name].length >= 2) {
      indexName = name + "_" + ++index
    }
  } else {
    result[indexName] = [item.DNS]
  }
})

const fs = require("fs").promises
const path = require("path")

const DJJFilePath = path.join(__dirname, `DnsJumper.json`)
fs.writeFile(DJJFilePath, JSON.stringify(result, null, 2))

let dnsJumper = ""
Object.entries(result).forEach(([name, ips]) => {
  name = name.replace(/\n/, " ")
  if (ips > 1) {
    dnsJumper += `${name}=${ips.join(",")},True\n`
  } else {
    dnsJumper += `${name}=${ips},,True\n`
  }
})

const DJTFilePath = path.join(__dirname, `DnsJumper.txt`)
fs.writeFile(DJTFilePath, dnsJumper)

// let personalDnsFilter = `# DNS Configuration
// # 1. https://dns.alidns.com/dns-query
// [223.5.5.5]::443::DOH::https://dns.alidns.com/dns-query
// # 2. https://doh.pub/dns-query
// [1.12.12.12]::443::DOH::https://doh.pub/dns-query
// # 3. https://doh.360.cn/dns-query
// [101.226.4.6]::443::DOH::https://doh.360.cn/dns-query
// # 4. https://freedns.controld.com/p2
// # 5. https://dns.decloudus.com/dns-query
// # 6. https://ada.openbld.net/dns-query
// # 7. https://ric.openbld.net/dns-query
// # 8. https://dns.controld.com/comss
// # 9. https://dns.jupitrdns.com/dns-query
// # 10. https://doh.libredns.gr/ads
// [116.202.176.26]::443::DOH::https://doh.libredns.gr/ads
// # 11. https://doh.18bit.cn/dns-query
// [117.50.10.10]::53::UDP::doh-pure.onedns.net/dns-query
// [101.101.101.101]::53::UDP::https://dns.twnic.tw/dns-query
// [168.95.1.1]::53::UDP::https://dns.hinet.net/dns-query
// [101.226.4.6]::53::UDP::https://doh.360.cn
// [94.140.14.14]::53::UDP::https://dns.adguard-dns.com/dns-query
// [208.67.222.123]::53::UDP::https://doh.familyshield.opendns.com/dns-query
// [1.1.1.2]::53::UDP::https://security.cloudflare-dns.com/dns-query
// [149.112.121.30]::53::UDP::https://family.canadianshield.cira.ca/dns-query
// [5.2.75.75]::53::UDP::https://doh.nl.ahadns.net/dns-query
// [103.219.29.29]::53::UDP
// [36.156.184.156]::53::UDP
// [110.43.41.122]::53::UDP
// [150.242.98.63]::53::UDP
// [111.230.37.44]::53::UDP
// [123.207.22.79]::53::UDP
// `

// personalDnsFilter = ipList.reduce((a, b) => {
//   a += `[${b}]::53::UDP\n`
//   return a
// }, personalDnsFilter)

// const PDFTTFilePath = path.join(__dirname, `personalDnsFilter.txt`)
// fs.writeFile(PDFTTFilePath, personalDnsFilter)

startTest(ipList).then((results) => {
  // 筛选有效结果并按延迟排序
  const filteredResults = results.filter((item) => item.delay !== "请求超时")

  // 将延迟转换为数字以便排序
  const sortedResults = filteredResults.sort((a, b) => {
    const delayA = parseFloat(a.delay) || Infinity // 使用 Infinity 处理超时情况
    const delayB = parseFloat(b.delay) || Infinity
    return delayA - delayB
  })

  const top20 = sortedResults.slice(0, 20)
  const str = top20.reduce((a, b) => {
    a += `[${b.dns}]::53::UDP\n`
    return a
  }, "")
  
  console.log('%c str => ', 'font-size:13px; background:#baccd9; color:#000;', str)
  const PDFTTFilePath = path.join(__dirname, `personalDnsFilter.txt`)
  fs.writeFile(PDFTTFilePath, str)
})
