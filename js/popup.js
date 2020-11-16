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

function options() {
    if (chrome.runtime.openOptionsPage) {
        chrome.runtime.openOptionsPage();
    } else {
        window.open(chrome.runtime.getURL('options.html'));
    }
}

chrome.tabs.query({active: true, lastFocusedWindow: true}, tabs => {
  let url = tabs[0].url;
  var button = $("#blacklistButton")
  var opButton = $("#optionsButton")

  if (chrome.extension.getBackgroundPage().check_blocked(url) === 'pass') {
    button.disabled = false;
    button.click(siteBlock);
    button.text("block site");
  } else if (chrome.extension.getBackgroundPage().check_blocked(url) === 'blockedSite'){
    button.disabled = false;
    button.click(sitePass);
    var disp_url = chrome.extension.getBackgroundPage().strip_url(get_blocked_url(url))
    button.text("Remove " + disp_url + " from the blocked list");
  } else {
    button.click(options);
    button.text("hey!");
  }
  opButton.click(options);
});

