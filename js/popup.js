function get_blocked_url(url) {
  url = url.substring(url.indexOf("?"));
  return url.substring(url.indexOf("=") + 1);
}

function sitePass() {
  chrome.tabs.query({active: true, lastFocusedWindow: true}, tabs => {
    let url = get_blocked_url(tabs[0].url);
    chrome.extension.getBackgroundPage().rm_blocked(url);
    chrome.tabs.update({url: url});
    window.close();
  });
}

function siteBlock() {
  chrome.tabs.query({active: true, lastFocusedWindow: true}, tabs => {
    let url = tabs[0].url;
    chrome.extension.getBackgroundPage().add_blocked(url);
    chrome.tabs.update({url: url});
    window.close();
  });
}

chrome.tabs.query({active: true, lastFocusedWindow: true}, tabs => {
  let url = tabs[0].url;
  var button = $("#blacklistButton")

  if (!chrome.extension.getBackgroundPage().check_blocked(url)) {
    button.click(siteBlock);
    button.text("block site");
  } else {
    button.click(sitePass);
    button.text("Remove " + get_blocked_url(url) + " from the blocked list");
  }
});

