'use strict;'

const browser_or_chrome = (this.browser || chrome);

function getOption(key) {
  return browser_or_chrome.runtime.sendMessage({getOption: {key: key}});
}
function setOption(key, value) {
  return browser_or_chrome.runtime.sendMessage({setOption: {key: key, value: value}});
}

Promise.all(Array.from(document.querySelectorAll('#section_enabled input[type="checkbox"]'))
.map(checkbox => {
  checkbox.onchange = event => {
    setOption(event.target.id, event.target.checked.toString())
    .catch(e => {});
  }
  return getOption(checkbox.id).then(checked => checkbox.checked = checked == 'true')
  .catch(e => {});
})).then(() => {
  document.querySelector('#section_enabled').style.visibility = 'visible';
});
