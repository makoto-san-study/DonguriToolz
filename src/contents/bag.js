'use strict;'

const browser_or_chrome = (this.browser || chrome);

function getOption(key) {
  return browser_or_chrome.runtime.sendMessage({getOption: {key: key}});
}
function setOption(key, value) {
  return browser_or_chrome.runtime.sendMessage({setOption: {key: key, value: value}});
}

getOption('enabled_bag_chest').then(enabled => { if(enabled == 'true') {
  const slots = parseInt(document.querySelector('h5').textContent.match(/\d+/)[0]);
  const weapons = document.querySelector('#weaponTable > tbody').rows.length;
  const armors = document.querySelector('#armorTable > tbody').rows.length;
  const used = weapons + armors;
  const chest = Math.floor((slots - used + 39) / 40);
  if (chest > 0) {
    const button = document.createElement('input');
    button.setAttribute('type', 'button');
    button.setAttribute('value', `大箱${chest}回（${chest*40}スロット分）`);
    button.onclick = () => {
      let p = Promise.resolve();
      for (let n=0;n<chest;n++) {
        p = p.then(()=>new Promise((resolve, reject) => {
          fetch('https://donguri.5ch.net/open',{method:'POST',headers:{'Content-Type':'application/x-www-form-urlencoded'},body:'chestsize=B70'})
          .then(response => {
            if (response.ok && response.redirected) {
              resolve();
            } else {
              reject();
            }
          }).catch(err => {
            reject();
          });
        }));
      }
      p.catch(err=>{
      }).then(()=>{
        location.reload();
      });
    };
    document.querySelector('body > header > h3')
    .replaceChildren(button);
  }
}}).catch(e => {});

getOption('enabled_bag_count').then(enabled => { if(enabled == 'true') {
  const slots = parseInt(document.querySelector('h5').textContent.match(/\d+/)[0]);
  const weapons = document.querySelector('#weaponTable > tbody').rows.length;
  const armors = document.querySelector('#armorTable > tbody').rows.length;
  const used = weapons + armors;
  document.querySelector('h5 > br')
  .insertAdjacentElement('afterend', document.createElement('br'))
  .insertAdjacentText('beforebegin', `（${used}スロット使用、${slots - used}スロット空き）`);
}}).catch(e => {});

getOption('enabled_bag_history').then(enabled => { if(enabled == 'true') {
  HISTORY_DISPLAY_SIZE = 7;
  HISTORY_BUFFER_SIZE = 100;

  const itembagTag = Array.from(document.querySelectorAll('h3')).filter(t=>t.textContent=='アイテムバッグ:')[0];
  if(!itembagTag) return;

  itembagTag.parentElement.insertBefore(document.createElement('h3'), itembagTag).append('装備の履歴: ');

  // アイテム情報をすべて取得
  const tableTags = {};
  const equipTableTags = Array.from(document.querySelectorAll('table:not([id])'));
  if (equipTableTags[0]?.textContent?.slice(0, 2) == '防具') {
    tableTags['weaponEquipTable'] = undefined;
    tableTags['armorEquipTable'] = equipTableTags[0];
  } else {
    tableTags['weaponEquipTable'] = equipTableTags[0];
    tableTags['armorEquipTable'] = equipTableTags[1];
  }
  tableTags['weaponTable'] = document.querySelector('#weaponTable');
  tableTags['armorTable'] = document.querySelector('#armorTable');

  // 履歴の取得・更新・保存・表示
  getOption('bag_equip_history').then(history => {
    history = JSON.parse(history || '{}');
    const getItemId = tag => tag?.querySelector('a')?.href?.split('/')?.pop();

    const PARTS = ['weapon', 'armor'];
    PARTS.forEach(parts =>{
      if (!history[parts]) history[parts] = [];
      const equip = getItemId(tableTags[parts+'EquipTable']);
      if (equip) {
        history[parts] = [{id:equip}].concat(history[parts].filter(v => v.id != equip)).slice(0, HISTORY_BUFFER_SIZE);
      }

      let rows = [];
      for (const row of tableTags[parts+'Table'].lastChild.rows) {
        history[parts].findIndex((e,i) => {
          const find = e.id == getItemId(row);
          if (find) rows[i] = row;
          return find;
        });
      }
      rows = rows.filter(v => v).slice(0, HISTORY_DISPLAY_SIZE);
      const tableTag = document.createElement('table');
      const thead = tableTags[parts+'Table'].firstChild.cloneNode(true);
      const tbody = document.createElement('tbody');
      thead.querySelectorAll('[onclick]').forEach(e => e.removeAttribute('onclick'));
      tableTag.appendChild(thead);
      tableTag.appendChild(tbody);
      rows.forEach(row => {tbody.appendChild(row.cloneNode(true));});
      itembagTag.parentElement.insertBefore(tableTag, itembagTag);
    });
    setOption('bag_equip_history', JSON.stringify(history))
    .catch(e => {});
  });
}}).catch(e => {});

