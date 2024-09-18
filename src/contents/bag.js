'use strict;'

const browser_or_chrome = (this.browser || chrome);

function getOption(key) {
  return browser_or_chrome.runtime.sendMessage({getOption: {key: key}});
}

getOption('enabled_bag_chest').then(enabled => { if(enabled == 'true') {
  document.querySelector('body > header > h3')
  .innerHTML = '<form style="margin:0 auto; max-width:100%;" action="https://donguri.5ch.net/open" method="post"><input type="hidden" name="chestsize" value="B70"><div style="margin-bottom:0px; text-align:center;"><input type="submit" value="大型サイズの宝箱を開ける"></div></form>';
}}).catch(e => {});

getOption('enabled_bag_count').then(enabled => { if(enabled == 'true') {
  const weapons = document.querySelector('#weaponTable > tbody').rows.length;
  const armors = document.querySelector('#armorTable > tbody').rows.length;
  document.querySelector('h5 > br')
  .insertAdjacentElement('afterend', document.createElement('br'))
  .insertAdjacentText('beforebegin', `（${weapons + armors}スロット使用）`);
}}).catch(e => {});

