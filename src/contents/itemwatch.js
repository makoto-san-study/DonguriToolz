'use strict;'

const browser_or_chrome = (this.browser || chrome);

function getOption(key) {
  return browser_or_chrome.runtime.sendMessage({getOption: {key: key}});
}
function setOption(key, value) {
  return browser_or_chrome.runtime.sendMessage({setOption: {key: key, value: value}});
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
  const normal = COMMONS_WEAPON_NAME.concat(COMMONS_ARMOR_NAME);
  const rows = Array.from(document.querySelector('body > table > tbody').rows);
  const logs_name = rows.map(row => row.children[1].textContent);
  const logs_item = rows.map(row => row.querySelector('span').textContent);
  const filter = {self: Array(rows.length).fill(true), item: Array(rows.length).fill(true)};

  Promise.all([getOption('itemwatch_filter_self'), getOption('itemwatch_filter_item'), getOption('root_donguri')])
  .then(values => {
    values[0] = values[0] == 'true';
    values[1] = values[1] == 'true';
    const names = Object.values(JSON.parse(values[2] || '{}')).flatMap(id => id['names'] || []);
    function findName(index) {
      return names.some(name => logs_name[index].includes(name));
    }
    function changeDisplay(filter_name, index, display) {
      if (filter[filter_name][index] == display) return;
      filter[filter_name][index] = display;
      rows[index].style.display = Object.values(filter).every(arr => arr[index]) ? null : 'none';
    }
    function onChangeFilterSelf(checked) {
      setOption('itemwatch_filter_self', checked.toString());
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
    function onChangeFilterItem(checked) {
      setOption('itemwatch_filter_item', checked.toString());
      if (checked) {
        rows.forEach((_, index) => {
          changeDisplay('item', index, !normal.includes(logs_item[index]));
        });
      } else {
        rows.forEach((_, index) => {
          changeDisplay('item', index, true);
        });
      }
    }
  
    const checkboxSelf = document.createElement('input');
    checkboxSelf.type = 'checkbox';
    checkboxSelf.checked = values[0];
    checkboxSelf.onchange = event => onChangeFilterSelf(event.target.checked);
    const labelSelf = document.createElement('label');
    labelSelf.style.display = 'inline';
    labelSelf.append('自身のログのみ', checkboxSelf);
    const checkboxItem = document.createElement('input');
    checkboxItem.type = 'checkbox';
    checkboxItem.checked = values[1];
    checkboxItem.onchange = event => onChangeFilterItem(event.target.checked);
    const labelItem = document.createElement('label');
    labelItem.style.display = 'inline';
    labelItem.append('限定アイテムのみ', checkboxItem);
    document.querySelector('body > header > h6').append('（', labelSelf, '、', labelItem, '）');

    if(values[0]) onChangeFilterSelf(true);
    if(values[1]) onChangeFilterItem(true);
  });
}}).catch(err => {});





