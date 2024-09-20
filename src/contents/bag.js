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
    button.setAttribute('value', `大型サイズの宝箱を${chest}回開けてみる（${chest*40}スロット分）`);
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


