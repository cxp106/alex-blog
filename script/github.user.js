// ==UserScript==
// @name         Github 增强 - 高速下载
// @name:zh-CN   Github 增强 - 高速下载
// @name:zh-TW   Github 增強 - 高速下載
// @name:en      Github Enhancement - High Speed Download
// @version      2.5.21
// @author       X.I.U
// @description        高速下载 Git Clone/SSH、Release、Raw、Code(ZIP) 等文件 (公益加速)、项目列表单文件快捷下载 (☁)、添加 git clone 命令
// @description:zh-CN  高速下载 Git Clone/SSH、Release、Raw、Code(ZIP) 等文件 (公益加速)、项目列表单文件快捷下载 (☁)
// @description:zh-TW  高速下載 Git Clone/SSH、Release、Raw、Code(ZIP) 等文件 (公益加速)、項目列表單文件快捷下載 (☁)
// @description:en     High-speed download of Git Clone/SSH, Release, Raw, Code(ZIP) and other files (Based on public welfare), project list file quick download (☁)
// @match        *://github.com/*
// @match        *://hub.incept.pw/*
// @match        *://hub.nuaa.cf/*
// @match        *://hub.yzuu.cf/*
// @match        *://hub.scholar.rr.nu/*
// @match        *://dgithub.xyz/*
// @match        *://kkgithub.com/*
// @icon         data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAMAAABEpIrGAAAABGdBTUEAALGPC/xhBQAAAAFzUkdCAK7OHOkAAACEUExURUxpcRgWFhsYGBgWFhcWFh8WFhoYGBgWFiUlJRcVFRkWFhgVFRgWFhgVFRsWFhgWFigeHhkWFv////////////r6+h4eHv///xcVFfLx8SMhIUNCQpSTk/r6+jY0NCknJ97e3ru7u+fn51BOTsPCwqGgoISDg6empmpoaK2srNDQ0FhXV3eXcCcAAAAXdFJOUwCBIZXMGP70BuRH2Ze/LpIMUunHkpQR34sfygAAAVpJREFUOMt1U+magjAMDAVb5BDU3W25b9T1/d9vaYpQKDs/rF9nSNJkArDA9ezQZ8wPbc8FE6eAiQUsOO1o19JolFibKCdHGHC0IJezOMD5snx/yE+KOYYr42fPSufSZyazqDoseTPw4lGJNOu6LBXVUPBG3lqYAOv/5ZwnNUfUifzBt8gkgfgINmjxOpgqUA147QWNaocLniqq3QsSVbQHNp45N/BAwoYQz9oUJEiE4GMGfoBSMj5gjeWRIMMqleD/CAzUHFqTLyjOA5zjNnwa4UCEZ2YK3khEcBXHjVBtEFeIZ6+NxYbPqWp1DLKV42t6Ujn2ydyiPi9nX0TTNAkVVZ/gozsl6FbrktkwaVvL2TRK0C8Ca7Hck7f5OBT6FFbLATkL2ugV0tm0RLM9fedDvhWstl8Wp9AFDjFX7yOY/lJrv8AkYuz7fuP8dv9izCYH+x3/LBnj9fYPBTpJDNzX+7cAAAAASUVORK5CYII=
// @grant        GM_registerMenuCommand
// @grant        GM_unregisterMenuCommand
// @grant        GM_openInTab
// @grant        GM_getValue
// @grant        GM_setValue
// @grant        GM_notification
// @grant        window.onurlchange
// @sandbox      JavaScript
// @license      GPL-3.0 License
// @run-at       document-end
// @namespace    https://greasyfork.org/scripts/412245
// @supportURL   https://github.com/XIU2/UserScript
// @homepageURL  https://github.com/XIU2/UserScript
// ==/UserScript==

