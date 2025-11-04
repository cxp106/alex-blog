// ==UserScript==
// @name         Telegram 自定义主题
// @namespace    urn:Stendhal:scripts
// @version      0.1.0
// @description  把自己不喜欢的改成喜欢的，看着舒服
// @author       Stendhal
// @match        https://web.telegram.org/*
// @grant        GM_addStyle
// @run-at       document-start
// ==/UserScript==

;(function () {
  "use strict"
  GM_addStyle(`
      @import url('https://cdn.jsdelivr.net/npm/cn-fontsource-lxgw-wen-kai-gb-screen@1.0.6/font.min.css');
      *{ font-family: "LXGW WenKai TC", cursive; }
      .whole.page-chats { max-width: 100% !important; }
      .chat-background,.avatar-gradient,.custom-emoji .media-sticker, .custom-emoji .rlottie,.ListItem.chat-item-clickable .Avatar { display: none !important; }
      .bubble img:not(.emoji), .bubble video,.media-inner video.full-media, .media-inner img.full-media, .media-inner img.thumbnail, .media-inner canvas.thumbnail{ opacity: 0.2;}
      .chatlist-chat.row-with-padding { padding-inline-start: 1em !important;}
      #MiddleColumn *::after {background-color: #fff !important; background: none;}
      `)
})()
