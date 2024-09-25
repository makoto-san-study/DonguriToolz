'use strict;'

const browser_or_chrome = (this.browser || chrome);

function getOption(key) {
  return browser_or_chrome.runtime.sendMessage({getOption: {key: key}});
}

getOption('enabled_itemwatch_filter_limited').then(enabled => { if(enabled == 'true') {
  const rows = Array.from(document.querySelector('body > table > tbody').rows);
  const normal = COMMONS_WEAPON_NAME.concat(COMMONS_ARMOR_NAME);
  rows.forEach(row => {
    if(!normal.includes(row.querySelector('span').textContent)){
      row.style.background = 'yellow';
      row.firstChild.append('★');
    }
  });
}}).catch(err => {});

getOption('enabled_itemwatch_filter_self').then(enabled => { if(enabled == 'true') {
  const rows = Array.from(document.querySelector('body > table > tbody').rows);
  function findName(row, names) {
    const name = row.children[1].textContent;
    return names.includes(name);
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





