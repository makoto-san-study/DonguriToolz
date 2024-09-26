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
  Promise.all([getOption('arenalog_filter_self'), getOption('root_donguri'), ])
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
      setOption('arenalog_filter_self', checked.toString());
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

    const atkdef = [0, 0, 0];
    logs.forEach(log => {
      log = log.split(' vs. ');
      if (names.includes(log.at(0))) {
        atkdef[0]++;
      }
      if (names.includes(log.at(-1))) {
        atkdef[1]++;
      }
    });
    if (atkdef[0] + atkdef[1] != 0) {
      atkdef[2] = atkdef[1] * 100 / (atkdef[0] + atkdef[1]);
    }
    const atk = document.createElement('td');
    const def = document.createElement('td');
    const rate = document.createElement('td');
    atk.append(`挑戦${atkdef[0]}回`, document.createElement('br'), '≒挑戦失敗＋防衛失敗');
    def.append(`防衛${atkdef[1]}回`, document.createElement('br'), '≒挑戦成功＋防衛成功');
    rate.textContent = `勝率${atkdef[2].toFixed(2)}%`;
    document.querySelector('table').previousElementSibling
    .appendChild(document.createElement('table'))
    .appendChild(document.createElement('tr'))
    .append(atk, def, rate);

    if (checked) onChangeFilter(true);
  });
}}).catch(err => {});





