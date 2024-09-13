// ==UserScript==
// @name        浏览 Github 项目
// @author      南风
// @description 浏览 github 项目的时候添加 sourcegraph、github1s 的链接
// @version     6.6.6
// @namespace   https://nanfeng.com/
// @match       https://github.com/*/*
// @run-at      document-idle
// ==/UserScript==

(function () {
  const SVG_ICON_1 =
    '<svg viewBox="0 0 40 40" style="height: 16px; vertical-align: text-bottom"><g fill="none" fill-rule="evenodd"><path d="M11.5941935,5.12629921 L20.4929032,36.888189 C21.0909677,39.0226772 23.3477419,40.279685 25.5325806,39.6951181 C27.7190323,39.1105512 29.0051613,36.9064567 28.4067742,34.7722835 L19.5064516,3.00944882 C18.9080645,0.875590551 16.6516129,-0.381732283 14.4667742,0.203149606 C12.2822581,0.786771654 10.9958065,2.99149606 11.5941935,5.12598425 L11.5941935,5.12629921 Z" fill="#F96316"></path><path d="M28.0722581,5.00598425 L5.7883871,29.5748031 C4.28516129,31.2314961 4.44225806,33.7647244 6.13741935,35.2327559 C7.83258065,36.7004724 10.4245161,36.5474016 11.9277419,34.8913386 L34.2116129,10.3228346 C35.7148387,8.66614173 35.5577419,6.13385827 33.8625806,4.66551181 C32.1667742,3.19653543 29.5741935,3.34992126 28.0722581,5.00566929 L28.0722581,5.00598425 Z" fill="#B200F8"></path><path d="M2.82258065,18.6204724 L34.6019355,28.8866142 C36.7525806,29.5811024 39.0729032,28.4412598 39.7841935,26.3395276 C40.4970968,24.2381102 39.3293548,21.9716535 37.1777419,21.2762205 L5.39935484,11.0110236 C3.24774194,10.3159055 0.928387097,11.455748 0.216774194,13.5574803 C-0.494193548,15.6588976 0.673548387,17.9259843 2.82322581,18.6204724 L2.82258065,18.6204724 Z" fill="#00B4F2"></path></g></svg>';
  const SVG_ICON_2 =
    '<svg t="1713772462282" class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" style="height: 16px; vertical-align: text-bottom"><path d="M725.333333 702.72V315.306667l-256 193.706666M94.72 392.106667a36.608 36.608 0 0 1-0.853333-49.066667l51.2-47.36c8.533333-7.68 29.44-11.093333 44.8 0l145.92 111.36 338.346666-309.333333c13.653333-13.653333 37.12-19.2 64-5.12l170.666667 81.493333c15.36 8.96 29.866667 23.04 29.866667 49.066667v576c0 17.066667-12.373333 35.413333-25.6 42.666666l-187.733334 89.6c-13.653333 5.546667-39.253333 0.426667-48.213333-8.533333l-342.186667-311.466667-145.066666 110.933334c-16.213333 11.093333-36.266667 8.106667-44.8 0l-51.2-46.933334c-13.653333-14.08-11.946667-37.12 2.133333-51.2l128-115.2" fill="#4FC3F7" p-id="3444"></path></svg>';

  const btns = [
    {
      icon: SVG_ICON_1,
      onclick: handleBtn1Click,
    },
    {
      icon: SVG_ICON_2,
      onclick: handleBtn2Click,
    },
  ];

  function handleBtn1Click() {
    const array = location.pathname.split('/');
    if (array.length) {
      const menu = document.querySelector('#branch-select-menu .btn');
      const target = menu && menu.title && menu.title.indexOf('/') > 0 ? menu.title : array[4];
      if (target) {
        array.splice(3, target.split('/').length + 1, '-', array[3]);
        array[2] += `@${target}`;
      }
    }
    location.href = `https://sourcegraph.com/github.com${array.join('/')}`;
  }

  function handleBtn2Click() {
    window.location.href = window.location.href.replace('github', 'github1s');
  }

  function createButton(icon, onclick) {
    const button = document.createElement('button');
    button.className = 'btn btn-sm define-your-own-add-button';
    button.innerHTML = icon;
    button.onclick = onclick;
    const action = document.createElement('li');
    action.append(button);
    return action;
  }

  function observePageHeadActions() {
    const observer = new MutationObserver((mutations, obs) => {
      if (document.querySelector('.define-your-own-add-button')) return;
      const actions = document.querySelector('.pagehead-actions');
      if (actions) {
        btns.forEach(({ icon, onclick }) => actions.prepend(createButton(icon, onclick)));
      }
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true,
    });
  }

  observePageHeadActions();
})();
