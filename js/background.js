blocked_urls = [];

function removeUrlAll(arr, url) {
  var i = 0;
  while (i < arr.length) {
    if (arr[i].startsWith(url)) {
      arr.splice(i, 1);
    } else {
      ++i;
    }
  }
  return arr;
}

function strip_url(url) {
  var domainstart = url.indexOf("/") + 2;
  var pathstart = url.substring(domainstart).indexOf("/");
  if (pathstart === -1){
    return url;
  } else{
    return url.substring(0, domainstart + pathstart + 1);
  }
}


function check_blocked(url){
  console.log('Checking if url is blocked, utl=:');
  console.log(url);
  console.log("url strip:");
  console.log(strip_url(url));
  if(url.startsWith("chrome-extension://") && url.includes("blockedSite.html")){
    return 'blockedSite';
  }

  if(url.startsWith("chrome-extension://") || url.startsWith("chrome://")){
    return 'chrome';
  }

  for(const i in blocked_urls){
    if(url.startsWith(blocked_urls[i])){
      return 'blocked';
    }
  }
  return 'pass';
}

function save_list() {
  chrome.storage.sync.get({
    sync: 'sync',
    server: "https://www.example.com/list/"
  }, function (items){
    if(items.sync === 'sync'){
      chrome.storage.sync.set({'blocked': blocked_urls}, function () {
        console.log("urls saved into sync.");
      })
    } else if (items.sync === 'local'){
      chrome.storage.local.set({'blocked': blocked_urls}, function () {
        console.log("urls saved into local.");
      })
    } else if (items.sync === 'server'){
      const url = items.server;
      const request = new XMLHttpRequest();
      request.setRequestHeader('Content-Type', 'application/json; charset=UTF-8');
      request.onreadystatechange = function() {
        if (this.readyState === 4 && this.status === 200) {
          var myArr = JSON.parse(this.responseText);
          if(myArr.code === 'done'){
            console.log("urls saved into server.");
          }
        }else{
          console.log("urls saving into server failed.");
        }
      };
      request.open("POST", url, true);
      request.send(JSON.stringify({'action': 'save', 'urls': blocked_urls}));
    } else {
      console.log("unknown 'sync' value.");
    }
  });
}

function load_list() {
  chrome.storage.sync.get({
    sync: 'sync',
    server: "https://example.com"
  }, function (items){
    if(items.sync === 'sync'){
      chrome.storage.sync.get('blocked', function(items) {
        blocked_urls = items['blocked'];
        if(blocked_urls === undefined){
          blocked_urls = [];
        }
        console.log("urls loaded from sync.");
      });
    } else if(items.sync === 'local'){
      chrome.storage.local.get('blocked', function(items) {
        blocked_urls = items['blocked'];
        if(blocked_urls === undefined){
          blocked_urls = [];
        }
        console.log("urls loaded from local.");
      });
    } else if(items.sync === 'server'){
      const url = items.server;
      const request = new XMLHttpRequest();
      request.setRequestHeader('Content-Type', 'application/json; charset=UTF-8');
      request.onreadystatechange = function() {
        if (this.readyState === 4 && this.status === 200) {
          var myArr = JSON.parse(this.responseText);
          if(myArr.code === 'done'){
            blocked_urls = myArr.urls;
            console.log("urls loaded from server.");
          }
        } else {
          console.log("urls loading from server failed.");
        }
      };
      request.open("POST", url, true);
      request.send(JSON.stringify({'action': 'query', 'urls': []}));
    } else {
      console.log("unknown 'sync' value.");
    }
  });
}

function add_blocked(url){
  if(url.startsWith("chrome-extension://")){
    return;
  }
  blocked_urls.push(strip_url(url));
  save_list();
}

function rm_blocked(url){
  if(url.startsWith("chrome-extension://")){
    return;
  }
  blocked_urls = removeUrlAll(blocked_urls, strip_url(url));
  save_list();
}

function requestChecker(request) {
  if (request && request.url && request.type === "main_frame") {
    if (check_blocked(request.url) === 'blocked') {
      var redirectUrl = chrome.extension.getURL(
          "blockedSite.html?blocked=" + request.url);
      return { redirectUrl: redirectUrl };
    }
  }
}

function onload () {
  load_list();
}

chrome.webRequest.onBeforeRequest.addListener(requestChecker, {urls: ["*://*/*"]}, ["blocking"]);
chrome.runtime.onStartup.addListener(onload);
chrome.runtime.onInstalled.addListener(onload);
