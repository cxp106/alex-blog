// ==UserScript==
// @name         降水概率图
// @namespace    http://tampermonkey.net/
// @version      2024-04-20
// @description  将数据转换成直观的降水概率图
// @author       You
// @match        https://www.accuweather.com/zh/cn/*/*/hourly-weather-forecast/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=accuweather.com
// @require      https://cdn.jsdelivr.net/npm/echarts@5.4.0/dist/echarts.min.js
// @grant        none
// ==/UserScript==

(function () {
    'use strict';
    var targetElement = document.querySelector('.template-root');
    var newDiv = document.createElement('div');
    newDiv.id = 'draw';
    newDiv.style.cssText =
      'top: 120px; right: 16px; background: #f9fafbc4; color: #ffffff; overflow: hidden; z-index: 9999; position: fixed; padding: 5px; text-align: center; width: 550px; height: 360px; border-bottom-left-radius: 4px; border-bottom-right-radius: 4px; border-top-left-radius: 4px; border-top-right-radius: 4px;';
    newDiv.textContent = '这是插入的 div 元素。';
    targetElement.parentNode.insertBefore(newDiv, targetElement);
    function draw(date, count) {
      var chartDom = document.getElementById('draw');
      var myChart = echarts.init(chartDom);
      var option;
      option = {
        title: {
          text: '降水概率图',
          left: 'center',
        },
        xAxis: {
          type: 'category',
          data: date,
          axisLabel: {
            formatter: '{value}h',
          },
        },
        yAxis: {
          type: 'value',
          axisLabel: {
            formatter: '{value}%',
          },
        },
        series: [
          {
            data: count,
            type: 'line',
            lineStyle: {
              normal: {
                width: 8,
                color: {
                  type: 'linear',
  
                  colorStops: [
                    {
                      offset: 0,
                      color: '#44CEF6', // 0% 处的颜色
                    },
                    {
                      offset: 1,
                      color: '#177CB0', // 100% 处的颜色
                    },
                  ],
                  globalCoord: false, // 缺省为 false
                },
                shadowColor: 'rgba(68,206,246, 0.3)',
                shadowBlur: 10,
                shadowOffsetY: 20,
              },
            },
            itemStyle: {
              normal: {
                color: '#fff',
                borderWidth: 10,
                /*shadowColor: 'rgba(68,206,246, 0.3)',
                  shadowBlur: 100,*/
                borderColor: '#177CB0',
              },
            },
            smooth: true,
          },
        ],
      };
  
      option && myChart.setOption(option);
    }
    const list = document.querySelectorAll('.precip');
    const times = [...new Array(list.length)].reduce((a, b, i) => {
      a.push(24 - list.length + i);
      return a;
    }, []);
    const datas = [...list].map((item) => parseFloat(item.innerText));
    draw(times, datas);
    // Your code here...
  })();
  