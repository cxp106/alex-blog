// ==UserScript==
// @name         Easy Web Page to Markdown
// @name:zh      网页转 Markdown 工具
// @namespace    http://tampermonkey.net/
// @version      1.0.4
// @description  Convert selected HTML to Markdown
// @description:zh 将选定的 HTML 转换为 Markdown
// @author       千川汇海
// @match        *://*/*
// @grant        GM_addStyle
// @grant        GM_registerMenuCommand
// @grant        GM_setClipboard
// @grant        GM_setValue
// @grant        GM_getValue
// @updateURL    https://cxp.netlify.app/script/ConvertWebPageToMarkdown.user.js
// @downloadURL  https://cxp.netlify.app/script/ConvertWebPageToMarkdown.user.js
// @require      https://code.jquery.com/jquery-3.6.0.min.js
// @require      https://cdnjs.cloudflare.com/ajax/libs/jqueryui/1.12.1/jquery-ui.min.js
// @require      https://unpkg.com/turndown/dist/turndown.js
// @require      https://unpkg.com/@guyplusplus/turndown-plugin-gfm/dist/turndown-plugin-gfm.js
// @require      https://cdn.jsdelivr.net/npm/markdown-it@14.1.0/dist/markdown-it.min.js
// @require      https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/highlight.min.js
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
    highlight: function (str, lang) {
      if (lang && lang && hljs.getLanguage(lang)) {
        try {
          return hljs.highlight(str, { language: lang }).value;
        } catch (__) {}
      } else {
        try {
          return hljs.highlight(str).value;
        } catch (__) {}
      }
      return md.utils.escapeHtml(str);
    },
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
        .h2m-modal{font-family:ui-sans-serif,system-ui,sans-serif,"Apple Color Emoji","Segoe UI Emoji","Segoe UI Symbol","Noto Color Emoji";line-height:1.75}.h2m-modal *{box-sizing:border-box}.h2m-modal h1,h2,h3,h4,h5,h6,p,pre{margin:1em 0}.h2m-modal pre code::-webkit-scrollbar{width:6px;height:6px;background-color:#fff}.h2m-modal pre code::-webkit-scrollbar-track{border-radius:6px;background-color:#c8c8c84d}.h2m-modal pre code::-webkit-scrollbar-thumb{border-radius:6px;background-color:#90929880}.h2m-modal h1{font-size:1.5em;font-weight:700;text-shadow:2px 2px 4px rgba(0,0,0,0.1)}.h2m-modal h2{font-size:1.2em;border-bottom:1px solid #f7f7f7;font-weight:700}.h2m-modal h3,h4,h5,h6{font-size:1em;font-weight:700}.h2m-modal ul,ol{padding-left:1.2em}.h2m-modal li{margin-left:1.2em}.h2m-modal img{max-width:100%;height:auto;margin:0 auto;display:block}.h2m-modal table{border-collapse:collapse;margin:1.4em auto;max-width:100%;table-layout:fixed;text-align:left;overflow:auto;border:1px solid #f6f6f6;display:inline-block;font-size:.75em}.h2m-modal table thead{background:#f6f6f6;color:#000;text-align:left}.h2m-modal table td,table th{padding:12px 7px;line-height:24px}.h2m-modal blockquote{background:#afb8c133;border-left:.5em solid #ccc;margin:1.5em 0;padding:.5em 10px;font-style:italic;font-size:.9em}.h2m-modal p code{font-family:ui-monospace,SFMono-Regular,Menlo,Monaco,Consolas,"liberation mono","courier new",monospace;color:#ff502c;padding:4px 6px;font-size:.78em}.h2m-modal pre{border-radius:5px;font-size:.9em;line-height:1.5;margin:1em .5em;padding:1em;background-color:#afb8c133}.h2m-modal pre code{display:block;overflow-x:auto;margin:0;padding:0}.h2m-modal hr{border:none;border-top:1px solid #ddd;margin-top:2em;margin-bottom:2em}.h2m-modal #footnotes ul{font-size:.9em;margin:0;padding-left:1.2em}.h2m-modal #footnotes li{margin:0 0 0 1.2em;overflow-wrap:break-word;word-wrap:break-word;word-break:break-all}
        .h2m-modal pre{background:#F6F8FA;padding:1em;}pre code.hljs{display:block;overflow-x:auto;padding:1em}code.hljs{padding:3px 5px}/*!
  Theme: GitHub
  Description: Light theme as seen on github.com
  Author: github.com
  Maintainer: @Hirse
  Updated: 2021-05-15

  Outdated base version: https://github.com/primer/github-syntax-light
  Current colors taken from GitHub's CSS
*/.hljs{color:#24292e;}.hljs-doctag,.hljs-keyword,.hljs-meta .hljs-keyword,.hljs-template-tag,.hljs-template-variable,.hljs-type,.hljs-variable.language_{color:#d73a49}.hljs-title,.hljs-title.class_,.hljs-title.class_.inherited__,.hljs-title.function_{color:#6f42c1}.hljs-attr,.hljs-attribute,.hljs-literal,.hljs-meta,.hljs-number,.hljs-operator,.hljs-selector-attr,.hljs-selector-class,.hljs-selector-id,.hljs-variable{color:#005cc5}.hljs-meta .hljs-string,.hljs-regexp,.hljs-string{color:#032f62}.hljs-built_in,.hljs-symbol{color:#e36209}.hljs-code,.hljs-comment,.hljs-formula{color:#6a737d}.hljs-name,.hljs-quote,.hljs-selector-pseudo,.hljs-selector-tag{color:#22863a}.hljs-subst{color:#24292e}.hljs-section{color:#005cc5;font-weight:700}.hljs-bullet{color:#735c0f}.hljs-emphasis{color:#24292e;font-style:italic}.hljs-strong{color:#24292e;font-weight:700}.hljs-addition{color:#22863a;background-color:#f0fff4}.hljs-deletion{color:#b31d28;background-color:#ffeef0}
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
