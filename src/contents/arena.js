'use strict;'

const browser_or_chrome = (this.browser || chrome);

function getOption(key) {
  return browser_or_chrome.runtime.sendMessage({getOption: {key: key}});
}

getOption('enabled_arena_sort').then(enabled => { if(enabled == 'true') {
  const f = row => row.querySelector('small').textContent;
  const tbody = document.querySelector("tbody");
  const rows = Array.from(tbody.rows);
  // TODO: 逆順にしたいときは*-1でもしとく
  rows.sort((a, b) => f(a).localeCompare(f(b)));
  rows.forEach(row => tbody.appendChild(row));
}}).catch(e => {});

