'use strict;'

const browser_or_chrome = (this.browser || chrome);

function getOption(key) {
  return browser_or_chrome.runtime.sendMessage({getOption: {key: key}});
}
function setOption(key, value) {
  return browser_or_chrome.runtime.sendMessage({setOption: {key: key, value: value}});
}

getOption('enabled_root_auto_access').then(enabled => { if(enabled == 'true') {
  const logTag = document.createElement('textarea');
  logTag.setAttribute('readonly', '');
  logTag.style.resize = 'none';
  logTag.style.width = '100%';
  logTag.style.height = '400px';
  logTag.style.overflow = 'scroll';
  logTag.style.whiteSpace = 'pre';
  logTag.append(`[日時] どんぐり, 木材, 鉄, 鉄のキー\n`);
  const div = document.createElement('div');
  const label = document.createElement('label');
  label.textContent = '自動アクセスログ';
  document.querySelector('div.container').appendChild(div).append(label, logTag);
  function logStatus(doc) {
    const status = Array.from(doc.querySelectorAll('div.stat-block:nth-child(1) > div'))?.slice(0,4)?.map(tag => tag?.textContent?.split(': ')?.at(-1));
    const date = new Date().toLocaleString('sv-SE');
    logTag.append(`[${date}] ${status.join(', ')}\n`);
  };
  logStatus(document);
  const interval_id = setInterval(() => {
    fetch('https://donguri.5ch.net/').then(res => res.text()).then(text => {
      const doc = new DOMParser().parseFromString(text, 'text/html');
      logStatus(doc);
    }).catch(err => {});
  }, 30 * 60 * 1000);
}}).catch(err => {});

getOption('enabled_log_filter_self').then(enabled => { if(enabled == 'true') {
  const tag = document.querySelectorAll('div.stats > div > div');  
  const name = tag[0].textContent;
  const id = tag[1].textContent.split('[ID: ')[1].slice(0, -1);
  getOption('root_donguri').then(donguri => {
    donguri = JSON.parse(donguri || '{}');
    my = donguri[id] || (donguri[id] = {});
    const names = my['names'] || (my['names'] = []);
    if (!names.includes(name)) {
      names.push(name);
      setOption('root_donguri', JSON.stringify(donguri));
    }
  });
}}).catch(err => {});




