// ==UserScript==
// @name        GreasyFork 快速复制代码
// @version     0.1.1
// @description 为 greasyfork 代码页面添加复制代码按钮的用户脚本
// @license     MIT
// @author      千川汇海
// @match       https://greasyfork.org/*/scripts/*/code
// @match       https://sleazyfork.org/*/scripts/*/code
// @run-at      document-idle
// @grant       none
// @icon        https://www.google.com/s2/favicons?domain=greasyfork.org
// ==/UserScript==
(() => {
  'use strict';

  function copyCode() {
    const codeContainer = document.querySelector('.code-container');
    if (!codeContainer) {
      console.error('未找到代码容器');
      return;
    }

    const codeText = codeContainer.innerText;
    navigator.clipboard
      .writeText(codeText)
      .then(handleCopySuccess)
      .catch((err) => {
        fallbackCopyTextToClipboard(codeText);
        console.error('使用剪贴板 API 复制文本失败', err);
      });
  }

  function handleCopySuccess() {
    console.log('复制命令执行成功');
    toastify({
      text: '🚀 复制成功',
    });
  }

  function fallbackCopyTextToClipboard(text) {
    const textArea = document.createElement('textarea');
    textArea.value = text;
    textArea.style.position = 'fixed';
    textArea.style.top = '0';
    textArea.style.left = '0';

    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();

    try {
      const successful = document.execCommand('copy');
      const msg = successful ? '成功' : '失败';
      handleCopySuccess();
      console.log('复制命令执行' + msg);
    } catch (err) {
      console.error('回退方案：无法复制', err);
    } finally {
      document.body.removeChild(textArea);
    }
  }

  function createCopyLink() {
    const copyLink = document.createElement('a');
    copyLink.href = '#';
    copyLink.className = 'install-link copy-code-link';
    copyLink.style.marginLeft = '0.5rem';
    copyLink.innerHTML = `
        <svg aria-hidden="true" height="16" viewBox="0 0 14 16" width="14">
          <path fill="currentColor" fill-rule="evenodd" d="M2 13h4v1H2v-1zm5-6H2v1h5V7zm2 3V8l-3 3 3 3v-2h5v-2H9zM4.5 9H2v1h2.5V9zM2 12h2.5v-1H2v1zm9 1h1v2c-.02.28-.11.52-.3.7-.19.18-.42.28-.7.3H1c-.55 0-1-.45-1-1V4c0-.55.45-1 1-1h3c0-1.11.89-2 2-2 1.11 0 2 .89 2 2h3c.55 0 1 .45 1 1v5h-1V6H1v9h10v-2zM2 5h8c0-.55-.45-1-1-1H8c-.55 0-1-.45-1-1s-.45-1-1-1-1 .45-1 1-.45 1-1 1H3c-.55 0-1 .45-1 1z"></path>
        </svg>
        复制代码到剪贴板`;
    return copyLink;
  }

  function initializeCopyLink() {
    const installArea = document.querySelector('#install-area');
    if (installArea && !document.querySelector('.copy-code-link')) {
      const copyLink = createCopyLink();
      copyLink.onclick = (event) => {
        event.preventDefault();
        copyCode();
      };
      installArea.appendChild(copyLink);
    }
  }

  initializeCopyLink();
})();

function toastify(options) {
  const { text, duration = 1690 } = options;

  // 创建 toast 容器
  const toast = document.createElement('div');
  toast.textContent = text;
  toast.style.position = 'fixed';
  toast.style.bottom = '20px';
  toast.style.right = '20px';
  toast.style.backgroundColor = '#333';
  toast.style.color = '#fff';
  toast.style.padding = '10px 20px';
  toast.style.borderRadius = '5px';
  toast.style.boxShadow = '0 2px 4px rgba(0, 0, 0, 0.2)';
  toast.style.zIndex = '1000';
  toast.style.opacity = '0';
  toast.style.transition = 'opacity 0.5s';

  // 插入 toast 到 body
  document.body.appendChild(toast);

  // 显示 toast
  setTimeout(() => {
    toast.style.opacity = '1';
  }, 0);

  // 隐藏 toast 并移除
  setTimeout(() => {
    toast.style.opacity = '0';
    setTimeout(() => {
      document.body.removeChild(toast);
    }, 500);
  }, duration);
}
