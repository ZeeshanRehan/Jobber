// popup.js
// Runs inside the popup window when you click the extension icon.
// Handles: setup (save squad code + name), detecting job URL, sharing.

// ── Config ────────────────────────────────────────────────────────────────
// Change this to your Vercel URL when deployed
const API_URL = 'http://localhost:3000'

// ── DOM refs ──────────────────────────────────────────────────────────────
const setupEl      = document.getElementById('setup')
const shareEl      = document.getElementById('share-view')
const squadInput   = document.getElementById('squad-code')
const nameInput    = document.getElementById('person-name')
const saveBtn      = document.getElementById('save-btn')
const setupStatus  = document.getElementById('setup-status')
const urlPreview   = document.getElementById('url-preview')
const shareBtn     = document.getElementById('share-btn')
const shareStatus  = document.getElementById('share-status')
const resetBtn     = document.getElementById('reset-btn')

let currentUrl = null // URL of the current job page

// ── Init ──────────────────────────────────────────────────────────────────
// On popup open: check if we already have saved settings
chrome.storage.local.get(['squadCode', 'personName'], (data) => {
  if (data.squadCode && data.personName) {
    // already set up — show share view
    showShareView()
  } else {
    // first time — show setup
    setupEl.style.display = 'block'
    shareEl.style.display = 'none'
  }
})

// ── Setup: save squad code + name ─────────────────────────────────────────
saveBtn.addEventListener('click', async () => {
  const code = squadInput.value.trim().toUpperCase()
  const name = nameInput.value.trim()

  if (!code || !name) {
    setupStatus.textContent = 'fill in both fields'
    setupStatus.className = 'status error'
    return
  }

  // validate squad code against your API before saving
  const res = await fetch(`${API_URL}/api/jobs?squadCode=${code}`)
  if (!res.ok) {
    setupStatus.textContent = 'invalid squad code'
    setupStatus.className = 'status error'
    return
  }

  // save to chrome.storage — persists across browser sessions
  chrome.storage.local.set({ squadCode: code, personName: name }, () => {
    showShareView()
  })
})

// ── Share view: detect URL + share button ─────────────────────────────────
function showShareView() {
  setupEl.style.display = 'none'
  shareEl.style.display = 'block'

  // ask content.js for the current page URL via message passing
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    const tabId = tabs[0].id

    chrome.tabs.sendMessage(tabId, { type: 'GET_URL' }, (response) => {
      if (chrome.runtime.lastError || !response) {
        // not a job page or content script not injected
        urlPreview.textContent = 'not a job page'
        shareBtn.disabled = true
        return
      }

      currentUrl = response.url
      urlPreview.textContent = currentUrl
      shareBtn.disabled = false
    })
  })
}

// ── Share button: POST job to your API ───────────────────────────────────
shareBtn.addEventListener('click', async () => {
  if (!currentUrl) return

  shareBtn.disabled = true
  shareStatus.textContent = 'sharing...'
  shareStatus.className = 'status'

  chrome.storage.local.get(['squadCode', 'personName'], async (data) => {
    try {
      const res = await fetch(`${API_URL}/api/jobs`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          URL: currentUrl,
          person: data.personName,
          joiningCode: data.squadCode,
        }),
      })

      if (!res.ok) throw new Error('failed')

      shareStatus.textContent = '✓ shared with your squad'
      shareStatus.className = 'status success'
    } catch {
      shareStatus.textContent = 'something went wrong'
      shareStatus.className = 'status error'
      shareBtn.disabled = false
    }
  })
})

// ── Reset: clear storage, go back to setup ────────────────────────────────
resetBtn.addEventListener('click', () => {
  chrome.storage.local.clear(() => {
    setupEl.style.display = 'block'
    shareEl.style.display = 'none'
    shareStatus.textContent = ''
  })
})