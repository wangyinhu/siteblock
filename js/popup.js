/**
 * get blocked url from url="chrome-extension://hbfjieomldekdngendoebbebofojgfap/blockedSite.html?blocked=www.example.com"
 * @param url
 * @returns {string}
 */
function get_blocked_url(url) {
  url = url.substring(url.indexOf("?"));
  return url.substring(url.indexOf("=") + 1);
}

function sitePass() {
  chrome.tabs.query({active: true, lastFocusedWindow: true}, tabs => {
    let url = get_blocked_url(tabs[0].url);
    if (!url.startsWith("chrome-extension://")) {
      chrome.extension.getBackgroundPage().rm_blocked(url);
      chrome.tabs.update({url: url});   // goto passed site
      window.close();   //close popup
    }
  });
}

function siteBlock() {
  chrome.tabs.query({active: true, lastFocusedWindow: true}, tabs => {
    let url = tabs[0].url;
    if (!url.startsWith("chrome-extension://")) {
      chrome.extension.getBackgroundPage().add_blocked(url);
      chrome.tabs.update({url: url});     //reload to block page
      window.close();     //close popup
    }
  });
}

function siteHide() {
  chrome.tabs.query({active: true, lastFocusedWindow: true}, tabs => {
    let url = tabs[0].url;
    if (!url.startsWith("chrome-extension://")) {
      chrome.extension.getBackgroundPage().add_hidden(url);
      chrome.tabs.update({url: url});     //reload to block page
      window.close();     //close popup
    }
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
  var hideButton = $("#hideButton")
  var opButton = $("#optionsButton")

  if (chrome.extension.getBackgroundPage().check_blocked(url) === 'pass') {
    button.click(siteBlock);
    button.text("block site");
    hideButton.click(siteHide);
    hideButton.text("inco")
  } else{
    hideButton.hide();
    if (chrome.extension.getBackgroundPage().check_blocked(url) === 'blockedSite'){
      button.click(sitePass);
      var disp_url = chrome.extension.getBackgroundPage().strip_url(get_blocked_url(url))
      button.text("Remove " + disp_url + " from the blocked list");
    } else {
      button.hide();
      hideButton.hide();
    }
  }
  opButton.click(options);
});

