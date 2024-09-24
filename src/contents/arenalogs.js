'use strict;'

const browser_or_chrome = (this.browser || chrome);

function getOption(key) {
  return browser_or_chrome.runtime.sendMessage({getOption: {key: key}});
}

getOption('enabled_log_filter_self').then(enabled => { if(enabled == 'true') {
  const rows = Array.from(document.querySelector('body > table > tbody').rows);
  function findName(row, names, atkdef) {
    const text = row.children[1].textContent.split(' vs. ');
    let result = false;
    for (let name of names) {
      if (text[0] == name) {
        atkdef[0]++;
        result = true;
      } else if (text.at(-1) == name) {
        atkdef[1]++;
        result = true;
      }
    }
    return result;
  }
  getOption('root_donguri').then(donguri => {
    donguri = JSON.parse(donguri || '{}');
    const names = Object.values(donguri).flatMap(id => id['names'] || []);
    if (names.length == 0) return;
    const atkdef = [0, 0];
    rows.forEach(row => {
      if (!findName(row, names, atkdef)) row.style.display = 'none';
    });
    const atk = document.createElement('td');
    const def = document.createElement('td');
    atk.textContent = `挑戦${atkdef[0]}回（推定：挑戦失敗＋防衛失敗）`;
    def.textContent = `防衛${atkdef[1]}回（推定：挑戦成功＋防衛成功）`;
    document.querySelector('table').previousElementSibling
    .appendChild(document.createElement('table'))
    .appendChild(document.createElement('tr'))
    .append(atk, def);
    });
}}).catch(err => {});





