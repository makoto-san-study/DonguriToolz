'use strict;'

const browser_or_chrome = (this.browser || chrome);

function getOption(key) {
  return browser_or_chrome.runtime.sendMessage({getOption: {key: key}});
}
function setOption(key, value) {
  return browser_or_chrome.runtime.sendMessage({setOption: {key: key, value: value}});
}

getOption('enabled_root_auto_access').then(enabled => { if(enabled == 'true') {
  const interval_id = setInterval(()=>{
    fetch('https://donguri.5ch.net/').catch(err => {});
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