getOption('enabled_bag_recycle').then(enabled => { if(enabled == 'true') {
  function onclick(rarityreg) {
    return () => {
      let p = Promise.resolve();
      ['#weaponTable', '#armorTable'].forEach(parts => {
        Array.from(document.querySelector(parts + '> tbody').rows).forEach(row => {
          if (row.lastChild.textContent != '[X]' && rarityreg.test(row.firstChild.textContent)) {
            p = p.then(()=>new Promise((resolve, reject) => {
              fetch(row.lastChild.firstChild.href)
              .then(response => {
                if (response.ok) {
                  resolve();
                } else {
                  reject();
                }
              }).catch(err => {
                reject();
              });
            }));
          }
        });
      });
      p.catch(err=>{
      }).then(()=>{
        location.reload();
      });
    };
  }
  const buttons = [{rarity:'N', reg:/\[(?:N)\]/}, {rarity:'NとR', reg:/\[(?:N|R)\]/}, {rarity:'SR以下', reg:/\[(?:N|R|SR)\]/}]
  .map(info => {
    const button = document.createElement('input');
    button.setAttribute('type', 'button');
    button.setAttribute('value', `${info.rarity}分解`);
    button.setAttribute('style', 'margin: 0 0.5em; width: auto;');
    button.onclick = onclick(info.reg);
    return button;
  });
  document.querySelector('header').appendChild(document.createElement('div')).append(...buttons);
}}).catch(e => {});

getOption('enabled_bag_lock').then(enabled => { if(enabled == 'true') {
  function getRows(doc) {
    const tables = Array.from(doc.querySelectorAll('table[id] > tbody'));
    return [].concat(...tables.map(table => Array.from(table.rows)));
  }
  const getLockTag = row => row.children[2].lastChild;
  const getItemId = tag => tag?.querySelector('a')?.href?.split('/')?.pop();
  const getLockStatus = tag => tag?.textContent == '[解錠]' ? 2 : 1;

  function onclick(url) {
    return event => {
      const id = getItemId(event.target.parentElement);
      const lockTag = event.target.lastChild;
      const lockStatus = getLockStatus(lockTag);
      changeLockTag(lockTag);
      fetch(url).then(res => res.text()).then(text => {
        for (row of getRows(new DOMParser().parseFromString(text, 'text/html'))) {
          if (id == getItemId(row)) {
            const anchorTag = getLockTag(row);
            changeLockTag(lockTag, anchorTag, lockStatus);
            return;
          }
        }
        throw 0;
      }).catch(err => {
        changeLockTag(lockTag, null, -1);
      });
    };
  }
  
  function changeLockTag(lockTag, anchorTag = null, lockStatus = 0) {
    if (lockStatus == 0 && !anchorTag) {
      lockTag.textContent = '[待]';
      lockTag.setAttribute('style', 'color: black');
    } else {
      const newLockStatus = getLockStatus(anchorTag);
      if (lockStatus == -1 || lockStatus == newLockStatus) {
        lockTag.textContent = '[失敗]';
        lockTag.setAttribute('style', 'color: blue');
      } else {
        if (newLockStatus == 1) {
          lockTag.textContent = '[錠]';
          lockTag.setAttribute('style', 'color: #ffb300');
        } else {
          lockTag.textContent = '[解錠]';
          lockTag.setAttribute('style', 'color: red');
        }
        lockTag.parentElement.onclick = onclick(anchorTag.href);
      }
    }
  }
  getRows(document).forEach(row => {
    const newLockTag = document.createElement('span');
    const anchorTag = getLockTag(row);
    anchorTag.parentElement.replaceChildren(newLockTag);
    changeLockTag(newLockTag, anchorTag);
  });
}}).catch(e => {});

