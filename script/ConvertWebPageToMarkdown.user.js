// ==UserScript==
// @name         Easy Web Page to Markdown
// @name:zh      网页转 Markdown 工具
// @namespace    http://tampermonkey.net/
// @version      1.0.3
// @description  Convert selected HTML to Markdown
// @description:zh 将选定的 HTML 转换为 Markdown
// @author       千川汇海
// @match        *://*/*
// @grant        GM_addStyle
// @grant        GM_registerMenuCommand
// @grant        GM_setClipboard
// @grant        GM_setValue
// @grant        GM_getValue
// @require      https://code.jquery.com/jquery-3.6.0.min.js
// @require      https://cdnjs.cloudflare.com/ajax/libs/jqueryui/1.12.1/jquery-ui.min.js
// @require      https://unpkg.com/turndown/dist/turndown.js
// @require      https://unpkg.com/@guyplusplus/turndown-plugin-gfm/dist/turndown-plugin-gfm.js
// @require      https://cdn.jsdelivr.net/npm/markdown-it@14.1.0/dist/markdown-it.min.js
// @license      AGPL-3.0
// @run-at       context-menu
// ==/UserScript==

(function () {
  "use strict";
  // User Config
  // Short cut
  const shortCutUserConfig = {
    /* Example:
        "Shift": false,
        "Ctrl": true,
        "Alt": false,
        "Key": "m"
        */
  };
  // Obsidian
  const obsidianUserConfig = {
    /* Example:
            "my note": [
                "Inbox/Web/",
                "Collection/Web/Reading/"
            ]
        */
  };
  const guide = `
- 使用**方向键**选择元素
    - 上：选择父元素
    - 下：选择第一个子元素
    - 左：选择上一个兄弟元素
    - 右：选择下一个兄弟元素
- 使用**滚轮**放大缩小
    - 上：选择父元素
    - 下：选择第一个子元素
- 点击元素选择
- 按下 \`Esc\` 键取消选择
    `;
  // 全局变量
  let isSelecting = false;
  let selectedElement = null;
  let shortCutConfig, obsidianConfig;
  // 读取配置
  // 初始化快捷键配置
  let storedShortCutConfig = GM_getValue("shortCutConfig");
  if (Object.keys(shortCutUserConfig).length !== 0) {
    GM_setValue("shortCutConfig", JSON.stringify(shortCutUserConfig));
    shortCutConfig = shortCutUserConfig;
  } else if (storedShortCutConfig) {
    shortCutConfig = JSON.parse(storedShortCutConfig);
  }
  // 初始化 Obsidian 配置
  let storedObsidianConfig = GM_getValue("obsidianConfig");
  if (Object.keys(obsidianUserConfig).length !== 0) {
    GM_setValue("obsidianConfig", JSON.stringify(obsidianUserConfig));
    obsidianConfig = obsidianUserConfig;
  } else if (storedObsidianConfig) {
    obsidianConfig = JSON.parse(storedObsidianConfig);
  }
  // Markdown to HTML
  const md = new window.markdownit({
    // highlight: function (str, lang) {
    //   if (lang && lang && hljs.getLanguage(lang)) {
    //     try {
    //       return hljs.highlight(str, { language: lang }).value;
    //     } catch (__) {}
    //   } else {
    //     try {
    //       return hljs.highlight(str).value;
    //     } catch (__) {}
    //   }
    //   return md.utils.escapeHtml(str);
    // },
  });
  function md2html(markdown) {
    return md.render(markdown);
  }
  // HTML2Markdown
  function convertToMarkdown(element) {
    const html = element.outerHTML;
    let turndownMd = turndownService.turndown(html);
    turndownMd = turndownMd.replaceAll("[\n\n]", "[]"); // 防止 <a> 元素嵌套的暂时方法，并不完善
    return turndownMd;
  }
  // 预览
  function showMarkdownModal(markdown) {
    const $modal = $(`
                    <div class="h2m-modal-overlay">
                        <div class="h2m-modal">
                            <textarea>${markdown}</textarea>
                            <div class="h2m-preview">${md2html(markdown)}</div>
                            <div class="h2m-buttons">
                                <button class="h2m-copy">Copy to clipboard</button>
                                <button class="h2m-download">Download as MD</button>
                                <select class="h2m-obsidian-select">Send to Obsidian</select>
                            </div>
                            <button class="h2m-close">X</button>
                        </div>
                    </div>
                `);
    $modal
      .find(".h2m-obsidian-select")
      .append($("<option>").val("").text("Send to Obsidian"));
    for (const vault in obsidianConfig) {
      for (const path of obsidianConfig[vault]) {
        // 插入元素
        const $option = $("<option>")
          .val(`obsidian://advanced-uri?vault=${vault}&filepath=${path}`)
          .text(`${vault}: ${path}`);
        $modal.find(".h2m-obsidian-select").append($option);
      }
    }
    $modal.find("textarea").on("input", function () {
      // console.log("Input event triggered");
      const markdown = $(this).val();
      const html = md2html(markdown);
      // console.log("Markdown:", markdown);
      // console.log("HTML:", html);
      $modal.find(".h2m-preview").html(html);
    });
    $modal.on("keydown", function (e) {
      if (e.key === "Escape") {
        $modal.remove();
      }
    });
    $modal.find(".h2m-copy").on("click", function () {
      // 复制到剪贴板
      GM_setClipboard($modal.find("textarea").val());
      $modal.find(".h2m-copy").text("Copied!");
      setTimeout(() => {
        $modal.find(".h2m-copy").text("Copy to clipboard");
      }, 1000);
    });
    $modal.find(".h2m-download").on("click", function () {
      // 下载
      const markdown = $modal.find("textarea").val();
      const blob = new Blob([markdown], { type: "text/markdown" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      // 当前页面标题 + 时间
      a.download = `${document.title}-${new Date()
        .toISOString()
        .replace(/:/g, "-")}.md`;
      a.click();
    });
    $modal.find(".h2m-obsidian-select").on("change", function () {
      // 发送到 Obsidian
      const val = $(this).val();
      if (!val) return;
      const markdown = $modal.find("textarea").val();
      GM_setClipboard(markdown);
      const title = document.title.replaceAll(/[\\/:*?"<>|]/g, "_"); // File name cannot contain any of the following characters: * " \ / < > : | ?
      const url = `${val}${title}.md&clipboard=true`;
      window.open(url);
    });
    $modal.find(".h2m-close").on("click", function () {
      // 关闭按钮 X
      $modal.remove();
    });
    // 同步滚动
    // 获取两个元素
    const $textarea = $modal.find("textarea");
    const $preview = $modal.find(".h2m-preview");
    let isScrolling = false;
    // 当 textarea 滚动时，设置 preview 的滚动位置
    $textarea.on("scroll", function () {
      if (isScrolling) {
        isScrolling = false;
        return;
      }
      const scrollPercentage =
        this.scrollTop / (this.scrollHeight - this.offsetHeight);
      $preview[0].scrollTop =
        scrollPercentage *
        ($preview[0].scrollHeight - $preview[0].offsetHeight);
      isScrolling = true;
    });
    // 当 preview 滚动时，设置 textarea 的滚动位置
    $preview.on("scroll", function () {
      if (isScrolling) {
        isScrolling = false;
        return;
      }
      const scrollPercentage =
        this.scrollTop / (this.scrollHeight - this.offsetHeight);
      $textarea[0].scrollTop =
        scrollPercentage *
        ($textarea[0].scrollHeight - $textarea[0].offsetHeight);
      isScrolling = true;
    });
    $(document).on("keydown", function (e) {
      if (e.key === "Escape" && $(".h2m-modal-overlay").length > 0) {
        $(".h2m-modal-overlay").remove();
      }
    });
    $("body").append($modal);
  }
  // 开始选择
  function startSelecting() {
    $("body").addClass("h2m-no-scroll"); // 防止页面滚动
    isSelecting = true;
    // 操作指南
    tip(md2html(guide));
  }
  // 结束选择
  function endSelecting() {
    isSelecting = false;
    $(".h2m-selection-box").removeClass("h2m-selection-box");
    $("body").removeClass("h2m-no-scroll");
    $(".h2m-tip").remove();
  }
  function tip(message, timeout = null) {
    var $tipElement = $("<div>")
      .addClass("h2m-tip")
      .html(message)
      .appendTo("body")
      .hide()
      .fadeIn(200);
    if (timeout === null) {
      return;
    }
    setTimeout(function () {
      $tipElement.fadeOut(200, function () {
        $tipElement.remove();
      });
    }, timeout);
  }
  // Turndown 配置
  const turndownPluginGfm = TurndownPluginGfmService;
  const turndownService = new TurndownService({ codeBlockStyle: "fenced" });
  // 自定义规则来处理带链接的标题
  turndownService.addRule("heading", {
    filter: function (node) {
      return (
        node.nodeName === "H1" ||
        node.nodeName === "H2" ||
        node.nodeName === "H3" ||
        node.nodeName === "H4" ||
        node.nodeName === "H5" ||
        node.nodeName === "H6"
      );
    },
    replacement: function (content, node) {
      const level = parseInt(node.nodeName.charAt(1), 10);
      let headingContent = "";

      // 处理标题内的链接
      node.childNodes.forEach((child) => {
        if (child.nodeName === "A") {
          const linkText = child.textContent;
          const linkHref = child.getAttribute("href");
          headingContent += `[${linkText}](${linkHref})`;
        } else if (child.nodeType === Node.TEXT_NODE) {
          headingContent += child.textContent;
        }
      });

      return `${"#".repeat(level)} ${headingContent}\n`;
    },
  });
  // 过滤掉 script 和 style
  turndownService.addRule("filterScriptAndStyle", {
    filter: ["script", "style"], // 过滤的节点
    replacement: function (content, node, options) {
      return ""; // 返回空字符串，表示忽略这些节点
    },
  });
  // 自定义规则来处理 `img` 标签
  turndownService.addRule("image", {
    filter: function (node) {
      return node.nodeName === "IMG"; // 过滤出所有 img 标签
    },
    replacement: function (content, node) {
      const html = node.outerHTML;

      // 使用正则表达式提取 `src` 和 `alt` 属性
      const srcMatch = html.match(/src\s*=\s*"([^"]+)"/);
      const altMatch = html.match(/alt\s*=\s*"([^"]*)"/);

      const src = srcMatch ? srcMatch[1] : "";
      const alt = altMatch ? altMatch[1] : "";

      // 返回标准 Markdown 图片格式
      return `![${alt}](${src})`;
    },
  });
  turndownPluginGfm.gfm(turndownService); // 引入全部插件
  // turndownService.addRule('strikethrough', {
  //     filter: ['del', 's', 'strike'],
  //     replacement: function (content) {
  //         return '~' + content + '~'
  //     }
  // });
  // turndownService.addRule('latex', {
  //     filter: ['mjx-container'],
  //     replacement: function (content, node) {
  //         const text = node.querySelector('img')?.title;
  //         const isInline = !node.getAttribute('display');
  //         if (text) {
  //             if (isInline) {
  //                 return '$' + text + '$'
  //             }
  //             else {
  //                 return '$$' + text + '$$'
  //             }
  //         }
  //         return '';
  //     }
  // });
  // 添加 CSS 样式
  GM_addStyle(`
        .h2m-selection-box {
            border: 2px dashed #f00;
            background-color: rgba(255, 0, 0, 0.2);
        }
        .h2m-no-scroll {
            overflow: hidden;
            z-index: 9997;
        }
        .h2m-modal {
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            width: 80%;
            height: 80%;
            background: white;
            border-radius: 10px;
            display: flex;
            flex-direction: row;
            z-index: 9999;
        }
        .h2m-modal-overlay {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.5);
            z-index: 9998;
        }
        .h2m-modal textarea,
        .h2m-modal .h2m-preview {
            width: 50%;
            height: 100%;
            padding: 20px;
            box-sizing: border-box;
            overflow-y: auto;
        }
        .h2m-modal .h2m-buttons {
            position: absolute;
            bottom: 10px;
            right: 10px;
        }
        .h2m-modal .h2m-buttons button,
        .h2m-modal .h2m-obsidian-select {
            margin-left: 10px;
            background-color: #4CAF50; /* Green */
            border: none;
            color: white;
            padding: 13px 16px;
            border-radius: 10px;
            text-align: center;
            text-decoration: none;
            display: inline-block;
            font-size: 16px;
            transition-duration: 0.4s;
            cursor: pointer;
        }
        .h2m-modal .h2m-buttons button:hover,
        .h2m-modal .h2m-obsidian-select:hover {
            background-color: #45a049;
        }
        .h2m-modal .h2m-close {
            position: absolute;
            top: 10px;
            right: 10px;
            cursor: pointer;
            width: 25px;
            height: 25px;
            background-color: #f44336;
            color: white;
            font-size: 16px;
            border-radius: 50%;
            display: flex;
            justify-content: center;
            align-items: center;
        }
        .h2m-tip {
            position: fixed;
            top: 22%;
            left: 82%;
            transform: translate(-50%, -50%);
            background-color: white;
            border: 1px solid black;
            padding: 8px;
            z-index: 9999;
            border-radius: 10px;
            box-shadow: 5px 5px 10px rgba(0, 0, 0, 0.5);
            background-color: rgba(255, 255, 255, 0.7);
        }
            .h2m-preview{-ms-text-size-adjust:100%;-webkit-text-size-adjust:100%;margin:0;color:#1f2328;background-color:#ffffff;font-family:-apple-system,BlinkMacSystemFont,"Segoe UI","Noto Sans",Helvetica,Arial,sans-serif,"Apple Color Emoji","Segoe UI Emoji";font-size:16px;line-height:1.5;word-wrap:break-word;scroll-behavior:auto;}.h2m-preview .octicon{display:inline-block;fill:currentColor;vertical-align:text-bottom;}.h2m-preview h1:hover .anchor .octicon-link:before,.h2m-preview h2:hover .anchor .octicon-link:before,.h2m-preview h3:hover .anchor .octicon-link:before,.h2m-preview h4:hover .anchor .octicon-link:before,.h2m-preview h5:hover .anchor .octicon-link:before,.h2m-preview h6:hover .anchor .octicon-link:before{width:16px;height:16px;content:' ';display:inline-block;background-color:currentColor;-webkit-mask-image:url("data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 16 16' version='1.1' aria-hidden='true'><path fill-rule='evenodd' d='M7.775 3.275a.75.75 0 001.06 1.06l1.25-1.25a2 2 0 112.83 2.83l-2.5 2.5a2 2 0 01-2.83 0 .75.75 0 00-1.06 1.06 3.5 3.5 0 004.95 0l2.5-2.5a3.5 3.5 0 00-4.95-4.95l-1.25 1.25zm-4.69 9.64a2 2 0 010-2.83l2.5-2.5a2 2 0 012.83 0 .75.75 0 001.06-1.06 3.5 3.5 0 00-4.95 0l-2.5 2.5a3.5 3.5 0 004.95 4.95l1.25-1.25a.75.75 0 00-1.06-1.06l-1.25 1.25a2 2 0 01-2.83 0z'></path></svg>");mask-image:url("data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 16 16' version='1.1' aria-hidden='true'><path fill-rule='evenodd' d='M7.775 3.275a.75.75 0 001.06 1.06l1.25-1.25a2 2 0 112.83 2.83l-2.5 2.5a2 2 0 01-2.83 0 .75.75 0 00-1.06 1.06 3.5 3.5 0 004.95 0l2.5-2.5a3.5 3.5 0 00-4.95-4.95l-1.25 1.25zm-4.69 9.64a2 2 0 010-2.83l2.5-2.5a2 2 0 012.83 0 .75.75 0 001.06-1.06 3.5 3.5 0 00-4.95 0l-2.5 2.5a3.5 3.5 0 004.95 4.95l1.25-1.25a.75.75 0 00-1.06-1.06l-1.25 1.25a2 2 0 01-2.83 0z'></path></svg>");}.h2m-preview details,.h2m-preview figcaption,.h2m-preview figure{display:block;}.h2m-preview summary{display:list-item;}.h2m-preview [hidden]{display:none !important;}.h2m-preview a{background-color:transparent;color:#0969da;text-decoration:none;}.h2m-preview abbr[title]{border-bottom:none;-webkit-text-decoration:underline dotted;text-decoration:underline dotted;}.h2m-preview b,.h2m-preview strong{font-weight:600;}.h2m-preview dfn{font-style:italic;}.h2m-preview h1{margin:.67em 0;font-weight:600;padding-bottom:.3em;font-size:2em;border-bottom:1px solid #d0d7deb3;}.h2m-preview mark{background-color:#fff8c5;color:#1f2328;}.h2m-preview small{font-size:90%;}.h2m-preview sub,.h2m-preview sup{font-size:75%;line-height:0;position:relative;vertical-align:baseline;}.h2m-preview sub{bottom:-0.25em;}.h2m-preview sup{top:-0.5em;}.h2m-preview img{border-style:none;max-width:100%;box-sizing:content-box;background-color:#ffffff;}.h2m-preview code,.h2m-preview kbd,.h2m-preview pre,.h2m-preview samp{font-family:monospace;font-size:1em;}.h2m-preview figure{margin:1em 40px;}.h2m-preview hr{box-sizing:content-box;overflow:hidden;background:transparent;border-bottom:1px solid #d0d7deb3;height:.25em;padding:0;margin:24px 0;background-color:#d0d7de;border:0;}.h2m-preview input{font:inherit;margin:0;overflow:visible;font-family:inherit;font-size:inherit;line-height:inherit;}.h2m-preview [type=button],.h2m-preview [type=reset],.h2m-preview [type=submit]{-webkit-appearance:button;appearance:button;}.h2m-preview [type=checkbox],.h2m-preview [type=radio]{box-sizing:border-box;padding:0;}.h2m-preview [type=number]::-webkit-inner-spin-button,.h2m-preview [type=number]::-webkit-outer-spin-button{height:auto;}.h2m-preview [type=search]::-webkit-search-cancel-button,.h2m-preview [type=search]::-webkit-search-decoration{-webkit-appearance:none;appearance:none;}.h2m-preview::-webkit-input-placeholder{color:inherit;opacity:.54;}.h2m-preview::-webkit-file-upload-button{-webkit-appearance:button;appearance:button;font:inherit;}.h2m-preview a:hover{text-decoration:underline;}.h2m-preview::placeholder{color:#636c76;opacity:1;}.h2m-preview hr::before{display:table;content:"";}.h2m-preview hr::after{display:table;clear:both;content:"";}.h2m-preview table{border-spacing:0;border-collapse:collapse;display:block;width:max-content;max-width:100%;overflow:auto;}.h2m-preview td,.h2m-preview th{padding:0;}.h2m-preview details summary{cursor:pointer;}.h2m-preview details:not([open])>*:not(summary){display:none;}.h2m-preview a:focus,.h2m-preview [role=button]:focus,.h2m-preview input[type=radio]:focus,.h2m-preview input[type=checkbox]:focus{outline:2px solid #0969da;outline-offset:-2px;box-shadow:none;}.h2m-preview a:focus:not(:focus-visible),.h2m-preview [role=button]:focus:not(:focus-visible),.h2m-preview input[type=radio]:focus:not(:focus-visible),.h2m-preview input[type=checkbox]:focus:not(:focus-visible){outline:solid 1px transparent;}.h2m-preview a:focus-visible,.h2m-preview [role=button]:focus-visible,.h2m-preview input[type=radio]:focus-visible,.h2m-preview input[type=checkbox]:focus-visible{outline:2px solid #0969da;outline-offset:-2px;box-shadow:none;}.h2m-preview a:not([class]):focus,.h2m-preview a:not([class]):focus-visible,.h2m-preview input[type=radio]:focus,.h2m-preview input[type=radio]:focus-visible,.h2m-preview input[type=checkbox]:focus,.h2m-preview input[type=checkbox]:focus-visible{outline-offset:0;}.h2m-preview kbd{display:inline-block;padding:3px 5px;font:11px ui-monospace,SFMono-Regular,SF Mono,Menlo,Consolas,Liberation Mono,monospace;line-height:10px;color:#1f2328;vertical-align:middle;background-color:#f6f8fa;border:solid 1px #afb8c133;border-bottom-color:#afb8c133;border-radius:6px;box-shadow:inset 0 -1px 0 #afb8c133;}.h2m-preview h1,.h2m-preview h2,.h2m-preview h3,.h2m-preview h4,.h2m-preview h5,.h2m-preview h6{margin-top:24px;margin-bottom:16px;font-weight:600;line-height:1.25;}.h2m-preview h2{font-weight:600;padding-bottom:.3em;font-size:1.5em;border-bottom:1px solid #d0d7deb3;}.h2m-preview h3{font-weight:600;font-size:1.25em;}.h2m-preview h4{font-weight:600;font-size:1em;}.h2m-preview h5{font-weight:600;font-size:.875em;}.h2m-preview h6{font-weight:600;font-size:.85em;color:#636c76;}.h2m-preview p{margin-top:0;margin-bottom:10px;}.h2m-preview blockquote{margin:0;padding:0 1em;color:#636c76;border-left:.25em solid #d0d7de;}.h2m-preview ul,.h2m-preview ol{margin-top:0;margin-bottom:0;padding-left:2em;}.h2m-preview ol ol,.h2m-preview ul ol{list-style-type:lower-roman;}.h2m-preview ul ul ol,.h2m-preview ul ol ol,.h2m-preview ol ul ol,.h2m-preview ol ol ol{list-style-type:lower-alpha;}.h2m-preview dd{margin-left:0;}.h2m-preview tt,.h2m-preview code,.h2m-preview samp{font-family:ui-monospace,SFMono-Regular,SF Mono,Menlo,Consolas,Liberation Mono,monospace;font-size:12px;}.h2m-preview pre{margin-top:0;margin-bottom:0;font-family:ui-monospace,SFMono-Regular,SF Mono,Menlo,Consolas,Liberation Mono,monospace;font-size:12px;word-wrap:normal;}.h2m-preview .octicon{display:inline-block;overflow:visible !important;vertical-align:text-bottom;fill:currentColor;}.h2m-preview input::-webkit-outer-spin-button,.h2m-preview input::-webkit-inner-spin-button{margin:0;-webkit-appearance:none;appearance:none;}.h2m-preview .mr-2{margin-right:0.5rem !important;}.h2m-preview::before{display:table;content:"";}.h2m-preview::after{display:table;clear:both;content:"";}.h2m-preview>*:first-child{margin-top:0 !important;}.h2m-preview>*:last-child{margin-bottom:0 !important;}.h2m-preview a:not([href]){color:inherit;text-decoration:none;}.h2m-preview .absent{color:#d1242f;}.h2m-preview .anchor{float:left;padding-right:4px;margin-left:-20px;line-height:1;}.h2m-preview .anchor:focus{outline:none;}.h2m-preview p,.h2m-preview blockquote,.h2m-preview ul,.h2m-preview ol,.h2m-preview dl,.h2m-preview table,.h2m-preview pre,.h2m-preview details{margin-top:0;margin-bottom:16px;}.h2m-preview blockquote>:first-child{margin-top:0;}.h2m-preview blockquote>:last-child{margin-bottom:0;}.h2m-preview h1 .octicon-link,.h2m-preview h2 .octicon-link,.h2m-preview h3 .octicon-link,.h2m-preview h4 .octicon-link,.h2m-preview h5 .octicon-link,.h2m-preview h6 .octicon-link{color:#1f2328;vertical-align:middle;visibility:hidden;}.h2m-preview h1:hover .anchor,.h2m-preview h2:hover .anchor,.h2m-preview h3:hover .anchor,.h2m-preview h4:hover .anchor,.h2m-preview h5:hover .anchor,.h2m-preview h6:hover .anchor{text-decoration:none;}.h2m-preview h1:hover .anchor .octicon-link,.h2m-preview h2:hover .anchor .octicon-link,.h2m-preview h3:hover .anchor .octicon-link,.h2m-preview h4:hover .anchor .octicon-link,.h2m-preview h5:hover .anchor .octicon-link,.h2m-preview h6:hover .anchor .octicon-link{visibility:visible;}.h2m-preview h1 tt,.h2m-preview h1 code,.h2m-preview h2 tt,.h2m-preview h2 code,.h2m-preview h3 tt,.h2m-preview h3 code,.h2m-preview h4 tt,.h2m-preview h4 code,.h2m-preview h5 tt,.h2m-preview h5 code,.h2m-preview h6 tt,.h2m-preview h6 code{padding:0 .2em;font-size:inherit;}.h2m-preview summary h1,.h2m-preview summary h2,.h2m-preview summary h3,.h2m-preview summary h4,.h2m-preview summary h5,.h2m-preview summary h6{display:inline-block;}.h2m-preview summary h1 .anchor,.h2m-preview summary h2 .anchor,.h2m-preview summary h3 .anchor,.h2m-preview summary h4 .anchor,.h2m-preview summary h5 .anchor,.h2m-preview summary h6 .anchor{margin-left:-40px;}.h2m-preview summary h1,.h2m-preview summary h2{padding-bottom:0;border-bottom:0;}.h2m-preview ul.no-list,.h2m-preview ol.no-list{padding:0;list-style-type:none;}.h2m-preview ol[type="a s"]{list-style-type:lower-alpha;}.h2m-preview ol[type="A s"]{list-style-type:upper-alpha;}.h2m-preview ol[type="i s"]{list-style-type:lower-roman;}.h2m-preview ol[type="I s"]{list-style-type:upper-roman;}.h2m-preview ol[type="1"]{list-style-type:decimal;}.h2m-preview div>ol:not([type]){list-style-type:decimal;}.h2m-preview ul ul,.h2m-preview ul ol,.h2m-preview ol ol,.h2m-preview ol ul{margin-top:0;margin-bottom:0;}.h2m-preview li>p{margin-top:16px;}.h2m-preview li+li{margin-top:.25em;}.h2m-preview dl{padding:0;}.h2m-preview dl dt{padding:0;margin-top:16px;font-size:1em;font-style:italic;font-weight:600;}.h2m-preview dl dd{padding:0 16px;margin-bottom:16px;}.h2m-preview table th{font-weight:600;}.h2m-preview table th,.h2m-preview table td{padding:6px 13px;border:1px solid #d0d7de;}.h2m-preview table td>:last-child{margin-bottom:0;}.h2m-preview table tr{background-color:#ffffff;border-top:1px solid #d0d7deb3;}.h2m-preview table tr:nth-child(2n){background-color:#f6f8fa;}.h2m-preview table img{background-color:transparent;}.h2m-preview img[align=right]{padding-left:20px;}.h2m-preview img[align=left]{padding-right:20px;}.h2m-preview .emoji{max-width:none;vertical-align:text-top;background-color:transparent;}.h2m-preview span.frame{display:block;overflow:hidden;}.h2m-preview span.frame>span{display:block;float:left;width:auto;padding:7px;margin:13px 0 0;overflow:hidden;border:1px solid #d0d7de;}.h2m-preview span.frame span img{display:block;float:left;}.h2m-preview span.frame span span{display:block;padding:5px 0 0;clear:both;color:#1f2328;}.h2m-preview span.align-center{display:block;overflow:hidden;clear:both;}.h2m-preview span.align-center>span{display:block;margin:13px auto 0;overflow:hidden;text-align:center;}.h2m-preview span.align-center span img{margin:0 auto;text-align:center;}.h2m-preview span.align-right{display:block;overflow:hidden;clear:both;}.h2m-preview span.align-right>span{display:block;margin:13px 0 0;overflow:hidden;text-align:right;}.h2m-preview span.align-right span img{margin:0;text-align:right;}.h2m-preview span.float-left{display:block;float:left;margin-right:13px;overflow:hidden;}.h2m-preview span.float-left span{margin:13px 0 0;}.h2m-preview span.float-right{display:block;float:right;margin-left:13px;overflow:hidden;}.h2m-preview span.float-right>span{display:block;margin:13px auto 0;overflow:hidden;text-align:right;}.h2m-preview code,.h2m-preview tt{padding:.2em .4em;margin:0;font-size:85%;white-space:break-spaces;background-color:#afb8c133;border-radius:6px;}.h2m-preview code br,.h2m-preview tt br{display:none;}.h2m-preview del code{text-decoration:inherit;}.h2m-preview samp{font-size:85%;}.h2m-preview pre code{font-size:100%;}.h2m-preview pre>code{padding:0;margin:0;word-break:normal;white-space:pre;background:transparent;border:0;}.h2m-preview .highlight{margin-bottom:16px;}.h2m-preview .highlight pre{margin-bottom:0;word-break:normal;}.h2m-preview .highlight pre,.h2m-preview pre{padding:16px;overflow:auto;font-size:85%;line-height:1.45;color:#1f2328;background-color:#f6f8fa;border-radius:6px;}.h2m-preview pre code,.h2m-preview pre tt{display:inline;max-width:auto;padding:0;margin:0;overflow:visible;line-height:inherit;word-wrap:normal;background-color:transparent;border:0;}.h2m-preview .csv-data td,.h2m-preview .csv-data th{padding:5px;overflow:hidden;font-size:12px;line-height:1;text-align:left;white-space:nowrap;}.h2m-preview .csv-data .blob-num{padding:10px 8px 9px;text-align:right;background:#ffffff;border:0;}.h2m-preview .csv-data tr{border-top:0;}.h2m-preview .csv-data th{font-weight:600;background:#f6f8fa;border-top:0;}.h2m-preview [data-footnote-ref]::before{content:"[";}.h2m-preview [data-footnote-ref]::after{content:"]";}.h2m-preview .footnotes{font-size:12px;color:#636c76;border-top:1px solid #d0d7de;}.h2m-preview .footnotes ol{padding-left:16px;}.h2m-preview .footnotes ol ul{display:inline-block;padding-left:16px;margin-top:16px;}.h2m-preview .footnotes li{position:relative;}.h2m-preview .footnotes li:target::before{position:absolute;top:-8px;right:-8px;bottom:-8px;left:-24px;pointer-events:none;content:"";border:2px solid #0969da;border-radius:6px;}.h2m-preview .footnotes li:target{color:#1f2328;}.h2m-preview .footnotes .data-footnote-backref g-emoji{font-family:monospace;}.h2m-preview .pl-c{color:#57606a;}.h2m-preview .pl-c1,.h2m-preview .pl-s .pl-v{color:#0550ae;}.h2m-preview .pl-e,.h2m-preview .pl-en{color:#6639ba;}.h2m-preview .pl-smi,.h2m-preview .pl-s .pl-s1{color:#24292f;}.h2m-preview .pl-ent{color:#0550ae;}.h2m-preview .pl-k{color:#cf222e;}.h2m-preview .pl-s,.h2m-preview .pl-pds,.h2m-preview .pl-s .pl-pse .pl-s1,.h2m-preview .pl-sr,.h2m-preview .pl-sr .pl-cce,.h2m-preview .pl-sr .pl-sre,.h2m-preview .pl-sr .pl-sra{color:#0a3069;}.h2m-preview .pl-v,.h2m-preview .pl-smw{color:#953800;}.h2m-preview .pl-bu{color:#82071e;}.h2m-preview .pl-ii{color:#f6f8fa;background-color:#82071e;}.h2m-preview .pl-c2{color:#f6f8fa;background-color:#cf222e;}.h2m-preview .pl-sr .pl-cce{font-weight:bold;color:#116329;}.h2m-preview .pl-ml{color:#3b2300;}.h2m-preview .pl-mh,.h2m-preview .pl-mh .pl-en,.h2m-preview .pl-ms{font-weight:bold;color:#0550ae;}.h2m-preview .pl-mi{font-style:italic;color:#24292f;}.h2m-preview .pl-mb{font-weight:bold;color:#24292f;}.h2m-preview .pl-md{color:#82071e;background-color:#ffebe9;}.h2m-preview .pl-mi1{color:#116329;background-color:#dafbe1;}.h2m-preview .pl-mc{color:#953800;background-color:#ffd8b5;}.h2m-preview .pl-mi2{color:#eaeef2;background-color:#0550ae;}.h2m-preview .pl-mdr{font-weight:bold;color:#8250df;}.h2m-preview .pl-ba{color:#57606a;}.h2m-preview .pl-sg{color:#8c959f;}.h2m-preview .pl-corl{text-decoration:underline;color:#0a3069;}.h2m-preview [role=button]:focus:not(:focus-visible),.h2m-preview [role=tabpanel][tabindex="0"]:focus:not(:focus-visible),.h2m-preview button:focus:not(:focus-visible),.h2m-preview summary:focus:not(:focus-visible),.h2m-preview a:focus:not(:focus-visible){outline:none;box-shadow:none;}.h2m-preview [tabindex="0"]:focus:not(:focus-visible),.h2m-preview details-dialog:focus:not(:focus-visible){outline:none;}.h2m-preview g-emoji{display:inline-block;min-width:1ch;font-family:"Apple Color Emoji","Segoe UI Emoji","Segoe UI Symbol";font-size:1em;font-style:normal !important;font-weight:400;line-height:1;vertical-align:-0.075em;}.h2m-preview g-emoji img{width:1em;height:1em;}.h2m-preview .task-list-item{list-style-type:none;}.h2m-preview .task-list-item label{font-weight:400;}.h2m-preview .task-list-item.enabled label{cursor:pointer;}.h2m-preview .task-list-item+.task-list-item{margin-top:0.25rem;}.h2m-preview .task-list-item .handle{display:none;}.h2m-preview .task-list-item-checkbox{margin:0 .2em .25em -1.4em;vertical-align:middle;}.h2m-preview .contains-task-list:dir(rtl) .task-list-item-checkbox{margin:0 -1.6em .25em .2em;}.h2m-preview .contains-task-list{position:relative;}.h2m-preview .contains-task-list:hover .task-list-item-convert-container,.h2m-preview .contains-task-list:focus-within .task-list-item-convert-container{display:block;width:auto;height:24px;overflow:visible;clip:auto;}.h2m-preview::-webkit-calendar-picker-indicator{filter:invert(50%);}.h2m-preview .markdown-alert{padding:0.5rem 1rem;margin-bottom:1rem;color:inherit;border-left:.25em solid #d0d7de;}.h2m-preview .markdown-alert>:first-child{margin-top:0;}.h2m-preview .markdown-alert>:last-child{margin-bottom:0;}.h2m-preview .markdown-alert .markdown-alert-title{display:flex;font-weight:500;align-items:center;line-height:1;}.h2m-preview .markdown-alert.markdown-alert-note{border-left-color:#0969da;}.h2m-preview .markdown-alert.markdown-alert-note .markdown-alert-title{color:#0969da;}.h2m-preview .markdown-alert.markdown-alert-important{border-left-color:#8250df;}.h2m-preview .markdown-alert.markdown-alert-important .markdown-alert-title{color:#8250df;}.h2m-preview .markdown-alert.markdown-alert-warning{border-left-color:#bf8700;}.h2m-preview .markdown-alert.markdown-alert-warning .markdown-alert-title{color:#9a6700;}.h2m-preview .markdown-alert.markdown-alert-tip{border-left-color:#1a7f37;}.h2m-preview .markdown-alert.markdown-alert-tip .markdown-alert-title{color:#1a7f37;}.h2m-preview .markdown-alert.markdown-alert-caution{border-left-color:#cf222e;}.h2m-preview .markdown-alert.markdown-alert-caution .markdown-alert-title{color:#d1242f;}.h2m-preview>*:first-child>.heading-element:first-child{margin-top:0 !important;}
    `);
  // 注册触发器
  shortCutConfig = shortCutConfig || {
    Shift: false,
    Ctrl: true,
    Alt: false,
    Key: "m",
  };
  $(document).on("keydown", function (e) {
    if (
      e.ctrlKey === shortCutConfig["Ctrl"] &&
      e.altKey === shortCutConfig["Alt"] &&
      e.shiftKey === shortCutConfig["Shift"] &&
      e.key.toUpperCase() === shortCutConfig["Key"].toUpperCase()
    ) {
      e.preventDefault();
      startSelecting();
    }
    // else {
    //     console.log(e.ctrlKey, e.altKey, e.shiftKey, e.key.toUpperCase());
    // }
  });
  // $(document).on('keydown', function (e) {
  //     if (e.ctrlKey && e.key === 'm') {
  //         e.preventDefault();
  //         startSelecting()
  //     }
  // });
  // 加了@run-at context-menu 右键触发之后得加载
  startSelecting();
  GM_registerMenuCommand("Convert to Markdown", function () {
    startSelecting();
  });
  $(document)
    .on("mouseover", function (e) {
      // 开始选择
      if (isSelecting) {
        $(selectedElement).removeClass("h2m-selection-box");
        selectedElement = e.target;
        $(selectedElement).addClass("h2m-selection-box");
      }
    })
    .on("wheel", function (e) {
      // 滚轮事件
      if (isSelecting) {
        e.preventDefault();
        if (e.originalEvent.deltaY < 0) {
          selectedElement = selectedElement.parentElement
            ? selectedElement.parentElement
            : selectedElement; // 扩大
          if (
            selectedElement.tagName === "HTML" ||
            selectedElement.tagName === "BODY"
          ) {
            selectedElement = selectedElement.firstElementChild;
          }
        } else {
          selectedElement = selectedElement.firstElementChild
            ? selectedElement.firstElementChild
            : selectedElement; // 缩小
        }
        $(".h2m-selection-box").removeClass("h2m-selection-box");
        $(selectedElement).addClass("h2m-selection-box");
      }
    })
    .on("keydown", function (e) {
      // 键盘事件
      if (isSelecting) {
        e.preventDefault();
        if (e.key === "Escape") {
          endSelecting();
          return;
        }
        switch (
          e.key // 方向键：上下左右
        ) {
          case "ArrowUp":
            selectedElement = selectedElement.parentElement
              ? selectedElement.parentElement
              : selectedElement; // 扩大
            if (
              selectedElement.tagName === "HTML" ||
              selectedElement.tagName === "BODY"
            ) {
              // 排除 HTML 和 BODY
              selectedElement = selectedElement.firstElementChild;
            }
            break;
          case "ArrowDown":
            selectedElement = selectedElement.firstElementChild
              ? selectedElement.firstElementChild
              : selectedElement; // 缩小
            break;
          case "ArrowLeft": // 寻找上一个元素，若是最后一个子元素则选择父元素的下一个兄弟元素，直到找到一个元素
            var prev = selectedElement.previousElementSibling;
            while (prev === null && selectedElement.parentElement !== null) {
              selectedElement = selectedElement.parentElement;
              prev = selectedElement.previousElementSibling
                ? selectedElement.previousElementSibling.lastChild
                : null;
            }
            if (prev !== null) {
              if (
                selectedElement.tagName === "HTML" ||
                selectedElement.tagName === "BODY"
              ) {
                selectedElement = selectedElement.firstElementChild;
              }
              selectedElement = prev;
            }
            break;
          case "ArrowRight":
            var next = selectedElement.nextElementSibling;
            while (next === null && selectedElement.parentElement !== null) {
              selectedElement = selectedElement.parentElement;
              next = selectedElement.nextElementSibling
                ? selectedElement.nextElementSibling.firstElementChild
                : null;
            }
            if (next !== null) {
              if (
                selectedElement.tagName === "HTML" ||
                selectedElement.tagName === "BODY"
              ) {
                selectedElement = selectedElement.firstElementChild;
              }
              selectedElement = next;
            }
            break;
        }
        $(".h2m-selection-box").removeClass("h2m-selection-box");
        $(selectedElement).addClass("h2m-selection-box"); // 更新选中元素的样式
      }
    })
    .on("mousedown", function (e) {
      // 鼠标事件，选择 mousedown 是因为防止点击元素后触发其他事件
      if (isSelecting) {
        e.preventDefault();
        const markdown = convertToMarkdown(selectedElement);
        showMarkdownModal(markdown);
        endSelecting();
      }
    });
})();
