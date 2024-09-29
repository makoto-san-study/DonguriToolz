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
  const meta = document.querySelector('meta[name="viewport"]');
  meta.content = `width=device-width, initial-scale=1, minimum-scale=1`;
  
  const iframe = document.createElement('iframe');
  const spacer = document.createElement('div');
  spacer.style.height = '20vh';
  document.body.prepend(spacer);
  
  // TODO: iframeのstyleを変更したい場合はここを変えてしまう
  iframe.setAttribute('style', 'position: fixed; top: 0; left: 0; width: 100%; height: 20vh; z-index: 10; background-color: #fff;');
  iframe.setAttribute('name', 'result');
  iframe.addEventListener('load', event => {
    // TODO: <meta name="color-scheme" content="light dark">を削除する
    iframe.contentWindow.document.querySelector('head > meta[name="color-scheme"]')?.remove();
    // TODO: 最終行が見えるようスクロールしてしまう
    iframe.contentWindow.scroll(0, 30000);
  });
  document.body.prepend(iframe);

  document.querySelectorAll('form[action="https://donguri.5ch.net/challenge"]').forEach(form => {
    form.target = 'result';
  });
}}).catch(e => {});


