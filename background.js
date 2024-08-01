// background.js
chrome.runtime.onInstalled.addListener(() => {
  chrome.storage.local.set({ sessions: {} });
});

function switchSession(sessionId) {
  chrome.storage.local.get('sessions', (data) => {
    const sessions = data.sessions || {};
    if (sessions[sessionId]) {
      const { cookies, localStorageData } = sessions[sessionId];

      // Clear current cookies
      chrome.cookies.getAll({}, (allCookies) => {
        allCookies.forEach((cookie) => {
          chrome.cookies.remove({ url: `https://${cookie.domain}${cookie.path}`, name: cookie.name });
        });
      });

      // Clear chrome.storage.local
      chrome.storage.local.clear();

      // Set session cookies
      cookies.forEach((cookie) => {
        chrome.cookies.set(cookie);
      });

      // Set chrome.storage.local data
      chrome.storage.local.set(localStorageData);
    }
  });
}

function saveCurrentSession(sessionId) {
  chrome.cookies.getAll({}, (cookies) => {
    // Retrieve all items from chrome.storage.local
    chrome.storage.local.get(null, (items) => {
      const localStorageData = items; // Use the items directly
      chrome.storage.local.get('sessions', (data) => {
        const sessions = data.sessions || {};
        sessions[sessionId] = { cookies, localStorageData };
        chrome.storage.local.set({ sessions });
      });
    });
  });
}

function startNewSession(sessionId) {
  // Clear current cookies
  chrome.cookies.getAll({}, (allCookies) => {
    allCookies.forEach((cookie) => {
      chrome.cookies.remove({ url: `https://${cookie.domain}${cookie.path}`, name: cookie.name });
    });
  });

  // Clear chrome.storage.local
  chrome.storage.local.clear();

  // Start with a fresh storage by creating an empty entry
  chrome.storage.local.set({sessions: { [sessionId]: { cookies: [], localStorageData: {} } }}, () => {
    saveCurrentSession(sessionId); // Save the empty session
  });
}

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'switchSession') {
    switchSession(request.sessionId);
  } else if (request.action === 'saveCurrentSession') {
    saveCurrentSession(request.sessionId);
  } else if (request.action === 'startNewSession') {
    startNewSession(request.sessionId);
  }
  sendResponse({ status: 'done' });
});
