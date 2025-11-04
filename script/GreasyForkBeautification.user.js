// ==UserScript==
// @author            Hunlongyu
// @name              Greasy Fork 美化
// @namespace         https://github.com/Hunlongyu
// @icon              https://i.loli.net/2019/04/22/5cbd720718fdb.png
// @description       对 Greasy Fork 脚本网站进行美化。部分 UI 模仿 element-ui。
// @version           0.0.3
// @include           *://greasyfork.org/*
// @grant             GM_addStyle
// @run-at            document-start
// @updateURL         https://gist.githubusercontent.com/Hunlongyu/9c2954b6e627218783f44dc5905ed803/raw/greasyfork_beautify.user.js
// @downloadURL       https://gist.githubusercontent.com/Hunlongyu/9c2954b6e627218783f44dc5905ed803/raw/greasyfork_beautify.user.js
// @supportURL        https://gist.github.com/Hunlongyu/9c2954b6e627218783f44dc5905ed803
// ==/UserScript==

(function () {
  "use strict";

  const css = `
    /* 设置字体 */
    body, body:lang(zh-CN){
      font-family: Helvetica Neue,Helvetica,PingFang SC,Hiragino Sans GB,Microsoft YaHei,SimSun,sans-serif;
      font-weight: 400;
      -webkit-font-smoothing: antialiased;
      -webkit-tap-highlight-color: transparent;
      background-color: #fff;
      color: #555;
    }

    /* 设置默认 a 链接样式 */
    a{text-decoration: none; color: #409eff;}
    a:visited, a:hover, a:active{ color: #1989fa;}

    /* 默认 h3 样式 */
    h3{ color: #444; font-size: 24px; }
    p{ color: #555; font-size: 16px; }

    /* 头部样式 */
    #main-header{ background-color: #fff; background-image: none; color: #1989fa; height: 100px; padding: 0; box-shadow: none; border-bottom: 1px solid #dcdfe6; }
    /* 头部 a 链接样式 */
    #main-header, #main-header a, #main-header a:visited, #main-header a:active{color: #409eff;}
    /* 头部子元素样式 */
    #main-header .width-constraint{ padding: 0; height: 100%; }
    #site-name{ display: none; justify-content: flex-start; align-items: center; height: 100%; }
    /* 网站 logo + 名称 */
    #site-name img{width: 60px;height: 60px;}
    #main-header h1{ font-size: 34px; margin-left: 10px;}
    /* 名字 */
    #nav-user-info{ padding-top: 10px; }
    .user-profile-link, .sign-out-link{ font-size: 16px; opacity: 0.8; }
    .user-profile-link:hover, .sign-out-link:hover{ opacity: 1; }
    .sign-out-link{ font-size: 12px; margin: 0 10px; }
    /* 语言选择 */
    #language-selector select{ border: none; color: #888; opacity: 0.6; font-size: 12px; text-align: right; }
    /* 脚本列表 + 论坛 + 站点帮助 + 更多 */
    .scripts-index-link, .forum-link, .help-link, .with-submenu{ font-size: 16px; padding: 0 0px 10px 22px; opacity: 0.8; }
    #site-nav nav a:hover{ color: #1989fa; opacity: 1; }
    .with-submenu nav{ background-color: #fff; }
    /* 主体 */
    .script-list, .user-list, .text-content{ border: none;box-shadow: none; }
    /* 大标题 */
    .text-content h2{ font-size: 28px; color: #555; }
    /* 搜索框 */
    .home-search input[type=search]{ border: 1px solid #dcdfe6; color: #606266; height: 32px; line-height: 32px; font-size: 16px;text-indent: 10px; border-radius: 4px; }
    #home-top-sites{ margin-top: 8px; font-size: 14px; color: #555; }
    #home-script-nav{ border: none; }

    /* 脚本列表页面 */
    .script-list li { padding: 1em 0; border-bottom: 1px solid #dcdfe6; }
    .script-list h2{ font-weight: 600; }
    .script-list h2 a{ color: #333; }
    .script-list h2 a:hover { color: #1989fa; }
    /* 脚本描述 */
    .inline-script-stats dt{ font-weight: 400; font-size: 12px; width: 60px; color: #333; }
    .good-rating-count{ border-color: #c2e7b0; color: #67c23a; background: #f0f9eb; }
    .ok-rating-count{ color: #e6a23c; background: #fdf6ec; border-color: #f5dab1; }
    .bad-rating-count{ color: #f56c6c; background: #fef0f0; border-color: #fbc4c4; }
    /* 翻页 */
    .pagination>*, .script-list+.pagination>*, .user-list+.pagination>* { background-color: #fff;padding: 10px 15px; }
    .pagination>a:hover,.pagination>a:focus{ background-color:#fafafa; }
    /* 侧边搜索栏 */
    .sidebar-search input[type=search]{ border: 1px solid #dcdfe6; color: #606266; height: 28px; line-height: 28px; font-size: 12px;text-indent: 10px; border-radius: 4px; }
    /* 侧边栏 */
    .list-option-group .list-current{ border-left: 6px solid #1989fa; }
    .list-option-group ul { border-radius: 2px; }
    /* 广告 */
    .ad, .carbon-ad { display: none !important; }

    /* 脚本详情页 */
    #script-info{ border-radius: 2px; box-shadow: 0 0 3px #dcdfe6; }
    .tabs .current { border-top: 7px solid #1989fa; background: none; }
    .tabs>*>* { padding: 0.25em 1em 0.5em; }
    #script-applies-to dt {width: 60px;}
    #additional-info>div { background-color: #fafafa; }
    .jslghtbx-next.jslghtbx-no-img{ border-top: 50px solid transparent; border-bottom: 50px solid transparent; }
    .jslghtbx-prev.jslghtbx-no-img{ border-top: 50px solid transparent; border-bottom: 50px solid transparent; }
    .prettyprint{ font-family: Menlo,Monaco,Consolas,Courier,monospace; }
    #discussions li { margin: 15px 0; }
  `;
  GM_addStyle(css);

    // 创建link标签并设置属性
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = 'https://developer.huawei.com/config/commonResource/font/font.css';
    document.head.appendChild(link);

    // 创建style标签并设置样式
    const style = document.createElement('style');
    style.textContent = `
        * {
            font-family: 'HarmonyOS Sans', 'HarmonyOS_Regular' !important;
        }
    `;
    document.head.appendChild(style);
})();
