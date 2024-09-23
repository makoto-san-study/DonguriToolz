'use strict;'

const browser_or_chrome = (this.browser || chrome);

function getOption(key) {
  return browser_or_chrome.runtime.sendMessage({getOption: {key: key}});
}

getOption('enabled_modify_maximum_value').then(enabled => { if(enabled == 'true') {
  const parts = location.href.split('/')[4];
  const detail = Array.from(document.querySelectorAll('div.upgrade-option:nth-child(2) > ul > li'));
  const parseStatus = tag => parseInt(/\d+/.exec(tag.textContent));
  const status = detail.slice(4, 8).map(tag => parseStatus(tag));
  const modify = detail.slice(-2).map(tag => 100 - parseStatus(tag));
  const up   = (v, spd) => v <= 10 ? 1 + spd : Math.floor((v + 19 + spd) * 0.05) + spd;
  const down = (v, spd) => v <= 10 ? 1 + spd : Math.floor((v + 19 - spd) * 0.05) + spd;
  const spd = i => i == 2 && parts == 'weapon' ? 5 : 0;
  const able = status.map((v, i) => {
    const s = spd(i);
    let demod = 0;
    while(v > 1){
      v -= down(v, s);
      demod++;
    }
    return demod;
  });
  const maximum = status.map((v, i) => {
    if (i == 0) return;
    const s = spd(i);
    const demod = able.reduce((t, v) => t+v, -able[i]);
    const mod = modify[0] + (demod < modify[1] ? demod : modify[1]);
    for (let m = 0; m < mod; m++) {
      v += up(v, s);
    }
    return [v, mod];
  });
  detail.slice(4, 8).forEach((tag, i) => {
    if (i == 0) return;
    tag.append(`(${maximum[i][0]}/+${maximum[i][1]})`);
  });
}}).catch(err => {});





