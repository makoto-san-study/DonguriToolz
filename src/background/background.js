'use strict;'

const browser_or_chrome = (this.browser || chrome);

browser_or_chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message['setOption']) {
    const key = message['setOption'].key;
    const value = message['setOption'].value;
    browser_or_chrome.storage.local.set({[key]:value})
    .catch(e => {});
    return false;
  }
  if (message['getOption']) {
    const key = message['getOption'].key;
    browser_or_chrome.storage.local.get(key).then(result => sendResponse(result[key] || ''))
    .catch(e => sendResponse(''));
    return true;
  }
  return false;
});

