// ==UserScript==
// @name 喷嚏网
// @namespace http://tampermonkey.net/
// @version 0.0.1
// @description 喷嚏网的样式看着难受啊，改一改
// @author 千川汇海
// @match https://www.dapenti.com/*
// @icon https://www.google.com/s2/favicons?sz=64&domain=dapenti.com
// @grant GM_addStyle
// ==/UserScript==

;(function () {
  "use strict"

  GM_addStyle(`
    img:not([title]) {
        display: block;
        margin: 0 auto;
    }
    `)

  // Find all images on the page
  const images = document.querySelectorAll("img:not([title])")

  // Loop through each image
  images.forEach((img) => {
    // Store the original width and height of each image
    const originalWidth = img.naturalWidth
    const originalHeight = img.naturalHeight

    // Apply the initial small size
    img.style.width = "100px"
    img.style.height = "auto"
    img.style.transition = "all 0.3s ease" // Smooth transition

    // Add mouseover event to restore the original size
    img.addEventListener("mouseover", function () {
      img.style.width = originalWidth + "px"
      img.style.height = originalHeight + "px"
    })

    // Add mouseout event to shrink back to the small size
    img.addEventListener("mouseout", function () {
      img.style.width = "100px"
      img.style.height = "auto"
    })
  })
})()
