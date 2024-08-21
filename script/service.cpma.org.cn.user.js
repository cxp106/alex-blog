// ==UserScript==
// @name         公共卫生与预防医学继续教育平台-service.cpma 秒刷 v:shuake345-“大学习”活动线上培训
// @namespace    秒刷+++v:shuake345++++++++
// @version      v:shuake345
// @description“大学习”活动线上培训 | 秒刷+v:shuake345+|自动看课程
// @author       vx:shuake345
// @match        *://*.cpma.org.cn/edu/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=cpma.org.cn
// @grant        none
// ==/UserScript==

(function() {
	'use strict';
	window.alert = function() {}
	window.onbeforeunload = null
	window.confirm = function() {
		return true
	}
	var Zhuyurl = 'brand/detail/'
	var Chuyurl = 'detailCourse'
	var Shuyurl = 'courseDetails'
	var Fhuyurl = 'onlineStudy'

	document.addEventListener("visibilitychange", function() {
		console.log(document.visibilityState);
		if (document.visibilityState == "hidden") {
        //yincang
        } else if (document.visibilityState == "visible") {
			if (document.URL.search(Zhuyurl) > 1 ) {
				setTimeout(sxrefere, 1000)
			}
		}
	});

	function fhback() {
		window.history.go(-1)
	}

	function gbclose() {
		window.close()
	}

	function sxrefere() {
		window.location.reload()
	}

	function Zhuy() {
		var KC = document.querySelectorAll('.item>ul>li>a') //[0].href
		var KCjd = document.querySelectorAll('.item>ul>li>i') //[0].innerText
		for (var i = 0; i < KCjd.length; i++) {
			if (KCjd[i].innerText == '[未完成]') {
				window.open(KC[i].href)
				break;
			}
		}
	}

	function Chuy() {
		if(parseInt(localStorage.getItem('key'))==NaN){
            localStorage.setItem('key',0)
        }
        var Lookdpage = parseInt(localStorage.getItem('key'))
		var zKC = document.querySelectorAll('tbody>tr>td>a')
        var zKCnum=zKC.length-1//2num kc
        if(Lookdpage<zKCnum){
            localStorage.setItem('key',Lookdpage+1)
            zKC[Lookdpage].click()
           }else{
           localStorage.setItem('key',0)
           }
	}

	function Shuy() {
		if (document.URL.search(Shuyurl) > 2) {
			var zzKC = document.querySelectorAll('tbody>tr>td>span')
			var zzKCurl = document.querySelectorAll('tbody>tr>td>a')
			for (var i = 0; i < zzKC.length; i++) {
				if (zzKC[i].innerText == '未学完' || zzKC[i].innerText == '未开始') {
					localStorage.setItem('Surl', window.location.href)
					window.location.replace(zzKCurl[i].href)
					break;
				} else if (i == zzKC.length - 1) {
					setTimeout(gbclose, 1104)
				}
			}
		}
	}
	setInterval(Shuy, 3124)

	function Fhuy() {
		if (document.getElementsByTagName('video').length == 1) {
    const player = document.getElementsByTagName('video')[0];

    // 设置音量为 0
    player.volume = 0;

    // 设置播放速度为 16x
    player.playbackRate = 16;

    // 播放视频
    player.play();

    // 定义每秒快进 5 分钟的逻辑
    const fastForwardInterval = setInterval(function() {
        if (player.currentTime + 300 < player.duration) { // 300 秒 = 5 分钟
            player.currentTime += 300; // 快进 5 分钟
        } else {
            player.currentTime = player.duration; // 如果剩余时间不足 5 分钟，则跳到最后
            clearInterval(fastForwardInterval); // 停止定时器
        }
    }, 1000); // 每秒执行一次

    // 在视频结束时清除定时器
    player.addEventListener('ended', function() {
        clearInterval(fastForwardInterval);
    });
}


		if (document.querySelector('iframe').contentWindow.document.querySelector('span.qplayer-currtime').innerText == document.querySelector('iframe').contentWindow.document.querySelector('span.qplayer-totaltime').innerText) {
			window.location.replace(localStorage.getItem('Surl'))
		}
	}
	function QT(){
        var d1=document.getElementsByClassName('main main-note-scroll')[0];
        var img=document.createElement("img");
        var img1=document.createElement("img");
        img.style="width:230px; height:230px;"
        img1.style="width:230px; height:230px;"
        img1.src="https://img.nuannian.com/files/images/23/0305/1677989951-1403.jpg";//qitao
         img.src="https://img.nuannian.com/files/images/23/1019/1697723881-6511.png";//xuanchuan
        d1.appendChild(img);
        d1.appendChild(img1);
    }
	function Pd() {
		if (document.URL.search(Fhuyurl) > 2) {
			setTimeout(QT,20)
			setInterval(Fhuy, 5520)
            setTimeout(function(){
            window.location.replace(localStorage.getItem('Surl'))
            },61245*10)
		} else if (document.URL.search(Chuyurl) > 2) {
			setInterval(Chuy, 1210)
		} else if (document.URL.search(Zhuyurl) > 2) {
			setTimeout(Zhuy, 24)
		}
	}
	setTimeout(Pd, 1254)

})();