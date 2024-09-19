'use strict;'

const browser_or_chrome = (this.browser || chrome);

function getOption(key) {
  return browser_or_chrome.runtime.sendMessage({getOption: {key: key}});
}

getOption('enabled_arena_sort').then(enabled => { if(enabled == 'true') {
  const f = row => row.querySelector('small').textContent;
  const tbody = document.querySelector("tbody");
  const rows = Array.from(tbody.rows);
  // TODO: 逆順にしたいときは*-1でもしとく
  rows.sort((a, b) => f(a).localeCompare(f(b)));
  rows.forEach(row => tbody.appendChild(row));
}}).catch(e => {});

getOption('enabled_arena_result').then(enabled => { if(enabled == 'true') {
  const iframe = document.createElement('iframe');
  const space = document.createElement('canvas');
  
  // TODO: iframeのstyleを変更したい場合はここを変えてしまう
  iframe.setAttribute('style', 'position: fixed; top: 70vh; left: 0; width: 100vw; height: 30vh; background-color: #fff;');
  space.setAttribute('style', 'display: hidden; width: 1px; height: 30vh;');
  iframe.setAttribute('name', 'result');
  iframe.addEventListener('load', event => {
    // TODO: <meta name="color-scheme" content="light dark">を削除する
    iframe.contentWindow.document.querySelector('head > meta[name="color-scheme"]')?.remove();
    // TODO: 最終行が見えるようスクロールしてしまう
    iframe.contentWindow.scroll(0, 30000);
  });
  document.body.appendChild(space);
  document.body.appendChild(iframe);

  document.querySelectorAll('form[action="https://donguri.5ch.net/challenge"]').forEach(form => {
    form.target = 'result';
    form.addEventListener('submit', event=>{});
  });
}}).catch(e => {});


