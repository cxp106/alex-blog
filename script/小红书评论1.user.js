// ==UserScript==
// @name         小红书
// @namespace    http://tampermonkey.net/
// @version      2025-01-03
// @description  try to take over the world!
// @author       You
// @match        https://www.xiaohongshu.com/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=xiaohongshu.com
// @grant        none
// ==/UserScript==
 
 
 
//文件的保存
 
function saveTextToFile(text, filename) {
    // 创建一个Blob对象，表示一个不可变的原始数据的类文件对象
    const blob = new Blob([text], { type: 'text/plain' });
 
    // 创建一个链接元素
    const a = document.createElement('a');
    // 创建一个下载链接指向Blob对象
    a.href = URL.createObjectURL(blob);
    // 设置下载的文件名
    a.download = filename;
 
    // 将链接元素添加到文档中（为了触发点击）
    document.body.appendChild(a);
    // 触发链接的点击事件
    a.click();
 
    // 移除链接元素
    document.body.removeChild(a);
    // 释放URL对象所占用的内存
    URL.revokeObjectURL(a.href);
}
 
// 使用函数保存数据到TXT文件
//saveTextToFile('这是要保存到文件中的数据', 'example.txt');
 
var Text_Context=[];
//时间的设置
function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}
//向下移动
async function yanchi(){
 
 
    for (let i = 0; i <100; i++) {
        let length_num=document.getElementsByClassName('reply icon-container').length
        let content=document.getElementsByClassName('reply icon-container')[length_num-1]//textContent
        content.scrollIntoView({ behavior: "smooth", block: "end" })
        await sleep(100); // 暂停2秒
        console.log("3秒已过",length_num);
    }
    await sleep(2000); // 暂停2秒
    get_datas()
};
//获取数据
async function get_datas(){
 
    let length_=document.getElementsByClassName('note-text').length
    for (let i = 0; i < length_-1; i++) {
        await sleep(500); // 暂停2秒
        let content=document.getElementsByClassName('note-text')[i].textContent
 
        Text_Context.push(String(content));
        Text_Context.push('\n');
        console.log("3秒已过");
 
    }
    let xixi=document.getElementsByClassName('username')[0].textContent
    saveTextToFile(Text_Context, xixi+'.txt')
 
}
//主函数
(function() {
    'use strict';
    console.log(111)
    window.addEventListener('load', function() {
        setTimeout(function() {
            let gundon=document.getElementsByClassName('comments-container');
            yanchi()
            //get_datas()
        }, 1000); // 5000 毫秒 = 5 秒
    });
 
    window.addEventListener('load', function() {
        setTimeout(function() {
            let gundon=document.getElementsByClassName('comments-container');
 
            //get_datas()
        }, 1000);
    });
 
 
    console.log(Text_Context)
 
 
})();