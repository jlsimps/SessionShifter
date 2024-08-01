// background.js
chrome.runtime.onInstalled.addListener(() => {
    chrome.storage.local.set({ sessions: {} });
  });
  
  function switchSession(sessionId) {
    chrome.storage.local.get('sessions', (data) => {
      const sessions = data.sessions || {};
      if (sessions[sessionId]) {
        const { cookies, localStorageData } = sessions[sessionId];
  
        // Clear current cookies and local storage
        chrome.cookies.getAll({}, (allCookies) => {
          allCookies.forEach((cookie) => {
            chrome.cookies.remove({ url: `https://${cookie.domain}${cookie.path}`, name: cookie.name });
          });
        });
  
        // Set session cookies
        cookies.forEach((cookie) => {
          chrome.cookies.set(cookie);
        });
  
        // Set local storage data
        Object.keys(localStorageData).forEach((key) => {
          localStorage.setItem(key, localStorageData[key]);
        });
      }
    });
  }
  
  function saveCurrentSession(sessionId) {
    chrome.cookies.getAll({}, (cookies) => {
      const localStorageData = { ...localStorage };
      chrome.storage.local.get('sessions', (data) => {
        const sessions = data.sessions || {};
        sessions[sessionId] = { cookies, localStorageData };
        chrome.storage.local.set({ sessions });
      });
    });
  }
  
  chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'switchSession') {
      switchSession(request.sessionId);
    } else if (request.action === 'saveCurrentSession') {
      saveCurrentSession(request.sessionId);
    }
    sendResponse({ status: 'done' });
  });
  