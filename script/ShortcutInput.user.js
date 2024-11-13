// ==UserScript==
// @name            Shortcut input
// @name:zh         快捷输入
// @namespace       http://tampermonkey.net/
// @version         1.0.1
// @description     Trigger commands with "/" in input fields
// @description:zh  在输入字段中使用“/”触发命令
// @match           *://*/*
// @updateURL       https://cxp.netlify.app/script/ShortcutInput.user.js
// @downloadURL     https://cxp.netlify.app/script/ShortcutInput.user.js
// @grant           none
// ==/UserScript==

(function () {
  "use strict";

  const config = {
    yh: "{clipboard} site:greasyfork.org",
    dc: "如何记忆 {clipboard} 这个单词，分析这个单词的词根词缀，并深度解释多种记忆技巧",
    cc: `
        ## Profile
        - Role: JavaScript 代码优化专家
        - Goals: 一步一步认真分析提供的 JavaScript 代码，帮我从代码质量、性能方面、安全性方面、最佳实践方面四个维度分析，识别问题并提供优化建议，最终用中文生成最优雅简洁的优化版本
        - Skills: 熟悉 JavaScript 编程语言、了解 Clean Code 的软件工程原则、能够识别代码中的问题并提供优化建议、能够重构代码以实现最优雅简洁的优化版本
        - Constraints: 代码优化的目标是使代码更易读、可维护和高效，优化过程应遵循 Clean Code 的原则
        - Workflows: 接收提供的 JavaScript 代码，一步一步认真分析代码中的问题，提供优化建议并生成最优雅简洁的优化版本
        - Initialization: 在进行代码优化之前，请确保你熟悉 JavaScript 编程语言和 Clean Code 的软件工程原则，并具备重构代码以实现优化的能力。
        ## Goals
        你的目标是一步一步认真分析提供的 JavaScript 代码，识别其中的问题并提供优化建议，最终生成最优雅简洁的优化版本。
        ## Skills
        为了实现上述目标，你需要具备以下技能：
        1. 熟悉 JavaScript 编程语言：了解 JavaScript 的语法、特性和最佳实践。
        2. 了解 Clean Code 的软件工程原则：理解 Clean Code 中提出的原则和规范，如可读性、可维护性、单一责任等。
        3. 能够识别代码中的问题并提供优化建议：能够一步一步认真分析代码，发现其中的问题，并提供优化建议。
        4. 能够重构代码以实现最优雅简洁的优化版本：根据优化建议，重构代码以实现更好的可读性、可维护性和性能。
        ## Constraints
        请注意以下约束条件：
        1. 优化的目标是使代码更易读、可维护和高效。
        2. 优化过程应遵循 Clean Code 的原则和规范。
        3. 优化后的代码应保持原有功能的正确性。
        4. 掌握所有编程中的设计模式，用合适的设计模式提升代码质量。
        ## Workflows
        下面是可能的流程步骤：
        1. 接收提供的 JavaScript 代码作为输入。
        2. 一步一步认真分析代码，识别其中的问题，如命名不清晰、函数过长、重复代码等。
        3. 提供针对每个问题的优化建议，如改进命名、拆分函数、提取重复代码等。
        4. 根据优化建议，重构代码以实现最优雅简洁的优化版本。
        5. 提供生成的优化版本代码给你。
        ## Initialization
        在开始代码优化之前，请记住以下事项：
        1. 确保你熟悉 JavaScript 编程语言和 Clean Code 的软件工程原则。
        2. 确保你具备识别代码中问题并提供优化建议的能力。
        3. 在重构代码时，始终遵循 Clean Code 的原则和规范。
        一步一步认真分析提供的 JavaScript 代码，帮我从代码质量、性能方面、安全性方面、最佳实践方面四个维度分析，识别问题并提供优化建议，最终用中文生成最优雅简洁的优化版本。
        我的提供的代码如下：
        \`\`\`
        {clipboard}
        \`\`\`
        `,
    sjsj: `
        参考 Faker、Mockaroo、GenerateData、JSON Schema Faker、FakeStoreAPI、Mock Turtle 等资源生成逼真的虚假数据，一步一步分析下面的数据描述生成 10 条随机且真实的 json 数据，只要 json 数据，不要代码
        \`\`\`
        {clipboard}
        \`\`\`
        `,
    zjt: `
        回答内容不允许过于省略，必须让读者能够完整、准确的了解文章内容。回答内容必须使用简体中文，用词遣句必须符合中国大陆用户的语言习惯，一步一步认真地告诉我如何理解、分析和总结下面这段话：
        \`\`\`
        {clipboard}
        \`\`\`
        `,
    zju: `请帮我对{clipboard}这篇文章进行总结，请使用项目符号和简洁解释来组织总结中的方法论；提供相关工具的详细解释，包括使用方法和操作步骤，以确保清晰明了，没有歧义。使用简洁的语言，以简短、明了的语句概括要点，避免冗长或复杂的表达方式来解释文章中提到的相关工具、软件和网站，以及具体的操作步骤和方法论。要求回答内容使用 Markdown 语法规则添加标题、段落和列表；对于总结段落中的方法论，使用项目符号（如"-"或"*"）创建项目符号列表；在每个项目符号下，使用简洁的语句解释对应的方法论；回答内容不允许过于省略，必须让读者能够完整、准确的了解文章内容。回答时只需要回复总结内容，不需要其他任何的解释。回答内容必须使用简体中文，用词遣句必须符合中国大陆用户的语言习惯。`,
    mm: `
        接下来你扮演资深的开发者，负责帮我的变量起名字，我接下来会发送中文，你需要先将我的描述翻译为英文，然后进行意译，接着根据我描述的意思生成合适的变量名，力求翻译的英文尽量简短准确，若翻译有多个结果则以"、"分隔，一次性生成以下 6 种格式的命名方式共我选择。
        - 短横线命名法（中划线命名法，烤肉串命名法，kebab case）
        - 字母小写，连字符连接
        - 如 \`kebab-case\`
        - 小蛇式命名法（蛇式命名法，snake case）
        - 字母小写
        - 下划线连接
        - 如 \`snake_case\`
        - 大蛇式命名法（宏命名法，macro case）
        - 大写字母
        - 下划线连接
        - 如 \`MACRO_CASE\`
        - 小驼峰命名法（驼峰命名法，camel case）
        - 首单词首字母小写，后每个单词首字母大写
        - 不使用连接符
        - 如 \`camelCase\`
        - 大驼峰命名法（帕斯卡命名法，pascal case）
        - 每个单词首字母大写
        - 不使用连接符
        - 如 \`PascalCase\`
        - 匈牙利命名法（hungarian notation）
        - 变量名 = 属性 ＋ 类型 ＋ 对象描述
        你要一步一步思考认真理解我的中文描述，并生成足够优秀精确的变量名供我选择。
        我发送的内容是：{clipboard}
        `,
    xw: "对当前{clipboard}新闻文章的深入分析。以中立和客观的语言，覆盖多个方面，鼓励批判性思维和讨论。工作流程包括选择新闻文章、识别关键主题、生成问题、构建结构化提示，并通过协作审查和完善确保质量。提示工程师将以 Markdown 格式提供清晰的指导，从而促进对时事新闻的全面理解和评价。",
  };

  // 监听所有输入框的输入事件
  document.addEventListener("input", function (e) {
    if (e.target.tagName === "INPUT" || e.target.tagName === "TEXTAREA") {
      handleInput(e.target);
    }
  });

  function handleInput(inputElement) {
    let inputValue = inputElement.value;
    if (inputValue.startsWith("/")) {
      let command = inputValue.split(" ")[0].slice(1); // 获取指令名称
      executeCommand(command, inputElement);
    }
  }

  function readClipboardOld() {
    return new Promise((resolve, reject) => {
      // Create a temporary textarea to use for clipboard operations
      const textarea = document.createElement("textarea");
      document.body.appendChild(textarea);
      textarea.focus();

      // Execute the paste command
      document.execCommand("paste");
      const clipboardContent = textarea.value;
      document.body.removeChild(textarea);

      if (clipboardContent) {
        resolve(clipboardContent);
      } else {
        reject(
          new Error("Failed to read clipboard contents with execCommand.")
        );
      }
    });
  }

  // Function to handle clipboard content insertion
  async function insertClipboardContent(templateString) {
    try {
      let clipboardContent = await readClipboardOld();
      let newContent = templateString.replace("{clipboard}", clipboardContent);
      return newContent;
    } catch (err) {
      let clipboardContent = (await navigator.clipboard?.readText()) || "";
      let newContent = templateString.replace("{clipboard}", clipboardContent);
      return newContent;
    }
  }

  async function executeCommand(command, inputElement) {
    const templateString = config[command];
    if (templateString) {
      if (templateString.includes("{clipboard}")) {
        const newContent = await insertClipboardContent(templateString);
        inputElement.value = newContent;
      } else {
        inputElement.value = templateString;
      }
      inputElement.dispatchEvent(new Event("input", { bubbles: true }));
    }
  }
})();
