// ==UserScript==
// @name         🚀 全能 Hooker (JSON.parse + Fetch + XHR) v2.0 (💯 最终完美版)
// @namespace    http://tampermonkey.net/
// @version      2.0.0
// @description  在 document-start 注入 JSON.parse, fetch, XMLHttpRequest 的完美 Hook。追求极致，拒绝平庸！$1B or 🔥🍠!
// @author       世界顶级前端架构师 (🧠 + 🌐)
// @match        *://yyjingyan.com/*
// @run-at       document-start
// @grant        unsafeWindow
// @grant        none
// ==/UserScript==

(function() {
  'use strict';

  // -------------------------------------------------------------------------
  //   zéro Configuration & Setup - 零配置与设置
  // -------------------------------------------------------------------------
  const LOG_PREFIX_JSON = '[JSON Hooker]';
  const LOG_PREFIX_FETCH = '[Fetch Hooker]';
  const LOG_PREFIX_XHR = '[XHR Hooker]';
  const HOOK_SUCCESS_FLAG = '___ULTIMATE_HOOKER_APPLIED_V2___'; // 全局成功标记

  console.log('[全能 Hooker] Script executing at document-start...');

  // 获取页面原始 window 对象，这对于修改页面全局对象至关重要
  const pageWindow = typeof unsafeWindow !== 'undefined' ? unsafeWindow : window;

  // 检查 Proxy API 是否可用
  if (typeof Proxy === 'undefined') {
      console.error('[全能 Hooker] 致命错误：当前环境不支持 Proxy API，无法应用 Hook。');
      return;
  }

  // --- Helper Function ---
  // 安全地调用函数，增加错误捕获
  function safeCall(func, context, args, prefix) {
      try {
          return Reflect.apply(func, context, args);
      } catch (error) {
          console.error(`${prefix} 调用原始方法时出错:`, error);
          throw error; // 重新抛出错误，保持原始行为
      }
  }


  // -------------------------------------------------------------------------
  //  1️⃣ JSON.parse Hook - 拦截 JSON 解析
  // -------------------------------------------------------------------------
  try {
      if (pageWindow.JSON && typeof pageWindow.JSON.parse === 'function') {
          const originalJsonParse = pageWindow.JSON.parse;
          console.log(`${LOG_PREFIX_JSON} 原始 JSON.parse 已捕获。`);

          pageWindow.JSON.parse = new Proxy(originalJsonParse, {
              apply: function(target, thisArg, argumentsList) {
                  const jsonString = argumentsList[0];
                  console.log(`${LOG_PREFIX_JSON} 拦截到 JSON.parse 调用，输入:`, jsonString);

                  // 调用原始 JSON.parse
                  const result = safeCall(target, thisArg, argumentsList, LOG_PREFIX_JSON);

                  console.log(`${LOG_PREFIX_JSON} JSON.parse 原始结果:`, result);
                  // 可以在这里修改 result，如果需要的话
                  // if (typeof result === 'object' && result !== null && result.user) {
                  //     result.user = 'hooked_user';
                  // }
                  return result;
              }
          });
          console.log(`${LOG_PREFIX_JSON} JSON.parse Hook 应用成功。💯`);
      } else {
          console.warn(`${LOG_PREFIX_JSON} pageWindow.JSON.parse 在 document-start 时不可用，跳过 Hook。`);
      }
  } catch (error) {
      console.error(`${LOG_PREFIX_JSON} 应用 JSON.parse Hook 时发生严重错误:`, error);
  }


  // -------------------------------------------------------------------------
  //  2️⃣ Fetch Hook - 拦截 fetch 请求
  // -------------------------------------------------------------------------
  try {
      if (typeof pageWindow.fetch === 'function') {
          const originalFetch = pageWindow.fetch;
          console.log(`${LOG_PREFIX_FETCH} 原始 fetch 已捕获。`);

          pageWindow.fetch = new Proxy(originalFetch, {
              apply: function(target, thisArg, argumentsList) {
                  const resource = argumentsList[0]; // URL 或 Request 对象
                  const options = argumentsList[1] || {}; // 请求配置
                  const method = options.method || (typeof resource === 'string' ? 'GET' : resource.method) || 'GET';
                  const url = typeof resource === 'string' ? resource : resource.url;

                  console.log(`${LOG_PREFIX_FETCH} 拦截到 fetch 请求：[${method}] ${url}`, '选项：', options);
                  // 可以在这里修改 resource 或 options
                  // argumentsList[0] = 'modified/url';

                  // 调用原始 fetch
                  const fetchPromise = safeCall(target, thisArg, argumentsList, LOG_PREFIX_FETCH);

                  // 附加处理链以记录响应
                  fetchPromise.then(response => {
                      if (!response) return; // 如果原始 fetch 返回空值 (理论上不应发生)

                      console.log(`${LOG_PREFIX_FETCH} 收到响应：[${response.status} ${response.statusText}] for ${url}`);
                      console.log(`${LOG_PREFIX_FETCH} 响应头:`, Object.fromEntries(response.headers.entries()));

                      // 克隆响应以安全地读取响应体，不影响原始流
                      const clonedResponse = response.clone();
                      clonedResponse.text().then(body => {
                          console.log(`${LOG_PREFIX_FETCH} 响应体 (Text):`, body);
                          // 尝试解析为 JSON
                          try {
                              const jsonBody = JSON.parse(body); // 这里用的是我们 Hook 后的 JSON.parse 哦！
                              console.log(`${LOG_PREFIX_FETCH} 响应体 (Parsed JSON):`, jsonBody);
                          } catch (e) {
                              // 不是有效的 JSON，忽略解析错误
                          }
                      }).catch(err => {
                          console.error(`${LOG_PREFIX_FETCH} 读取响应体时出错 for ${url}:`, err);
                      });

                  }).catch(error => {
                      // 即使请求失败也要记录
                      console.error(`${LOG_PREFIX_FETCH} Fetch 请求失败 for ${url}:`, error);
                  });

                  // 返回原始的 Promise，让页面代码继续正常工作
                  return fetchPromise;
              }
          });
          console.log(`${LOG_PREFIX_FETCH} Fetch Hook 应用成功。💯`);
      } else {
          console.warn(`${LOG_PREFIX_FETCH} pageWindow.fetch 在 document-start 时不可用，跳过 Hook。`);
      }
  } catch (error) {
      console.error(`${LOG_PREFIX_FETCH} 应用 Fetch Hook 时发生严重错误:`, error);
  }


  // -------------------------------------------------------------------------
  //  3️⃣ XMLHttpRequest Hook - 拦截 XHR 请求
  // -------------------------------------------------------------------------
  try {
      if (pageWindow.XMLHttpRequest && pageWindow.XMLHttpRequest.prototype) {
          const xhrProto = pageWindow.XMLHttpRequest.prototype;

          // --- Hook XHR.open ---
          if (typeof xhrProto.open === 'function') {
              const originalXHROpen = xhrProto.open;
              console.log(`${LOG_PREFIX_XHR} 原始 XHR.open 已捕获。`);

              xhrProto.open = new Proxy(originalXHROpen, {
                  apply: function(target, thisArg, argumentsList) {
                      const method = argumentsList[0];
                      const url = argumentsList[1];

                      // 将请求信息存储在 XHR 实例上，供 send 方法使用
                      thisArg._hook_method = method;
                      thisArg._hook_url = url;

                      console.log(`${LOG_PREFIX_XHR} 拦截到 XHR.open 调用：[${method}] ${url}`, '参数：', argumentsList);

                      // 调用原始 open
                      return safeCall(target, thisArg, argumentsList, LOG_PREFIX_XHR + ' open');
                  }
              });
              console.log(`${LOG_PREFIX_XHR} XHR.open Hook 应用成功。💯`);
          } else {
               console.warn(`${LOG_PREFIX_XHR} XMLHttpRequest.prototype.open 不可用，跳过 Hook。`);
          }

          // --- Hook XHR.send ---
          if (typeof xhrProto.send === 'function') {
              const originalXHRSend = xhrProto.send;
              console.log(`${LOG_PREFIX_XHR} 原始 XHR.send 已捕获。`);

              xhrProto.send = new Proxy(originalXHRSend, {
                  apply: function(target, thisArg, argumentsList) {
                      const requestBody = argumentsList[0];
                      const method = thisArg._hook_method || 'N/A';
                      const url = thisArg._hook_url || 'N/A';

                      console.log(`${LOG_PREFIX_XHR} 拦截到 XHR.send 调用 for [${method}] ${url}`, '请求体：', requestBody);

                      // 添加事件监听器以捕获响应
                      const onReadyStateChange = () => {
                          if (thisArg.readyState === 4) { // DONE
                              console.log(`${LOG_PREFIX_XHR} XHR 请求完成 for [${method}] ${url}`);
                              console.log(`${LOG_PREFIX_XHR} 状态：${thisArg.status} ${thisArg.statusText}`);
                              console.log(`${LOG_PREFIX_XHR} 响应头:\n${thisArg.getAllResponseHeaders()}`);
                              console.log(`${LOG_PREFIX_XHR} 响应类型：${thisArg.responseType}`);

                              let responseBody = 'N/A';
                              try {
                                  switch (thisArg.responseType) {
                                      case '': // Defaults to text
                                      case 'text':
                                          responseBody = thisArg.responseText;
                                          // 尝试解析 JSON
                                          try {
                                               const jsonBody = JSON.parse(responseBody); // 使用 Hook 后的 JSON.parse
                                               console.log(`${LOG_PREFIX_XHR} 响应体 (Parsed JSON):`, jsonBody);
                                          } catch(e) { /* 不是 JSON */ }
                                          break;
                                      case 'json':
                                          responseBody = thisArg.response; // 已经是解析后的对象
                                           console.log(`${LOG_PREFIX_XHR} 响应体 (JSON):`, responseBody);
                                          break;
                                      case 'blob':
                                      case 'arraybuffer':
                                          responseBody = `[${thisArg.responseType} data, size: ${thisArg.response ? thisArg.response.size || thisArg.response.byteLength : 0} bytes]`;
                                          break;
                                      case 'document':
                                           responseBody = '[XML Document]'; // or thisArg.responseXML
                                          break;
                                      default:
                                          responseBody = `[Unsupported responseType: ${thisArg.responseType}]`;
                                  }
                                  if (typeof responseBody === 'string' && thisArg.responseType !== 'json') {
                                       console.log(`${LOG_PREFIX_XHR} 响应体 (Raw):`, responseBody.substring(0, 500) + (responseBody.length > 500 ? '...' : '')); // 截断长文本
                                  }
                              } catch (e) {
                                  console.error(`${LOG_PREFIX_XHR} 读取 XHR 响应体时出错 for ${url}:`, e);
                                  responseBody = `[Error reading response body: ${e.message}]`;
                              }

                              // 移除监听器，避免内存泄漏 (虽然通常 XHR 实例生命周期结束会自动回收)
                              thisArg.removeEventListener('readystatechange', onReadyStateChange);
                              thisArg.removeEventListener('load', onLoad);
                              thisArg.removeEventListener('error', onError);
                              thisArg.removeEventListener('timeout', onTimeout);
                          }
                      };

                      const onLoad = () => { /* Handled by readyStateChange */ };
                      const onError = (e) => {
                           console.error(`${LOG_PREFIX_XHR} XHR 请求错误 for [${method}] ${url}:`, e);
                           removeListeners();
                      };
                      const onTimeout = (e) => {
                           console.warn(`${LOG_PREFIX_XHR} XHR 请求超时 for [${method}] ${url}:`, e);
                           removeListeners();
                      };
                      const removeListeners = () => {
                           thisArg.removeEventListener('readystatechange', onReadyStateChange);
                           thisArg.removeEventListener('load', onLoad);
                           thisArg.removeEventListener('error', onError);
                           thisArg.removeEventListener('timeout', onTimeout);
                      }


                      // 必须在调用原始 send 之前添加监听器
                      thisArg.addEventListener('readystatechange', onReadyStateChange);
                      // 添加 load/error/timeout 作为备用/更具体的事件捕获点
                      thisArg.addEventListener('load', onLoad);
                      thisArg.addEventListener('error', onError);
                      thisArg.addEventListener('timeout', onTimeout);


                      // 调用原始 send
                      return safeCall(target, thisArg, argumentsList, LOG_PREFIX_XHR + ' send');
                  }
              });
              console.log(`${LOG_PREFIX_XHR} XHR.send Hook 应用成功。💯`);
          } else {
               console.warn(`${LOG_PREFIX_XHR} XMLHttpRequest.prototype.send 不可用，跳过 Hook。`);
          }

      } else {
          console.warn(`${LOG_PREFIX_XHR} pageWindow.XMLHttpRequest 或其原型在 document-start 时不可用，跳过 Hook。`);
      }
  } catch (error) {
      console.error(`${LOG_PREFIX_XHR} 应用 XMLHttpRequest Hook 时发生严重错误:`, error);
  }


  // -------------------------------------------------------------------------
  //  🏁 Finalization - 完成标记
  // -------------------------------------------------------------------------
  try {
      pageWindow[HOOK_SUCCESS_FLAG] = true;
      console.log(`[全能 Hooker] 所有适用的 Hook 已在 document-start 成功应用！完美！版本 v2.0 🚀`);
      console.log(`[全能 Hooker] $1B 在望！💰 远离 🔥🍠！`);
  } catch (e) {
      console.error('[全能 Hooker] 设置全局成功标记时出错：', e);
  }

})(); // IIFE End