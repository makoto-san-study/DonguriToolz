'use strict;'

const browser_or_chrome = (this.browser || chrome);

function getOption(key) {
  return browser_or_chrome.runtime.sendMessage({getOption: {key: key}});
}
function setOption(key, value) {
  return browser_or_chrome.runtime.sendMessage({setOption: {key: key, value: value}});
}
function isLogin(doc = document) {
  return doc.querySelector('body > h1').textContent == 'どんぐり基地';
}
function isGuard(doc = document) {
  return doc.querySelector('div.stats > div > div:nth-child(2)').textContent.startsWith('警備員');
}

getOption('enabled_root_auto_access').then(enabled => { if(enabled == 'true') {
  if (!isLogin()) return;
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
  if (!isLogin()) return;
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

getOption('enabled_root_lvup_disp').then(enabled => { if(enabled == 'true') {
  if (!isLogin()) return;
  function getDateString(level, e) {
    const f = lv => (lv / 0.196) ** 2;
    const time = Math.ceil(((f(level[0] + 1) - f(level[0])) * e) * (101 - level[1]) * 1000 / 101);
    return new Date(Date.now() + time).toLocaleString('sv-SE');
  }
  const guard = isGuard();
  Array.from(document.querySelectorAll('div.stat-block:nth-child(2) > div')).forEach((tag, index) => {
    if (index == 0) {
      const level = Array.from(tag.childNodes).map(node=>parseInt(/\d+/.exec(node.textContent)));
      const bar = tag.lastChild.lastChild;
      bar.style.textAlign = 'left';
      bar.style.whiteSpace = 'pre';
      bar.append(`（${getDateString(level, guard ? 10 : 0.5)}）`);
    } else if (index == 1) {
      //const level = Array.from(tag.childNodes).map(node=>parseInt(/\d+/.exec(node.textContent)));
      const bar = tag.lastChild.lastChild;
      bar.style.textAlign = 'left';
      bar.style.whiteSpace = 'pre';
    } else {
      const level = Array.from(tag.children).map(element=>parseInt(/\d+/.exec(element.textContent)));
      const bar = tag.lastChild.lastChild;
      bar.style.textAlign = 'left';
      bar.style.whiteSpace = 'pre';
      bar.append(`（${getDateString(level, guard ? 10: 1)}）`);
    }
  });
}}).catch(err => {});



