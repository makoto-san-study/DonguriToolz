'use strict;'

const browser_or_chrome = (this.browser || chrome);

function getOption(key) {
  return browser_or_chrome.runtime.sendMessage({getOption: {key: key}});
}

getOption('enabled_log_filter_self').then(enabled => { if(enabled == 'true') {
  const rows = Array.from(document.querySelector('body > table > tbody').rows);
  function findName(row, names) {
    const text = row.children[1].textContent;
    for (let name of names) {
      if (text.includes(name)) return true;
    }
    return false;
  }
  getOption('root_donguri').then(donguri => {
    donguri = JSON.parse(donguri || '{}');
    const names = Object.values(donguri).flatMap(id => id['names'] || []);
    if (names.length == 0) return;
    rows.forEach(row => {
      if (!findName(row, names)) row.style.display = 'none';
    });
  });
}}).catch(err => {});





