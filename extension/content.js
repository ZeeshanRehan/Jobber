// content.js
// Injected into job board pages matching the manifest patterns.
// Only job: listen for GET_URL from popup, respond with current page URL.

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'GET_URL') {
    sendResponse({ url: window.location.href })
  }
  return true // keeps the message channel open for async response
})