(function() {
	'use strict';
	var backColor = '#ffffff', fontColor = '#888888', menu_rawFast = GM_getValue('xiu2_menu_raw_fast'), menu_rawFast_ID, menu_rawDownLink_ID, menu_gitClone_ID, menu_feedBack_ID;
	const download_url_us = [
		//['https://gh.h233.eu.org/https://github.com', '美国', '[美国 Cloudflare CDN] - 该公益加速源由 [@X.I.U/XIU2] 提供'],
		//['https://gh.api.99988866.xyz/https://github.com', '美国', '[美国 Cloudflare CDN] - 该公益加速源由 [hunshcn/gh-proxy] 提供'], // 官方演示站用的人太多了
		['https://gh.ddlc.top/https://github.com', '美国', '[美国 Cloudflare CDN] - 该公益加速源由 [@mtr-static-official] 提供'],
		//['https://gh2.yanqishui.work/https://github.com', '美国', '[美国 Cloudflare CDN] - 该公益加速源由 [@HongjieCN] 提供'], // 解析错误
		['https://dl.ghpig.top/https://github.com', '美国', '[美国 Cloudflare CDN] - 该公益加速源由 [feizhuqwq.com] 提供'],
		//['https://gh.flyinbug.top/gh/https://github.com', '美国', '[美国 Cloudflare CDN] - 该公益加速源由 [Mintimate] 提供'], // 错误
		['https://slink.ltd/https://github.com', '美国', '[美国 Cloudflare CDN] - 该公益加速源由 [知了小站] 提供'],
		//['https://git.xfj0.cn/https://github.com', '美国', '[美国 Cloudflare CDN] - 该公益加速源由 [佚名] 提供'], // 无解析
		['https://gh.con.sh/https://github.com', '美国', '[美国 Cloudflare CDN] - 该公益加速源由 [佚名] 提供'],
		//['https://ghps.cc/https://github.com', '美国', '[美国 Cloudflare CDN] - 该公益加速源由 [佚名] 提供'], // 提示 blocked
		//['https://gh-proxy.com/https://github.com', '美国', '[美国 Cloudflare CDN] - 该公益加速源由 [佚名] 提供'], // 502
		['https://cors.isteed.cc/github.com', '美国', '[美国 Cloudflare CDN] - 该公益加速源由 [@Lufs\'s] 提供'],
		['https://hub.gitmirror.com/https://github.com', '美国', '[美国 Cloudflare CDN] - 该公益加速源由 [GitMirror] 提供'],
		['https://sciproxy.com/github.com', '美国', '[美国 Cloudflare CDN] - 该公益加速源由 [sciproxy.com] 提供'],
		['https://ghproxy.cc/https://github.com', '美国', '[美国 洛杉矶] - 该公益加速源由 [@yionchiii lau] 提供'],
		['https://cf.ghproxy.cc/https://github.com', '美国', '[美国 Cloudflare CDN] - 该公益加速源由 [@yionchiii lau] 提供'],
		['https://gh.jiasu.in/https://github.com', '美国', '[美国 Cloudflare CDN] - 该公益加速源由 [@0-RTT] 提供'],
		['https://dgithub.xyz', '美国', '[美国 西雅图] - 该公益加速源由 [dgithub.xyz] 提供'],
		//['https://download.fgit.cf', '美国', '[美国 洛杉矶] - 该公益加速源由 [FastGit 群组成员] 提供'], // 被投诉挂了
		['https://download.nuaa.cf', '美国', '[美国 洛杉矶] - 该公益加速源由 [FastGit 群组成员] 提供'],
		['https://download.scholar.rr.nu', '美国', '[美国 纽约] - 该公益加速源由 [FastGit 群组成员] 提供'],
		//['https://download.njuu.cf', '美国', '[美国 纽约] - 该公益加速源由 [FastGit 群组成员] 提供'], // 域名挂了
		['https://download.yzuu.cf', '美国', '[美国 纽约] - 该公益加速源由 [FastGit 群组成员] 提供']
	];

	const download_url = [
		//['https://download.fastgit.org', '德国', '[德国] - 该公益加速源由 [FastGit] 提供&#10;&#10;提示：希望大家尽量多使用前面的美国节点（每次随机 4 个来负载均衡），&#10;避免流量都集中到亚洲公益节点，减少成本压力，公益才能更持久~', 'https://archive.fastgit.org'], // 证书过期
		['https://mirror.ghproxy.com/https://github.com', '韩国', '[日本、韩国、德国等]（CDN 不固定） - 该公益加速源由 [ghproxy] 提供&#10;&#10;提示：希望大家尽量多使用前面的美国节点（每次随机 负载均衡），&#10;避免流量都集中到亚洲公益节点，减少成本压力，公益才能更持久~'],
		['https://ghproxy.net/https://github.com', '日本', '[日本 大阪] - 该公益加速源由 [ghproxy] 提供&#10;&#10;提示：希望大家尽量多使用前面的美国节点（每次随机 负载均衡），&#10;避免流量都集中到亚洲公益节点，减少成本压力，公益才能更持久~'],
		['https://kkgithub.com', '香港', '[中国香港、日本、新加坡等] - 该公益加速源由 [help.kkgithub.com] 提供&#10;&#10;提示：希望大家尽量多使用前面的美国节点（每次随机 4 个来负载均衡），&#10;避免流量都集中到亚洲公益节点，减少成本压力，公益才能更持久~'],
		//['https://download.incept.pw', '香港', '[中国香港] - 该公益加速源由 [FastGit 群组成员] 提供&#10;&#10;提示：希望大家尽量多使用前面的美国节点（每次随机 4 个来负载均衡），&#10;避免流量都集中到亚洲公益节点，减少成本压力，公益才能更持久~'] // ERR_SSL_PROTOCOL_ERROR
	];

	const clone_url = [
		['https://gitclone.com', '国内', '[中国 国内] - 该公益加速源由 [GitClone] 提供&#10;&#10; - 缓存：有&#10; - 首次比较慢，缓存后较快'],
		['https://kkgithub.com', '香港', '[中国香港、日本、新加坡等] - 该公益加速源由 [help.kkgithub.com] 提供&#10;&#10; - 缓存：无（或时间很短）'],
		['https://hub.incept.pw', '香港', '[中国香港、美国] - 该公益加速源由 [FastGit 群组成员] 提供'],
		['https://mirror.ghproxy.com/https://github.com', '韩国', '[日本、韩国、德国等]（CDN 不固定） - 该公益加速源由 [ghproxy] 提供&#10;&#10; - 缓存：无（或时间很短）'],
		//['https://gh-proxy.com/https://github.com', '韩国', '[韩国] - 该公益加速源由 [ghproxy] 提供&#10;&#10; - 缓存：无（或时间很短）'],
		['https://githubfast.com', '韩国', '[韩国] - 该公益加速源由 [Github Fast] 提供&#10;&#10; - 缓存：无（或时间很短）'],
		['https://ghproxy.net/https://github.com', '日本', '[日本 大阪] - 该公益加速源由 [ghproxy] 提供&#10;&#10; - 缓存：无（或时间很短）'],
		['https://github.moeyy.xyz/https://github.com', '新加坡', '[新加坡、中国香港、日本等]（CDN 不固定） - 该公益加速源由 [Moeyy] 提供&#10;&#10; - 缓存：无（或时间很短）'],
		//['https://slink.ltd/https://github.com', '美国', '[美国 Cloudflare CDN] - 该公益加速源由 [知了小站] 提供'] // 暂无必要
		//['https://hub.gitmirror.com/https://github.com', '美国', '[美国 Cloudflare CDN] - 该公益加速源由 [GitMirror] 提供'], // 暂无必要
		//['https://sciproxy.com/github.com', '美国', '[美国 Cloudflare CDN] - 该公益加速源由 [sciproxy.com] 提供'], // 暂无必要
		//['https://ghproxy.cc/https://github.com', '美国', '[美国 洛杉矶] - 该公益加速源由 [@yionchiii lau] 提供'], // 暂无必要
		//['https://cf.ghproxy.cc/https://github.com', '美国', '[美国 Cloudflare CDN] - 该公益加速源由 [@yionchiii lau] 提供'], // 暂无必要
		//['https://gh.jiasu.in/https://github.com', '美国', '[美国 Cloudflare CDN] - 该公益加速源由 [@0-RTT] 提供'], // 暂无必要
		//['https://dgithub.xyz', '美国', '[美国 西雅图] - 该公益加速源由 [dgithub.xyz] 提供'], // 暂无必要
		//['https://hub.fgit.cf', '美国', '[美国 洛杉矶] - 该公益加速源由 [FastGit 群组成员] 提供'], // 被投诉挂了
		//['https://hub.nuaa.cf', '美国', '[美国 洛杉矶] - 该公益加速源由 [FastGit 群组成员] 提供'], // 暂无必要
		//['https://hub.scholar.rr.nu', '美国', '[美国 纽约] - 该公益加速源由 [FastGit 群组成员] 提供'], // 暂无必要
		//['https://hub.njuu.cf', '美国', '[美国 纽约] - 该公益加速源由 [FastGit 群组成员] 提供'], // 域名挂了
		//['https://hub.yzuu.cf', '美国', '[美国 纽约] - 该公益加速源由 [FastGit 群组成员] 提供'], // 暂无必要
		//['https://hub.0z.gs', '美国', '[美国 Cloudflare CDN]'], // 域名无解析
		//['https://hub.shutcm.cf', '美国', '[美国 Cloudflare CDN]'] // 连接超时
	];

	const clone_ssh_url = [
		['ssh://git@ssh.github.com:443/', 'Github 原生', '[日本、新加坡等] - Github 官方提供的 443 端口的 SSH（依然是 SSH 协议），适用于限制访问 22 端口的网络环境'],
		['git@ssh.fastgit.org:', '香港', '[中国 香港] - 该公益加速源由 [FastGit] 提供']
		//['git@git.zhlh6.cn:', '美国', '[美国 洛杉矶]'] // 挂了
	];

	const raw_url = [
		['https://raw.githubusercontent.com', 'Github 原生', '[日本 东京]'],
		['https://raw.kkgithub.com', '香港', '[中国香港、日本、新加坡等] - 该公益加速源由 [help.kkgithub.com] 提供&#10;&#10; - 缓存：无（或时间很短）'],
		['https://mirror.ghproxy.com/https://raw.githubusercontent.com', '韩国', '[日本、韩国、德国等]（CDN 不固定） - 该公益加速源由 [ghproxy] 提供&#10;&#10; - 缓存：无（或时间很短）'],
		//['https://gh-proxy.com/https://raw.githubusercontent.com', '韩国 2', '[韩国] - 该公益加速源由 [ghproxy] 提供&#10;&#10; - 缓存：无（或时间很短）'],
		['https://ghproxy.net/https://raw.githubusercontent.com', '日本 1', '[日本 大阪] - 该公益加速源由 [ghproxy] 提供&#10;&#10; - 缓存：无（或时间很短）'],
		['https://fastly.jsdelivr.net/gh', '日本 2', '[日本 东京] - 该公益加速源由 [JSDelivr CDN] 提供&#10;&#10; - 缓存：有&#10; - 不支持大小超过 50 MB 的文件&#10; - 不支持版本号格式的分支名（如 v1.2.3）'],
		['https://fastraw.ixnic.net', '日本 3', '[日本 大阪] - 该公益加速源由 [FastGit 群组成员] 提供&#10;&#10; - 缓存：无（或时间很短）'],
		//['https://gcore.jsdelivr.net/gh', '美国', '[美国 Cloudflare CDN] - 该公益加速源由 [JSDelivr CDN] 提供&#10;&#10; - 缓存：有&#10; - 不支持大小超过 50 MB 的文件&#10; - 不支持版本号格式的分支名（如 v1.2.3）'], // 变成 美国 Cloudflare CDN 了
		['https://cdn.jsdelivr.us/gh', '其他 1', '[韩国、美国、马来西亚、罗马尼亚等]（CDN 不固定） - 该公益加速源由 [@ayao] 提供&#10;&#10; - 缓存：有'],
		//['https://jsdelivr.b-cdn.net/gh', '其他 2', '[中国香港、台湾、日本、新加坡等]（CDN 不固定） - 该公益加速源由 [@rttwyjz] 提供&#10;&#10; - 缓存：有'],
		['https://github.moeyy.xyz/https://raw.githubusercontent.com', '其他 3', '[新加坡、中国香港、日本等]（CDN 不固定）&#10;&#10; - 缓存：无（或时间很短）'],
		['https://raw.cachefly.998111.xyz', '其他 4', '[新加坡、日本、印度等]（Anycast CDN 不固定） - 该公益加速源由 [@XxXxXxXxXxXxXxXxXxXxXxXxXxXxXxXxXxXxX0] 提供&#10;&#10; - 缓存：有（约 12 小时）'],
		//['https://raw.incept.pw', '香港', '[中国香港、美国] - 该公益加速源由 [FastGit 群组成员] 提供&#10;&#10; - 缓存：无（或时间很短）'], // ERR_SSL_PROTOCOL_ERROR
		//['https://ghproxy.cc/https://raw.githubusercontent.com', '美国', '[美国 洛杉矶] - 该公益加速源由 [@yionchiii lau] 提供'], // 暂无必要
		//['https://cf.ghproxy.cc/https://raw.githubusercontent.com', '美国', '[美国 Cloudflare CDN] - 该公益加速源由 [@yionchiii lau] 提供'], // 暂无必要
		//['https://gh.jiasu.in/https://raw.githubusercontent.com', '美国', '[美国 Cloudflare CDN] - 该公益加速源由 [@0-RTT] 提供'], // 暂无必要
		//['https://dgithub.xyz', '美国', '[美国 西雅图] - 该公益加速源由 [dgithub.xyz] 提供'], // 暂无必要
		//['https://raw.fgit.cf', '美国', '[美国 洛杉矶] - 该公益加速源由 [FastGit 群组成员] 提供&#10;&#10; - 缓存：无（或时间很短）'], // 被投诉挂了
		//['https://raw.nuaa.cf', '美国', '[美国 洛杉矶] - 该公益加速源由 [FastGit 群组成员] 提供'], // 暂无必要
		//['https://raw.scholar.rr.nu', '美国', '[美国 纽约] - 该公益加速源由 [FastGit 群组成员] 提供'], // 暂无必要
		//['https://raw.njuu.cf', '美国', '[美国 纽约] - 该公益加速源由 [FastGit 群组成员] 提供&#10;&#10; - 缓存：无（或时间很短）'], // 域名挂了
		//['https://raw.yzuu.cf', '美国', '[美国 纽约] - 该公益加速源由 [FastGit 群组成员] 提供&#10;&#10; - 缓存：无（或时间很短）'], // 暂无必要
		//['https://raw.gitmirror.com', '美国', '[美国 Cloudflare CDN] - 该公益加速源由 [GitMirror] 提供&#10;&#10; - 缓存：有'], // 暂无必要
		//['https://cdn.54188.cf/gh', '美国', '[美国 Cloudflare CDN] - 该公益加速源由 [PencilNavigator] 提供&#10;&#10; - 缓存：有'], // 暂无必要
		//['https://raw.fastgit.org', '德国', '[德国] - 该公益加速源由 [FastGit] 提供&#10;&#10; - 缓存：无（或时间很短）'], // 挂了
		//['https://git.yumenaka.net/https://raw.githubusercontent.com', '美国', '[美国 圣何塞]&#10;&#10; - 缓存：无（或时间很短）'], // 连接超时
	];

	const svg = [
		'<svg class="octicon octicon-cloud-download" aria-hidden="true" height="16" version="1.1" viewBox="0 0 16 16" width="16"><path d="M9 12h2l-3 3-3-3h2V7h2v5zm3-8c0-.44-.91-3-4.5-3C5.08 1 3 2.92 3 5 1.02 5 0 6.52 0 8c0 1.53 1 3 3 3h3V9.7H3C1.38 9.7 1.3 8.28 1.3 8c0-.17.05-1.7 1.7-1.7h1.3V5c0-1.39 1.56-2.7 3.2-2.7 2.55 0 3.13 1.55 3.2 1.8v1.2H12c.81 0 2.7.22 2.7 2.2 0 2.09-2.25 2.2-2.7 2.2h-2V11h2c2.08 0 4-1.16 4-3.5C16 5.06 14.08 4 12 4z"></path></svg>'
	], style = ['padding:0 6px; margin-right: -1px; border-radius: 2px; background-color: var(--XIU2-back-Color); border-color: rgba(27, 31, 35, 0.1); font-size: 11px; color: var(--XIU2-font-Color);'];

	if (menu_rawFast == null){menu_rawFast = 1; GM_setValue('xiu2_menu_raw_fast', 1)};
	if (GM_getValue('menu_rawDownLink') == null){GM_setValue('menu_rawDownLink', true)};
	if (GM_getValue('menu_gitClone') == null){GM_setValue('menu_gitClone', true)};
	registerMenuCommand();
	// 注册脚本菜单
	function registerMenuCommand() {
		// 如果反馈菜单 ID 不是 null，则删除所有脚本菜单
		if (menu_feedBack_ID) {GM_unregisterMenuCommand(menu_rawFast_ID); GM_unregisterMenuCommand(menu_rawDownLink_ID); GM_unregisterMenuCommand(menu_gitClone_ID); GM_unregisterMenuCommand(menu_feedBack_ID); menu_rawFast = GM_getValue('xiu2_menu_raw_fast');}
		// 避免在减少 raw 数组后，用户储存的数据大于数组而报错
		if (menu_rawFast > raw_url.length - 1) menu_rawFast = 0
		menu_rawDownLink_ID = GM_registerMenuCommand(`${GM_getValue('menu_rawDownLink')?'✅':'❌'} 项目列表单文件快捷下载 (☁)`, function(){if (GM_getValue('menu_rawDownLink') == true) {GM_setValue('menu_rawDownLink', false); GM_notification({text: `已关闭「项目列表单文件快捷下载 (☁)」功能\n（点击刷新网页后生效）`, timeout: 3500, onclick: function(){location.reload();}});} else {GM_setValue('menu_rawDownLink', true); GM_notification({text: `已开启「项目列表单文件快捷下载 (☁)」功能\n（点击刷新网页后生效）`, timeout: 3500, onclick: function(){location.reload();}});}registerMenuCommand();}, {title: "点击开关「项目列表单文件快捷下载 (☁)」功能"});
		if (GM_getValue('menu_rawDownLink')) menu_rawFast_ID = GM_registerMenuCommand(`&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;${['0️⃣','1️⃣','2️⃣','3️⃣','4️⃣','5️⃣','6️⃣','7️⃣','8️⃣','9️⃣','🔟'][menu_rawFast]} [ ${raw_url[menu_rawFast][1]} ] 加速源 (☁) - 点击切换`, menu_toggle_raw_fast, {title: "点击切换「项目列表单文件快捷下载 (☁)」功能的加速源"});
		menu_gitClone_ID = GM_registerMenuCommand(`${GM_getValue('menu_gitClone')?'✅':'❌'} 添加 git clone 命令`, function(){if (GM_getValue('menu_gitClone') == true) {GM_setValue('menu_gitClone', false); GM_notification({text: `已关闭「添加 git clone 命令」功能`, timeout: 3500});} else {GM_setValue('menu_gitClone', true); GM_notification({text: `已开启「添加 git clone 命令」功能`, timeout: 3500});}registerMenuCommand();}, {title: "点击开关「添加 git clone 命令」功能"});
		menu_feedBack_ID = GM_registerMenuCommand('💬 反馈问题 & 功能建议', function () {GM_openInTab('https://github.com/XIU2/UserScript', {active: true,insert: true,setParent: true});GM_openInTab('https://greasyfork.org/zh-CN/scripts/412245/feedback', {active: true,insert: true,setParent: true});}, {title: "点击前往反馈问题或提出建议"});
	}

	// 切换加速源
	function menu_toggle_raw_fast() {
		// 如果当前加速源位置大于等于加速源总数，则改为第一个加速源，反之递增下一个加速源
		if (menu_rawFast >= raw_url.length - 1) {menu_rawFast = 0;} else {menu_rawFast += 1;}
		GM_setValue('xiu2_menu_raw_fast', menu_rawFast);
		delRawDownLink(); // 删除旧加速源
		addRawDownLink(); // 添加新加速源
		GM_notification({text: "已切换加速源为：" + raw_url[menu_rawFast][1], timeout: 3000}); // 提示消息
		registerMenuCommand(); // 重新注册脚本菜单
	};

	colorMode(); // 适配白天/夜间主题模式
	setTimeout(addRawFile, 1000); // Raw 加速
	setTimeout(addRawDownLink, 2000); // Raw 单文件快捷下载（☁），延迟 2 秒执行，避免被 pjax 刷掉

	// Tampermonkey v4.11 版本添加的 onurlchange 事件 grant，可以监控 pjax 等网页的 URL 变化
	if (window.onurlchange === undefined) addUrlChangeEvent();
	window.addEventListener('urlchange', function() {
		colorMode(); // 适配白天/夜间主题模式
		if (location.pathname.indexOf('/releases')) addRelease(); // Release 加速
		setTimeout(addRawFile, 1000); // Raw 加速
		setTimeout(addRawDownLink, 2000); // Raw 单文件快捷下载（☁），延迟 2 秒执行，避免被 pjax 刷掉
		setTimeout(addRawDownLink_, 1000); // 在浏览器返回/前进时重新添加 Raw 下载链接（☁）鼠标事件
	});


	// Github Git Clone/SSH、Release、Download ZIP 改版为动态加载文件列表，因此需要监控网页元素变化
	const callback = (mutationsList, observer) => {
		if (location.pathname.indexOf('/releases') > -1) { // Release
			for (const mutation of mutationsList) {
				for (const target of mutation.addedNodes) {
					if (target.nodeType !== 1) return
					if (target.tagName === 'DIV' && target.dataset.viewComponent === 'true' && target.classList[0] === 'Box') addRelease();
				}
			}
		} else if (document.querySelector('#repository-container-header:not([hidden])')) { // 项目首页
			for (const mutation of mutationsList) {
				for (const target of mutation.addedNodes) {
					if (target.nodeType !== 1) return
					if (target.tagName === 'DIV' && target.parentElement.id === '__primerPortalRoot__') {
						addDownloadZIP(target);
						if (addGitClone(target) === false) return;
						if (addGitCloneSSH(target) === false) return;
					} else if (target.tagName === 'DIV' && target.className.indexOf('Box-sc-') !== -1) {
						if (target.querySelector('input[value^="https:"]')) {
							addGitCloneClear('.XIU2-GCS');
							if (addGitClone(target) === false) return;
						} else if (target.querySelector('input[value^="git@"]')) {
							addGitCloneClear('.XIU2-GC');
							if (addGitCloneSSH(target) === false) return;
						} else if (target.querySelector('input[value^="gh "]')) {
							addGitCloneClear('.XIU2-GC, .XIU2-GCS');
						}
					}
				}
			}
		}
	};
	const observer = new MutationObserver(callback);
	observer.observe(document, { childList: true, subtree: true });


	// download_url 随机 4 个美国加速源
	function get_New_download_url() {
		//return download_url_us.concat(download_url) // 全输出调试用
		let shuffled = download_url_us.slice(0), i = download_url_us.length, min = i - 4, temp, index;
		while (i-- > min) {index = Math.floor((i + 1) * Math.random()); temp = shuffled[index]; shuffled[index] = shuffled[i]; shuffled[i] = temp;}
		return shuffled.slice(min).concat(download_url); // 随机洗牌 download_url_us 数组并取前 4 个，然后将其合并至 download_url 数组
	}

	// Release
	function addRelease() {
		let html = document.querySelectorAll('.Box-footer'); if (html.length == 0 || location.pathname.indexOf('/releases') == -1) return
		let divDisplay = 'margin-left: -90px;', new_download_url = get_New_download_url();
		if (document.documentElement.clientWidth > 755) {divDisplay = 'margin-top: -3px;margin-left: 8px;display: inherit;';}; // 调整小屏幕时的样式
		for (const current of html) {
			if (current.querySelector('.XIU2-RS')) continue
			current.querySelectorAll('li.Box-row a').forEach(function (_this) {
				let href = _this.href.split(location.host),
					url = '', _html = `<div class="XIU2-RS" style="${divDisplay}">`;

				for (let i=0;i<new_download_url.length;i++) {
					if (new_download_url[i][3] !== undefined && url.indexOf('/archive/') !== -1) {
						url = new_download_url[i][3] + href[1]
					} else {
						url = new_download_url[i][0] + href[1]
					}
					_html += `<a style="${style[0]}" class="btn" href="${url}" target="_blank" title="${new_download_url[i][2]}" rel="noreferrer noopener nofollow">${new_download_url[i][1]}</a>`
				}
				_this.parentElement.nextElementSibling.insertAdjacentHTML('beforeend', _html + '</div>');
			});
		}
	}


	// Download ZIP
	function addDownloadZIP(target) {
		let html = target.querySelector('ul[class^=List__ListBox-sc-] ul[class^=List__ListBox-sc-]>li:last-child');if (!html) return
		let href_script = document.querySelector('react-partial[partial-name=repos-overview]>script[data-target="react-partial.embeddedData"]'),
			href_slice = href_script.textContent.slice(href_script.textContent.indexOf('"zipballUrl":"')+14),
			href = href_slice.slice(0, href_slice.indexOf('"')),
			url = '', _html = '', new_download_url = get_New_download_url();

		// 克隆原 Download ZIP 元素，并定位 <a> <span> 标签
		let html_clone = html.cloneNode(true),
			html_clone_a = html_clone.querySelector('a[href$=".zip"]'),
			html_clone_span = html_clone.querySelector('span[id]');

		for (let i=0;i<new_download_url.length;i++) {
			if (new_download_url[i][3] === '') continue

			if (new_download_url[i][3] !== undefined) {
				url = new_download_url[i][3] + href
			} else {
				url = new_download_url[i][0] + href
			}
			html_clone_a.href = url
			html_clone_a.setAttribute('title', new_download_url[i][2].replaceAll('&#10;','\n'))
			html_clone_span.textContent = 'Download ZIP ' + new_download_url[i][1]
			_html += html_clone.outerHTML
		}
		html.insertAdjacentHTML('afterend', _html);
	}

	// Git Clone 切换清理
	function addGitCloneClear(css) {
		document.querySelectorAll(css).forEach((e)=>{e.remove()})
	}

	// Git Clone
	function addGitClone(target) {
		let html = target.querySelector('input[value^="https:"]');if (!html) return
		if (!html.nextElementSibling) return false;
		let href_split = html.value.split(location.host)[1],
			html_parent = '<div style="margin-top: 4px;" class="XIU2-GC ' + html.parentElement.className + '">',
			url = '', _html = '', _gitClone = '';
		html.nextElementSibling.hidden = true; // 隐藏右侧复制按钮（考虑到能直接点击复制，就不再重复实现复制按钮事件了）
		if (GM_getValue('menu_gitClone')) {_gitClone='git clone '; html.value = _gitClone + html.value; html.setAttribute('value', html.value);}
		// 克隆原 Git Clone 元素
		let html_clone = html.cloneNode(true);
		for (let i=0;i<clone_url.length;i++) {
			if (clone_url[i][0] === 'https://gitclone.com') {
				url = clone_url[i][0] + '/github.com' + href_split
			} else {
				url = clone_url[i][0] + href_split
			}
			html_clone.title = `${url}\n\n${clone_url[i][2].replaceAll('&#10;','\n')}\n\n提示：点击文字可直接复制`
			html_clone.setAttribute('value', _gitClone + url)
			_html += html_parent + html_clone.outerHTML + '</div>'
		}
		html.parentElement.insertAdjacentHTML('afterend', _html);
	}


	// Git Clone SSH
	function addGitCloneSSH(target) {
		let html = target.querySelector('input[value^="git@"]');if (!html) return
		if (!html.nextElementSibling) return false;
		let href_split = html.value.split(':')[1],
			html_parent = '<div style="margin-top: 4px;" class="XIU2-GCS ' + html.parentElement.className + '">',
			url = '', _html = '', _gitClone = '';
		html.nextElementSibling.hidden = true; // 隐藏右侧复制按钮（考虑到能直接点击复制，就不再重复实现复制按钮事件了）
		if (GM_getValue('menu_gitClone')) {_gitClone='git clone '; html.value = _gitClone + html.value; html.setAttribute('value', html.value);}
		// 克隆原 Git Clone SSH 元素
		let html_clone = html.cloneNode(true);
		for (let i=0;i<clone_ssh_url.length;i++) {
			url = clone_ssh_url[i][0] + href_split
			html_clone.title = `${url}\n\n${clone_ssh_url[i][2].replaceAll('&#10;','\n')}\n\n提示：点击文字可直接复制`
			html_clone.setAttribute('value', _gitClone + url)
			_html += html_parent + html_clone.outerHTML + '</div>'
		}
		html.parentElement.insertAdjacentHTML('afterend', _html);
	}


	// Raw
	function addRawFile() {
		let html = document.querySelector('a[data-testid="raw-button"]');if (!html) return
		let href = location.href.replace(`https://${location.host}`,''),
			href2 = href.replace('/blob/','/'),
			url = '', _html = '';

		for (let i=1;i<raw_url.length;i++) {
			if ((raw_url[i][0].indexOf('/gh') + 3 === raw_url[i][0].length) && raw_url[i][0].indexOf('cdn.staticaly.com') === -1) {
				url = raw_url[i][0] + href.replace('/blob/','@');
			} else {
				url = raw_url[i][0] + href2;
			}
			_html += `<a href="${url}" title="${raw_url[i][2]}" target="_blank" role="button" rel="noreferrer noopener nofollow" data-size="small" class="${html.className} XIU2-RF">${raw_url[i][1].replace(/ \d/,'')}</a>`
		}
		if (document.querySelector('.XIU2-RF')) document.querySelectorAll('.XIU2-RF').forEach((e)=>{e.remove()})
		html.insertAdjacentHTML('afterend', _html);
	}


	// Raw 单文件快捷下载（☁）
	function addRawDownLink() {
		if (!GM_getValue('menu_rawDownLink')) return
		// 如果不是项目文件页面，就返回，如果网页有 Raw 下载链接（☁）就返回
		let files = document.querySelectorAll('div.Box-row svg.octicon.octicon-file, .react-directory-filename-column>svg.color-fg-muted');if(files.length === 0) return;if (location.pathname.indexOf('/tags') > -1) return
		let files1 = document.querySelectorAll('a.fileDownLink');if(files1.length > 0) return;

		// 鼠标指向则显示
		var mouseOverHandler = function(evt) {
			let elem = evt.currentTarget,
				aElm_new = elem.querySelectorAll('.fileDownLink'),
				aElm_now = elem.querySelectorAll('svg.octicon.octicon-file, svg.color-fg-muted');
			aElm_new.forEach(el=>{el.style.cssText = 'display: inline'});
			aElm_now.forEach(el=>{el.style.cssText = 'display: none'});
		};

		// 鼠标离开则隐藏
		var mouseOutHandler = function(evt) {
			let elem = evt.currentTarget,
				aElm_new = elem.querySelectorAll('.fileDownLink'),
				aElm_now = elem.querySelectorAll('svg.octicon.octicon-file, svg.color-fg-muted');
			aElm_new.forEach(el=>{el.style.cssText = 'display: none'});
			aElm_now.forEach(el=>{el.style.cssText = 'display: inline'});
		};

		// 循环添加
		files.forEach(function(fileElm) {
			let trElm = fileElm.parentNode.parentNode,
				cntElm_a = trElm.querySelector('[role="rowheader"] > .css-truncate.css-truncate-target.d-block.width-fit > a, .react-directory-truncate>a'),
				Name = cntElm_a.innerText,
				href = cntElm_a.getAttribute('href'),
				href2 = href.replace('/blob/','/'), url = '';
			if ((raw_url[menu_rawFast][0].indexOf('/gh') + 3 === raw_url[menu_rawFast][0].length) && raw_url[menu_rawFast][0].indexOf('cdn.staticaly.com') === -1) {
				url = raw_url[menu_rawFast][0] + href.replace('/blob/','@');
			} else {
				url = raw_url[menu_rawFast][0] + href2;
			}

			fileElm.insertAdjacentHTML('afterend', `<a href="${url}?DS_DOWNLOAD" download="${Name}" target="_blank" rel="noreferrer noopener nofollow" class="fileDownLink" style="display: none;" title="「${raw_url[menu_rawFast][1]}」&#10;&#10;左键点击下载文件（注意：鼠标点击 [☁] 图标进行下载，而不是文件名！）&#10;&#10;${raw_url[menu_rawFast][2]}&#10;&#10;提示：点击页面右侧飘浮着的 TamperMonkey 扩展图标中的菜单「 [${raw_url[menu_rawFast][1]}] 加速源 (☁) 」即可切换。">${svg[0]}</a>`);
			// 绑定鼠标事件
			trElm.onmouseover = mouseOverHandler;
			trElm.onmouseout = mouseOutHandler;
		});
	}


	// 移除 Raw 单文件快捷下载（☁）
	function delRawDownLink() {
		if (!GM_getValue('menu_rawDownLink')) return
		let aElm = document.querySelectorAll('.fileDownLink');if(aElm.length === 0) return;
		aElm.forEach(function(fileElm) {fileElm.remove();})
	}


	// 在浏览器返回/前进时重新添加 Raw 单文件快捷下载（☁）鼠标事件
	function addRawDownLink_() {
		if (!GM_getValue('menu_rawDownLink')) return
		// 如果不是项目文件页面，就返回，如果网页没有 Raw 下载链接（☁）就返回
		let files = document.querySelectorAll('div.Box-row svg.octicon.octicon-file, .react-directory-filename-column>svg.color-fg-muted');if(files.length === 0) return;
		let files1 = document.querySelectorAll('a.fileDownLink');if(files1.length === 0) return;

		// 鼠标指向则显示
		var mouseOverHandler = function(evt) {
			let elem = evt.currentTarget,
				aElm_new = elem.querySelectorAll('.fileDownLink'),
				aElm_now = elem.querySelectorAll('svg.octicon.octicon-file, svg.color-fg-muted');
			aElm_new.forEach(el=>{el.style.cssText = 'display: inline'});
			aElm_now.forEach(el=>{el.style.cssText = 'display: none'});
		};

		// 鼠标离开则隐藏
		var mouseOutHandler = function(evt) {
			let elem = evt.currentTarget,
				aElm_new = elem.querySelectorAll('.fileDownLink'),
				aElm_now = elem.querySelectorAll('svg.octicon.octicon-file, svg.color-fg-muted');
			aElm_new.forEach(el=>{el.style.cssText = 'display: none'});
			aElm_now.forEach(el=>{el.style.cssText = 'display: inline'});
		};
		// 循环添加
		files.forEach(function(fileElm) {
			let trElm = fileElm.parentNode.parentNode;
			// 绑定鼠标事件
			trElm.onmouseover = mouseOverHandler;
			trElm.onmouseout = mouseOutHandler;
		});
	}


	// 适配白天/夜间主题模式
	function colorMode() {
		let style_Add;
		if (document.getElementById('XIU2-Github')) {style_Add = document.getElementById('XIU2-Github')} else {style_Add = document.createElement('style'); style_Add.id = 'XIU2-Github'; style_Add.type = 'text/css';}
		backColor = '#ffffff'; fontColor = '#888888';

		if (document.lastElementChild.dataset.colorMode === 'dark') { // 如果是夜间模式
			if (document.lastElementChild.dataset.darkTheme === 'dark_dimmed') {
				backColor = '#272e37'; fontColor = '#768390';
			} else {
				backColor = '#161a21'; fontColor = '#97a0aa';
			}
		} else if (document.lastElementChild.dataset.colorMode === 'auto') { // 如果是自动模式
			if (window.matchMedia('(prefers-color-scheme: dark)').matches || document.lastElementChild.dataset.lightTheme.indexOf('dark') > -1) { // 如果浏览器是夜间模式 或 白天模式是 dark 的情况
				if (document.lastElementChild.dataset.darkTheme === 'dark_dimmed') {
					backColor = '#272e37'; fontColor = '#768390';
				} else if (document.lastElementChild.dataset.darkTheme.indexOf('light') == -1) { // 排除夜间模式是 light 的情况
					backColor = '#161a21'; fontColor = '#97a0aa';
				}
			}
		}

		document.lastElementChild.appendChild(style_Add).textContent = `.XIU2-RS a {--XIU2-back-Color: ${backColor}; --XIU2-font-Color: ${fontColor};}`;
	}


	// 自定义 urlchange 事件（用来监听 URL 变化），针对非 Tampermonkey 油猴管理器
	function addUrlChangeEvent() {
		history.pushState = ( f => function pushState(){
			var ret = f.apply(this, arguments);
			window.dispatchEvent(new Event('pushstate'));
			window.dispatchEvent(new Event('urlchange'));
			return ret;
		})(history.pushState);

		history.replaceState = ( f => function replaceState(){
			var ret = f.apply(this, arguments);
			window.dispatchEvent(new Event('replacestate'));
			window.dispatchEvent(new Event('urlchange'));
			return ret;
		})(history.replaceState);

		window.addEventListener('popstate',()=>{ // 点击浏览器的前进/后退按钮时触发 urlchange 事件
			window.dispatchEvent(new Event('urlchange'))
		});
	}
})();
