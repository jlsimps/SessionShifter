// popup.js
document.addEventListener('DOMContentLoaded', () => {
    const sessionList = document.getElementById('session-list');
    const saveSessionButton = document.getElementById('save-session');
    const switchSessionButton = document.getElementById('switch-session');
  
    chrome.storage.local.get('sessions', (data) => {
      const sessions = data.sessions || {};
      sessionList.innerHTML = Object.keys(sessions).map((sessionId) => `<option value="${sessionId}">${sessionId}</option>`).join('');
    });
  
    saveSessionButton.addEventListener('click', () => {
      const sessionId = prompt('Enter a name for the session');
      if (sessionId) {
        chrome.runtime.sendMessage({ action: 'saveCurrentSession', sessionId }, (response) => {
          if (response.status === 'done') {
            location.reload();
          }
        });
      }
    });
  
    switchSessionButton.addEventListener('click', () => {
      const sessionId = sessionList.value;
      if (sessionId) {
        chrome.runtime.sendMessage({ action: 'switchSession', sessionId }, (response) => {
          if (response.status === 'done') {
            location.reload();
          }
        });
      }
    });
  });
  