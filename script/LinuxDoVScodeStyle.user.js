// ==UserScript==
// @name         LinuxDo :: Apple Inspired Light Theme
// @namespace    http://tampermonkey.net/
// @version      3.0.0
// @description  Refined light theme for LinuxDo, inspired by Apple's design aesthetics.
// @author       千川汇海 (Refined by AI Frontend Architect w/ Apple Flair)
// @match        https://linux.do/*
// @icon         data:image/svg+xml;base64,PHN2ZyB2aWV3Qm94PSIwIDAgMzIgMzIiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHBhdGggZD0ibTExLjcgMTguNy02LjkgNS4yLTIuOC0xTDkgMTYgMiA5LjFsMi44LS45IDYuOSA1LjJMMjMuMSAyLjEgMzAgNC45djIyLjJMMjMuMiAzMFptMy42LTIuNyA3LjkgNS55VjEwLjFaIiBzdHlsZT0iZmlsbDojMDA3QUZGIi8+PC9zdmc+ // Use Apple Blue in Icon
// @license      MIT
// @run-at       document-start
// @grant        GM_addStyle
// ==/UserScript==

;(function () {
  "use strict"

  // --- Apple Inspired Palette ---
  const colors = {
    background: "#FFFFFF", // Content Background (White)
    secondaryBackground: "#F7F7F7", // Subtle Off-White/Light Gray (like macOS sidebars/toolbars)
    tertiaryBackground: "#EDEDED", // Hover/Active Background (Light Gray)
    border: "#EAEAEA", // Very Subtle Border/Divider
    mediumBorder: "#DCDCDC", // Input Borders (Slightly more visible)
    text: "#333333", // Primary Text (Dark Gray, not pure black)
    secondaryText: "#666666", // Secondary/Muted Text (Medium Gray)
    tertiaryText: "#888888", // Lighter Gray Text
    link: "#007AFF", // Apple Standard Blue
    linkHover: "#0056B3", // Darker Blue for Hover
    buttonBg: "#F5F5F5", // Default Button Bg (Very Light Gray)
    buttonText: "#333333", // Default Button Text
    primaryButtonBg: "#007AFF", // Primary Button Bg (Apple Blue)
    primaryButtonText: "#FFFFFF", // Primary Button Text (White)
    primaryButtonHoverBg: "#0056B3", // Primary Button Hover Bg
    codeBackground: "#F8F9FA", // Light, clean code background
    codeText: "#24292E", // Good contrast code text
    highlightBg: "#FFF9C4", // Subtle Yellow Highlight
    error: "#FF3B30", // Apple Standard Red for errors
    success: "#34C759", // Apple Standard Green for success
  }

  // --- Apple Inspired Typography ---
  const fonts = {
    // Prioritize Apple's system font, fallback gracefully
    main: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif, 'Apple Color Emoji', 'Segoe UI Emoji', 'Segoe UI Symbol'",
    monospace: "'SF Mono', Consolas, 'Liberation Mono', Menlo, Courier, monospace", // SF Mono if available
  }

  // --- Style Injection ---
  GM_addStyle(`

/* === 1. Global & Base Styles (Apple Aesthetic) === */
html {
    background-color: ${colors.background} !important;
    -webkit-font-smoothing: antialiased !important; /* Smoother fonts on WebKit */
    -moz-osx-font-smoothing: grayscale !important;  /* Smoother fonts on Firefox */
}

body {
    font-family: ${fonts.main} !important;
    background-color: ${colors.background} !important;
    color: ${colors.text} !important;
    font-size: 14.5px !important; /* Slightly larger base size */
    line-height: 1.55 !important; /* More generous line height */
    letter-spacing: -0.01em !important; /* Subtle negative tracking common in Apple UI */
    --font-family: ${fonts.main} !important;
    --heading-font-family: ${fonts.main} !important;
    --d-font-family--monospace: ${fonts.monospace} !important;
}

/* Reset borders & shadows more delicately */
* {
    border-color: transparent !important; /* Default to no visible border */
    box-shadow: none !important;
}
*:focus {
    outline-color: ${colors.link} !important; /* Use accent color for focus ring */
    outline-offset: 2px;
    outline-style: auto; /* Default focus style */
    outline-width: 2px; /* Thin focus ring */
}


a {
    color: ${colors.link} !important;
    text-decoration: none !important;
    transition: color 0.15s ease-in-out;
}
a:hover {
    color: ${colors.linkHover} !important;
    text-decoration: none !important; /* Avoid underline on hover */
}

/* Layout - Ensure full width but maybe add subtle padding */
#main-container {
    padding: 0 10px; /* Add slight horizontal padding */
}
#main-outlet-wrapper,
body.has-sidebar-page header.d-header > div.wrap,
:root {
    max-width: 100% !important;
}
.wrap {
     max-width: 100% !important;
     padding: 0 !important; /* Remove Discourse default wrap padding */
}


/* === 2. Header (Clean & Subtle) === */
header.d-header {
    background-color: ${colors.secondaryBackground} !important;
    border-bottom: 1px solid ${colors.border} !important;
    color: ${colors.secondaryText} !important;
    padding: 5px 15px !important; /* Adjust padding */
    height: 50px !important; /* Consistent height */
    box-shadow: none !important;
    box-sizing: border-box;
}
.d-header .title a {
    color: ${colors.text} !important;
    font-weight: 600 !important; /* Semi-bold title */
}
.d-header .title a:hover {
    color: ${colors.text} !important;
}
.d-header .d-header-icons .icon,
.d-header #current-user .d-icon {
    color: ${colors.tertiaryText} !important; /* Lighter icons */
    padding: 8px !important;
    border-radius: 6px !important; /* Rounded background on hover */
}
.d-header .d-header-icons .icon:hover,
.d-header .d-header-icons .icon:focus {
    color: ${colors.link} !important; /* Use link color on hover */
    background-color: ${colors.tertiaryBackground} !important;
}


/* === 3. Main Content Area (Airy) === */
#main-outlet,
.container.posts,
.topic-area {
    background-color: ${colors.background} !important;
    padding-top: 20px !important; /* More space above content */
}
#main-outlet-wrapper {
     background-color: ${colors.background} !important;
}

/* === 4. Topic List (Minimalist) === */
.topic-list,
table.topic-list {
    background-color: ${colors.background} !important;
    color: ${colors.text} !important;
    border-collapse: collapse !important; /* Remove spacing between rows */
}
table.topic-list tbody tr.topic-list-item {
    border-top: 1px solid ${colors.border} !important;
    border-bottom: none !important;
    padding: 12px 8px !important; /* More vertical padding */
    transition: background-color 0.15s ease-in-out;
}
table.topic-list tbody tr.topic-list-item:last-of-type {
    border-bottom: 1px solid ${colors.border} !important;
}
table.topic-list tbody tr.topic-list-item:hover {
    background-color: ${colors.secondaryBackground} !important; /* Use the softer secondary bg for hover */
}
table.topic-list a.title.raw-link.raw-topic-link {
    color: ${colors.text} !important; /* Make titles standard text color */
    font-weight: 500 !important; /* Medium weight */
    font-size: 15px !important;
}
table.topic-list a.title.raw-link.raw-topic-link:visited {
    color: ${colors.secondaryText} !important; /* Gray out visited titles */
    opacity: 1 !important;
}
table.topic-list a.title.raw-link.raw-topic-link:hover {
    color: ${colors.link} !important; /* Highlight link color on hover */
}
table.topic-list .topic-excerpt {
    color: ${colors.secondaryText} !important;
    font-size: 13px !important;
    padding-top: 2px !important;
}
.topic-list td, .topic-list th {
    border: none !important;
    color: inherit !important;
    padding: 8px !important; /* Consistent cell padding */
}
.topic-list th {
    color: ${colors.secondaryText} !important;
    font-weight: 500 !important;
    font-size: 12px !important;
    text-transform: uppercase !important;
    letter-spacing: 0.05em !important;
}
.topic-list td.topic-list-data.posters {
    opacity: 0.6 !important;
}
.topic-list td.topic-list-data.posters:hover {
    opacity: 1 !important;
}
.topic-list-item .topic-list-data .badge-notification {
    background-color: ${colors.link} !important;
    color: ${colors.primaryButtonText} !important;
    box-shadow: none !important;
    font-size: 11px !important;
    padding: 2px 6px !important;
    border-radius: 10px !important; /* Pill shape */
    font-weight: 500 !important;
}

/* === 5. Post / Topic View (Readable & Clean) === */
.topic-post, .embedded-posts {
    background-color: ${colors.background} !important;
    border: none !important;
    margin-bottom: 25px !important; /* Space between posts */
}
.topic-body {
    width: 100% !important;
    border-top: 1px solid ${colors.border} !important;
    padding: 20px 0 !important; /* More vertical padding */
}
.topic-meta-data {
    color: ${colors.secondaryText} !important;
    font-size: 13px !important;
    padding-bottom: 15px !important;
}
.post-stream .topic-post:first-of-type .topic-body {
     border-top: none !important;
     padding-top: 5px !important;
}
.names span a { /* Username links */
    color: ${colors.text} !important;
    font-weight: 500 !important;
}
.names span a:hover {
    color: ${colors.link} !important;
}
.cooked {
    color: ${colors.text} !important;
    font-size: 15.5px !important; /* Slightly larger post font */
    line-height: 1.65 !important;
}
.cooked > *:first-child { margin-top: 0 !important; }
.cooked > *:last-child { margin-bottom: 0 !important; }

.cooked blockquote {
    background-color: transparent !important;
    border-left: 3px solid ${colors.mediumBorder} !important; /* Thinner, gray border */
    color: ${colors.secondaryText} !important;
    margin: 1.5em 0 1.5em 5px !important; /* Adjust margin */
    padding: 5px 15px !important; /* Adjust padding */
    font-style: normal !important; /* No italics by default */
}
.cooked pre, .cooked code {
    font-family: ${fonts.monospace} !important;
    background-color: ${colors.codeBackground} !important;
    color: ${colors.codeText} !important;
    border: 1px solid ${colors.border} !important;
    border-radius: 6px !important; /* Consistent rounded corners */
    font-size: 0.9em !important; /* Slightly smaller code font */
    padding: 0.2em 0.5em !important;
}
.cooked pre {
    padding: 1em !important;
    margin: 1.5em 0 !important;
    overflow-x: auto !important;
    line-height: 1.4 !important; /* Adjust code line height */
}
.cooked pre code {
    border: none !important;
    padding: 0 !important;
    background: none !important;
    font-size: 1em !important; /* Inherit pre font size */
    border-radius: 0 !important;
}
.topic-map {
    background-color: ${colors.secondaryBackground} !important;
    border: 1px solid ${colors.border} !important;
    border-radius: 8px !important; /* More rounded */
    padding: 15px !important;
    margin-top: 20px !important;
}
.topic-map .topic-map-row {
    border-bottom: 1px solid ${colors.border} !important;
    padding: 8px 0 !important;
}
.topic-map .topic-map-row:last-child { border-bottom: none !important; }
.topic-map .topic-map-label { color: ${colors.secondaryText} !important; font-size: 13px !important;}
.topic-map .topic-map-data a { font-weight: 500 !important; }


/* === 6. Editor / Reply Control (Subtle & Functional) === */
#reply-control {
    background-color: ${colors.secondaryBackground} !important;
    border-top: 1px solid ${colors.border} !important;
    color: ${colors.text} !important;
    padding: 10px 15px !important;
}
.d-editor-textarea-wrapper {
    background-color: ${colors.background} !important;
    border: 1px solid ${colors.mediumBorder} !important;
    border-radius: 8px !important; /* Rounded textarea */
    padding: 8px 12px !important;
}
textarea.d-editor-input {
    color: ${colors.text} !important;
    background-color: transparent !important;
    font-family: ${fonts.main} !important; /* Use main font in editor too */
    font-size: 15px !important;
    line-height: 1.6 !important;
}
.d-editor-preview-wrapper,
.d-editor-preview {
    background-color: ${colors.background} !important;
    border-left: 1px solid ${colors.border} !important;
    color: ${colors.text} !important;
    padding: 15px !important;
    margin-top: 10px !important; /* Space between editor and preview */
}
.d-editor-button {
    color: ${colors.secondaryText} !important;
    border: none !important;
    border-radius: 6px !important;
    padding: 6px 8px !important;
    margin: 2px !important;
}
.d-editor-button:hover,
.d-editor-button.active {
    background-color: ${colors.tertiaryBackground} !important;
    color: ${colors.link} !important;
}
.grippie {
    background-color: ${colors.border} !important;
    border-color: ${colors.border} !important;
    border-radius: 3px !important;
    height: 8px !important;
}

/* === 7. Buttons & Badges (Apple Style) === */
.btn {
    background-color: ${colors.buttonBg} !important;
    color: ${colors.text} !important; /* Use primary text for default buttons */
    border: 1px solid ${colors.mediumBorder} !important; /* Subtle border */
    box-shadow: none !important;
    font-weight: 500 !important; /* Medium weight */
    padding: 8px 16px !important; /* More padding */
    border-radius: 8px !important; /* Rounded corners */
    transition: background-color 0.15s ease-in-out, border-color 0.15s ease-in-out;
    font-size: 14px !important;
}
.btn:hover {
    background-color: ${colors.tertiaryBackground} !important;
    border-color: ${colors.mediumBorder} !important;
    color: ${colors.text} !important;
}
.btn-primary {
    background-color: ${colors.primaryButtonBg} !important;
    color: ${colors.primaryButtonText} !important;
    border-color: transparent !important; /* No border for primary */
}
.btn-primary:hover {
    background-color: ${colors.primaryButtonHoverBg} !important;
    border-color: transparent !important;
    color: ${colors.primaryButtonText} !important;
}
.btn-danger { /* Style danger buttons */
    background-color: ${colors.error} !important;
    color: ${colors.primaryButtonText} !important;
    border-color: transparent !important;
}
.btn-danger:hover {
    filter: brightness(90%) !important;
    color: ${colors.primaryButtonText} !important;
    border-color: transparent !important;
}

/* Badges */
.badge-wrapper .badge-category-parent-bg,
.badge-wrapper .badge-category-bg {
    opacity: 0.15 !important;
}
.badge-wrapper .badge-category-parent-line {
     background-color: currentColor !important;
     opacity: 0.4 !important;
}
.category-badge-wrapper .category-badge,
.badge-wrapper.bullet span.badge-category {
    color: ${colors.secondaryText} !important;
    font-weight: 500 !important;
    font-size: 12px !important;
}
span.badge-tag {
    background-color: ${colors.tertiaryBackground} !important;
    color: ${colors.secondaryText} !important;
    border-radius: 4px !important; /* Slightly less rounded tags */
    padding: 3px 6px !important;
    font-size: 12px !important;
    font-weight: 500 !important;
}


/* === 8. Sidebar (Clean Integration) === */
.sidebar-wrapper {
    background-color: ${colors.secondaryBackground} !important;
    border-left: 1px solid ${colors.border} !important;
    padding: 15px !important;
    box-sizing: border-box !important; /* Include padding in width */
}
.sidebar-container {
    color: ${colors.text} !important;
}
.sidebar-section h4 { /* Section headers */
    color: ${colors.secondaryText} !important;
    font-size: 12px !important;
    font-weight: 600 !important;
    text-transform: uppercase !important;
    letter-spacing: 0.05em !important;
    margin-bottom: 8px !important;
}
.sidebar-wrapper > #d-sidebar > div.sidebar-footer-wrapper .sidebar-footer-container:before {
    border-bottom: 1px solid ${colors.border} !important;
    background: none !important;
}
.sidebar-section a {
    color: ${colors.secondaryText} !important;
    padding: 4px 0 !important;
    border-radius: 4px !important;
}
.sidebar-section a:hover {
    color: ${colors.link} !important;
    background-color: ${colors.tertiaryBackground} !important; /* Subtle hover bg */
}


/* === 9. Misc Elements (Refined) === */
.nav-pills>li>a {
    color: ${colors.secondaryText} !important;
    border-radius: 8px !important; /* Rounded pills */
    border: none !important;
    padding: 8px 14px !important;
    font-weight: 500 !important;
    font-size: 14px !important;
    margin: 0 2px !important;
}
.nav-pills>li>a:hover {
    background-color: ${colors.tertiaryBackground} !important;
    color: ${colors.text} !important;
}
.nav-pills>li.active>a,
.nav-pills>li.active>a:hover,
.nav-pills>li.active>a:focus {
    background-color: ${colors.link} !important;
    color: ${colors.primaryButtonText} !important;
    box-shadow: none !important;
}
.select-kit.dropdown-select-box .select-kit-header {
    background-color: ${colors.background} !important;
    border: 1px solid ${colors.mediumBorder} !important;
    color: ${colors.text} !important;
    border-radius: 8px !important;
    padding: 8px 12px !important;
}
.select-kit.dropdown-select-box .select-kit-header:hover {
    border-color: ${colors.secondaryText} !important; /* Darker border on hover */
}
.select-kit.dropdown-select-box .select-kit-body {
    background-color: ${colors.background} !important;
    border: 1px solid ${colors.border} !important; /* Lighter border for dropdown */
    box-shadow: 0 4px 12px rgba(0,0,0,0.1) !important; /* Softer shadow */
    border-radius: 8px !important;
    margin-top: 4px !important;
}
.select-kit.dropdown-select-box .select-kit-row { padding: 8px 12px !important; }
.select-kit.dropdown-select-box .select-kit-row[data-value]:hover {
    background-color: ${colors.link} !important;
    color: ${colors.primaryButtonText} !important;
}
hr {
    border: none !important;
    border-top: 1px solid ${colors.border} !important;
    margin: 25px 0 !important; /* More space around dividers */
}
.extra-info-wrapper { /* Footer info */
    background-color: ${colors.secondaryBackground} !important;
    border-top: 1px solid ${colors.border} !important;
    padding: 15px !important;
    color: ${colors.secondaryText} !important;
    font-size: 13px !important;
}
.extra-info-wrapper a { color: ${colors.secondaryText} !important; }
.extra-info-wrapper a:hover { color: ${colors.link} !important; }


/* Scrollbars */
::-webkit-scrollbar {
    width: 6px !important;
    height: 6px !important;
}
::-webkit-scrollbar-track {
    background: transparent !important; /* Invisible track */
}
::-webkit-scrollbar-thumb {
    background: ${colors.mediumBorder} !important;
    border-radius: 3px !important;
}
::-webkit-scrollbar-thumb:hover {
    background: ${colors.secondaryText} !important;
}

/* Loading Spinner */
body > #d-splash > img.preloader-image {
    filter: none !important;
    opacity: 0.6 !important; /* Slightly more subtle */
}

/* Hide specific unwanted elements */
.extra-info-wrapper .header-title { display: none !important; }

/* Text Selection */
::selection {
  background-color: ${colors.link} !important;
  color: ${colors.primaryButtonText} !important;
}
::-moz-selection { /* Firefox */
  background-color: ${colors.link} !important;
  color: ${colors.primaryButtonText} !important;
}

/* --- End of CSS Injection --- */
`)

  // --- VSCode Icon and Title Settings (Unchanged logic) ---
  const settings = {
    icon_main:
      "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iODAwIiBoZWlnaHQ9IjgwMCIgdmlld0JveD0iMCAwIDMyIDMyIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjxwYXRoIGQ9Im0yOS4wMSA1LjAzLTUuNzY2LTIuNzc2YTEuNzQgMS43NCAwIDAgMC0xLjk4OS4zMzhMMi4zOCAxOS44YTEuMTY2IDEuMTY2IDAgMCAwLS4wOCAxLjY0N3EuMDM3LjA0LjA3Ny4wNzdsMS41NDEgMS40YTEuMTY1IDEuMTY1IDAgMCAwIDEuNDg5LjA2NkwyOC4xNDIgNS43NUExLjE1OCAxLjE1OCAwIDAgMSAzMCA2LjY3MnYtLjA2N2ExLjc1IDEuNzUgMCAwIDAtLjk5LTEuNTc1IiBzdHlsZT0iZmlsbDojMDA2NWE5Ii8+PHBhdGggZD0ibTI5LjAxIDI2Ljk3LTUuNzY2IDIuNzc3YTEuNzQ1IDEuNzQ1IDAgMCAxLTEuOTg5LS4zMzhMMi4zOCAxMi4yYTEuMTY2IDEuMTY2IDAgMCAxLS4wOC0xLjY0N3EuMDM3LS4wNC4wNzctLjA3N2wxLjU0MS0xLjRBMS4xNjUgMS4xNjUgMCAwIDEgNS40MSA5LjAxbDIyLjczMiAxNy4yNEExLjE1OCAxLjE1OCAwIDAgMCAzMCAyNS4zMjh2LjA3MmExLjc1IDEuNzUgMCAwIDEtLjk5IDEuNTciIHN0eWxlPSJmaWxsOiMwMDdhY2MiLz48cGF0aCBkPSJNMjMuMjQ0IDI5Ljc0N2ExLjc0NSAxLjc0NSAwIDAgMS0xLjk4OS0uMzM4QTEuMDI1IDEuMDI1IDAgMCAwIDIzIDI4LjY4NFYzLjMxNmExLjAyNCAxLjAyNCAwIDAgMC0xLjc0OS0uNzI0IDEuNzQgMS43NCAwIDAgMSAxLjk4OS0uMzM5bDUuNzY1IDIuNzcyQTEuNzUgMS43NSAwIDAgMSAzMCA2LjZ2MTguOGExLjc1IDEuNzUgMCAwIDEtLjk5MSAxLjU3NloiIHN0eWxlPSJmaWxsOiMxZjljZjAiLz48L3N2Zz4=", // Using Apple Blue
    // Simplified wide icon with just the logo colored appropriately
    icon_wide:
      "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzIiIGhlaWdodD0iMzIiIHZpZXdCb3g9IjAgMCAzMiAzMiIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cGF0aCBkPSJtMjkuMDEgNS4wMy01Ljc2Ni0yLjc3NmExLjc0IDEuNzQgMCAwIDAtMS45ODkuMzM4TDIuMzggMTkuOGExLjE2NiAxLjE2NiAwIDAgMC0uMDggMS42NDdxLjAzNy4wNC4wNzcuMDc3bDEuNTQxIDEuNGExLjE2NSAxLjE2NSAwIDAgMCAxLjQ4OS4wNjZMMjguMTQyIDUuNzVBMS4xNTggMS4xNTggMCAwIDEgMzAgNi42NzJ2LS4wNjdhMS43NSAxLjc1IDAgMCAwLS45OS0xLjU3NSIgc3R5bGU9ImZpbGw6IzAwNkFFMCIvPjxwYXRoIGQ9Im0yOS4wMSAyNi45Ny01Ljc2NiAyLjc3N2ExLjc0NSAxLjc0NSAwIDAgMS0xLjk4OS0uMzM4TDIuMzggMTIuMmExLjE2NiAxLjE2NiAwIDAgMS0uMDgtMS42NDdxLjAzNy0uMDQuMDc3LS4wNzdsMS41NDEtMS40QTEuMTY1IDEuMTY1IDAgMCAxIDUuNDEgOS4wMWwyMi43MzIgMTcuMjRBMS4xNTggMS4xNTggMCAwIDAgMzAgMjUuMzI4di4wNzJhMS43NSAxLjc1IDAgMCAxLS45OSAxLjU3IiBzdHlsZT0iZmlsbDojMDA3QUZGIi8+PHBhdGggZD0iTTIzLjI0NCAyOS43NDdhMS43NDUgMS43NDUgMCAwIDEtMS45ODktLjMzOEExLjAyNSAxLjAyNSAwIDAgMCAyMyAyOC42ODRWMy4zMTZhMS4wMjQgMS4wMjQgMCAwIDAtMS43NDktLjcyNCAxLjc0IDEuNzQgMCAwIDEgMS45ODktLjMzOWw1Ljc2NSAyLjc3MkExLjc1IDEuNzUgMCAwIDEgMzAgNi42djE4LjhhMS43NSAxLjc1IDAgMCAxLS45OTEgMS41NzZaIiBzdHlsZT0iZmlsbDojMUY5Q0YwIi8+PC9zdmc+",
  }

  // Logo Replacement Style (Adjusted for potentially simpler wide logo)
  GM_addStyle(`
      #site-logo {
        object-fit: scale-down;
        object-position: -999vw; /* Hide original img content */
        background-size: contain; /* Use contain to ensure full logo visibility */
        background-repeat: no-repeat;
        background-position: center left; /* Align logo */
        background-image: url('${settings.icon_main}');
        opacity: 1;
        transition: opacity 0.5s ease;
        width: 32px !important; /* Set explicit width */
        height: 32px !important;/* Set explicit height */
        display: inline-block !important; /* Ensure it behaves like an image */
      }
      #site-logo.logo-big {
        background-image: url('${settings.icon_wide}') !important;
        width: 100px !important; /* Adjust width for wide logo */
         height: 32px !important; /* Adjust height for wide logo */
         background-size: contain !important;
      }
      #site-logo.logo-mobile {
        background-image: url('${settings.icon_wide}') !important; /* Or a mobile-specific one */
        width: 100px !important; /* Adjust width */
         height: 32px !important; /* Adjust height */
        background-size: contain !important;
      }
      /* Keep the custom logo visible on hover */
      /* #site-logo:hover { } */
      .d-header .title { display: flex; align-items: center; overflow: hidden; } /* Align logo and title text */
    `)

  // Function to Replace Favicon and Title (Keep unchanged logic)
  function replaceIconAndTitle() {
    // Replace Favicon
    let faviconLink = document.querySelector('link[rel="icon"], link[rel="shortcut icon"]')
    if (faviconLink) {
      if (faviconLink.href !== settings.icon_main) {
        faviconLink.href = settings.icon_main
      }
    } else {
      const newFavicon = document.createElement("link")
      newFavicon.rel = "icon"
      newFavicon.type = "image/svg+xml"
      newFavicon.href = settings.icon_main
      document.head.appendChild(newFavicon)
    }
    // Prepend "VSCode | " to Title (Maintain this prefix for script identity)
    const targetPrefix = "VSCode | " // Keep prefix for clarity of script origin
    if (!document.title.startsWith(targetPrefix)) {
      const baseTitle = document.title.split(" | ").pop() || document.title
      if (!baseTitle.startsWith("VSCode")) {
        document.title = targetPrefix + baseTitle
      } else if (document.title !== baseTitle) {
        document.title = targetPrefix + baseTitle
      } else if (!document.title.includes("|")) {
        document.title = targetPrefix + document.title
      }
    }
  }

  // Initial Application & Robust Observation (Keep unchanged logic)
  replaceIconAndTitle()
  const observer = new MutationObserver((mutationsList) => {
    for (const mutation of mutationsList) {
      if (
        (mutation.type === "childList" && (mutation.target === document.head || mutation.target === document.querySelector("title"))) ||
        (mutation.type === "characterData" && mutation.target === document.querySelector("title")?.firstChild)
      ) {
        requestAnimationFrame(replaceIconAndTitle)
        return
      }
    }
  })
  observer.observe(document.head, { childList: true, subtree: true, characterData: true })
})() // End of IIFE
