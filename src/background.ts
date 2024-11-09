/// <reference types="chrome"/>

// Helper function to check if a tab is ready for messaging
async function isTabReady(tabId: number): Promise<boolean> {
  try {
    await chrome.tabs.sendMessage(tabId, { type: 'PING' });
    return true;
  } catch {
    return false;
  }
}

// Helper function to wait for tab to be ready
async function waitForTab(tabId: number, maxAttempts = 10): Promise<boolean> {
  for (let i = 0; i < maxAttempts; i++) {
    if (await isTabReady(tabId)) {
      return true;
    }
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  return false;
}

chrome.webNavigation.onCompleted.addListener(
  async (details: chrome.webNavigation.WebNavigationFramedCallbackDetails) => {
    if (details.url.toLowerCase().endsWith('.pdf')) {
      // Wait for content script to be ready
      const isReady = await waitForTab(details.tabId);
      
      if (isReady) {
        chrome.tabs.sendMessage(details.tabId, {
          type: 'PDF_LOADED',
          url: details.url
        });
      } else {
        console.error('Content script not ready after maximum attempts');
      }
    }
  },
  { url: [{ pathSuffix: '.pdf' }] }
); 