'use strict;'

const browser_or_chrome = (this.browser || chrome);

function getOption(key) {
  return browser_or_chrome.runtime.sendMessage({getOption: {key: key}});
}
function setOption(key, value) {
  return browser_or_chrome.runtime.sendMessage({setOption: {key: key, value: value}});
}

getOption('enabled_log_filter_self').then(enabled => { if(enabled == 'true') {
  const rows = Array.from(document.querySelector('body > table > tbody').rows);
  const logs = rows.map(row => row.children[1].textContent);
  const filter = {self: Array(rows.length).fill(true)};
  Promise.all([getOption('fightlog_filter_self'), getOption('root_donguri'), ])
  .then(values => {
    const checked = values[0] == 'true';
    const names = Object.values(JSON.parse(values[1] || '{}')).flatMap(id => id['names'] || []);
    if (names.length == 0) return;
    function findName(index) {
      return names.some(name => logs[index].includes(name));
    }
    function changeDisplay(filter_name, index, display) {
      if (filter[filter_name][index] == display) return;
      filter[filter_name][index] = display;
      rows[index].style.display = Object.values(filter).every(arr => arr[index]) ? null : 'none';
    }
    function onChangeFilter(checked) {
      setOption('fightlog_filter_self', checked.toString());
      if (checked) {
        rows.forEach((_, index) => {
          changeDisplay('self', index, findName(index));
        });
      } else {
        rows.forEach((_, index) => {
          changeDisplay('self', index, true);
        });
      }
    }
    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.checked = checked;
    checkbox.onchange = event => onChangeFilter(event.target.checked);
    const label = document.createElement('label');
    label.style.display = 'inline';
    label.append('自身のログのみ表示', checkbox);
    document.querySelector('body > header > h6').append('（', label, '）');

    if (checked) onChangeFilter(true);
  });
}}).catch(err => {});