getOption('enabled_bag_sort').then(enabled => { if(enabled == 'true') {
  const onclick = (order, direction, colIndex, saveOrder) => {
    return event => {
      const table = event.target.parentElement.parentElement.parentElement;
      const tbody = table.lastChild;
      const rowsArray = Array.from(tbody.rows);
      sort(rowsArray, colIndex, direction[colIndex]);
      direction[colIndex] = !direction[colIndex];
      rowsArray.forEach(row => tbody.appendChild(row));
      if (colIndex == 1) {
        order.length = 0;
        if (!direction[colIndex]) {
          order.push(colIndex);
          order.push(colIndex);
        }
      } else {
        order.push(colIndex);
      }
      saveOrder();
    };
  };

  function sort(arr, colIndex, direction) {
    function to8Number(value) {
      // 12桁に拡張
      return value.replace(/\d+/g, (m) => ("000000000000" + m).slice(-12));
    }

    function extractString(row) {
      var value = row.getElementsByTagName("TD")[colIndex].textContent;
      if (colIndex == 0) {
        // 名前（レアリティで昇順降順、名前で昇順）
        [v2, ...v3] = value.replace(/(.*)\[([A-Z]{1,3})\](.*)/s, "$2,$1$3").split(",");
        return ["", v2, v3.join(",")];
      } else if (colIndex == 1) {
        // 装備（アイテムIDで昇順降順）
        value = row.getElementsByTagName("TD")[colIndex].lastChild.href.split('/').pop();
      } else if (colIndex == 3) {
        // ATK,DEF（最大値,最小値で昇順降順）
        value = value.replace(/(\d+)(?:.*?)(\d+)/, "$2,$1");
      } else if (colIndex == 6) {
        // ELEM（[火氷雷風地水光闇なし]順、属性値で昇順降順）
        [v2, ...v1] = value.replace(/(\D*)(\d*)(\D*)/, "$2,$1$3").split(",");
        return [String("火氷雷風地水光闇なし".search(v1.join(","))), to8Number(v2), ""];
      }
      return ["", to8Number(value), ""];
    }
    order = direction ? -1 : 1;
    arr.sort((a, b) => {
      a = extractString(a);
      b = extractString(b);
      return a[0].localeCompare(b[0]) || a[1].localeCompare(b[1]) * order || a[2].localeCompare(b[2]);
    });
  }

  getOption('bag_sort_order').then(order => {
    order = JSON.parse(order || '{}');
    const direction = {};
    const saveOrder = () => {
      setOption('bag_sort_order', JSON.stringify(order));
    };
    ['weaponTable', 'armorTable'].forEach(parts => {
      order[parts] = order[parts] || [];
      direction[parts] = [];
      const tbody = document.querySelector('#' + parts + ' > tbody');
      const rowsArray = Array.from(tbody.rows);
      order[parts].forEach(colIndex => {
        sort(rowsArray, colIndex, direction[parts][colIndex]);
        direction[parts][colIndex] = !direction[parts][colIndex];
      });
      rowsArray.forEach(row => tbody.appendChild(row));

      Array.from(document.querySelectorAll('#' + parts + ' > thead > tr > th')).forEach((th,index) => {
        if(index == 9) return;
        th.onclick = onclick(order[parts], direction[parts], index, saveOrder);
      });
    });
  });
}}).catch(e => {});




