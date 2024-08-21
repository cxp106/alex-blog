// ==UserScript==
// @name         公共卫生与预防医学继续教育平台-service.cpma 秒刷“大学习”活动线上培训
// @namespace    千川汇海
// @version      1.1
// @description  自动看课程
// @author       千川汇海
// @match        *://*.cpma.org.cn/edu/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=cpma.org.cn
// @grant        none
// ==/UserScript==

(function () {
    "use strict";

    // 禁用不必要的窗口功能
    window.alert = function () {};
    window.onbeforeunload = null;
    window.confirm = function () { return true; };

    const URL_PATTERNS = {
        brandDetail: "brand/detail/",
        courseDetail: "detailCourse",
        courseDetails: "courseDetails",
        onlineStudy: "onlineStudy"
    };

    document.addEventListener("visibilitychange", function () {
        if (document.visibilityState === "visible" && document.URL.includes(URL_PATTERNS.brandDetail)) {
            setTimeout(reloadPage, 1000);
        }
    });

    function reloadPage() {
        window.location.reload();
    }

    function goBack() {
        window.history.back();
    }

    function closeWindow() {
        window.close();
    }

    function openIncompleteCourse() {
        const courses = document.querySelectorAll(".item>ul>li>a");
        const statuses = document.querySelectorAll(".item>ul>li>i");

        for (let i = 0; i < statuses.length; i++) {
            if (statuses[i].innerText === "[未完成]") {
                window.open(courses[i].href);
                break;
            }
        }
    }

    function navigateThroughCourses() {
        let currentPage = parseInt(localStorage.getItem("currentPage") || "0", 10);
        const courses = document.querySelectorAll("tbody>tr>td>a");

        if (currentPage < courses.length - 1) {
            localStorage.setItem("currentPage", currentPage + 1);
            courses[currentPage].click();
        } else {
            localStorage.setItem("currentPage", 0);
        }
    }

    function continueIncompleteCourses() {
        const courseDetails = document.querySelectorAll("tbody>tr>td>span");
        const courseLinks = document.querySelectorAll("tbody>tr>td>a");

        for (let i = 0; i < courseDetails.length; i++) {
            if (courseDetails[i].innerText === "未学完" || courseDetails[i].innerText === "未开始") {
                localStorage.setItem("lastCourseURL", window.location.href);
                window.location.replace(courseLinks[i].href);
                break;
            } else if (i === courseDetails.length - 1) {
                setTimeout(closeWindow, 1104);
            }
        }
    }

    function handleVideoPlayback() {
        const video = document.querySelector("video");

        if (video) {
            video.volume = 0;
            video.playbackRate = 16;
            video.play();

            const fastForwardInterval = setInterval(() => {
                if (video.currentTime + 300 < video.duration) {
                    video.currentTime += 300;
                } else {
                    video.currentTime = video.duration;
                    clearInterval(fastForwardInterval);
                }
            }, 1000);

            video.addEventListener("ended", () => clearInterval(fastForwardInterval));
        }

        const iframeDoc = document.querySelector("iframe")?.contentWindow?.document;
        if (iframeDoc) {
            const currentTime = iframeDoc.querySelector("span.qplayer-currtime")?.innerText;
            const totalTime = iframeDoc.querySelector("span.qplayer-totaltime")?.innerText;

            if (currentTime === totalTime) {
                window.location.replace(localStorage.getItem("lastCourseURL"));
            }
        }
    }

    function appendImages() {
        const container = document.querySelector(".main.main-note-scroll");

        if (container) {
            const img1 = new Image(230, 230);
            const img2 = new Image(230, 230);
            img1.src = "https://img.nuannian.com/files/images/23/0305/1677989951-1403.jpg";
            img2.src = "https://img.nuannian.com/files/images/23/1019/1697723881-6511.png";
            container.appendChild(img1);
            container.appendChild(img2);
        }
    }

    function initialize() {
        if (document.URL.includes(URL_PATTERNS.onlineStudy)) {
            setTimeout(appendImages, 20);
            setInterval(handleVideoPlayback, 5520);
            setTimeout(() => window.location.replace(localStorage.getItem("lastCourseURL")), 612450);
        } else if (document.URL.includes(URL_PATTERNS.courseDetail)) {
            setInterval(navigateThroughCourses, 1210);
        } else if (document.URL.includes(URL_PATTERNS.brandDetail)) {
            setTimeout(openIncompleteCourse, 24);
        }
    }

    setTimeout(initialize, 1254);
})();
