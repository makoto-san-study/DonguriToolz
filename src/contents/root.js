'use strict;'

const browser_or_chrome = (this.browser || chrome);

function getOption(key) {
  return browser_or_chrome.runtime.sendMessage({getOption: {key: key}});
}

getOption('enabled_root_auto_access').then(enabled => { if(enabled == 'true') {
  const interval_id = setInterval(()=>{
    fetch('https://donguri.5ch.net/').catch(err => {});
  }, 30 * 60 * 1000);
}}).catch(err => {});





