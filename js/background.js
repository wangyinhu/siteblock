blocked_urls = [];
hidden_urls = [];

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
    if (pathstart === -1) {
        return url;
    } else {
        return url.substring(0, domainstart + pathstart + 1);
    }
}

function check_blocked(url) {
    console.log('Checking if url is blocked, utl=:');
    console.log(url);
    console.log("url strip:");
    console.log(strip_url(url));
    console.log("blocked_urls:");
    console.log(blocked_urls);
    console.log("hidden_urls:");
    console.log(hidden_urls);
    if (url.startsWith("chrome-extension://") && url.includes("blockedSite.html")) {
        return 'blockedSite';
    }

    if (url.startsWith("chrome-extension://") || url.startsWith("chrome://")) {
        return 'chrome';
    }

    for (const i in blocked_urls) {
        if (url.startsWith(blocked_urls[i])) {
            return 'blocked';
        }
    }

    for (const i in hidden_urls) {
        if (url.startsWith(hidden_urls[i])) {
            return 'hidden';
        }
    }
    return 'pass';
}

function save_list(action, type, url) {
    if(type === 'hide'){
        if(action === 'add'){
            hidden_urls.push(strip_url(url));
        } else if(action === 'remove'){
            hidden_urls = removeUrlAll(hidden_urls, strip_url(url));
        }
    }else if(type === 'block'){
        if(action === 'add'){
            blocked_urls.push(strip_url(url));
        } else if(action === 'remove'){
            blocked_urls = removeUrlAll(blocked_urls, strip_url(url));
        }
    }
    chrome.storage.local.get({
        sync: 'sync',
        server: "https://www.example.com/list/"
    }, function (items) {
        if (items.sync === 'sync') {
            if (type === 'block') {
                chrome.storage.sync.set({'blocked': blocked_urls}, function () {
                    console.log("urls saved into sync.");
                })
            } else if (type === 'hide') {
                chrome.storage.sync.set({'hidden': hidden_urls}, function () {
                    console.log("urls saved into sync.");
                })
            }
        } else if (items.sync === 'local') {
            if (type === 'block') {
                chrome.storage.local.set({'blocked': blocked_urls}, function () {
                    console.log("urls saved into local.");
                })
            } else if (type === 'hide') {
                chrome.storage.local.set({'hidden': hidden_urls}, function () {
                    console.log("urls saved into local.");
                })
            }
        } else if (items.sync === 'server') {
            const server = items.server;
            const request = new XMLHttpRequest();
            request.open("POST", server, true);
            request.setRequestHeader('X-Requested-With', 'XMLHttpRequest');
            request.setRequestHeader('Content-Type', 'application/json; charset=UTF-8');
            request.onreadystatechange = function () {

                if (this.readyState === 4) {
                    if (this.status === 200) {
                        var myArr = JSON.parse(this.responseText);
                        if (myArr.code === 'done') {
                            console.log("urls saved into server.");
                        }
                    } else {
                        console.log("urls saving into server failed.");
                    }
                }
            };
            request.send(JSON.stringify({'action': action, 'type': type, 'urls': [url]}));
        } else {
            console.log("unknown 'sync' value.");
        }
    });
}

function load_list() {
    chrome.storage.local.get({
        sync: 'sync',
        server: "https://example.com"
    }, function (items) {
        if (items.sync === 'sync') {
            chrome.storage.sync.get('blocked', function (items) {
                blocked_urls = items['blocked'];
                if (blocked_urls === undefined) {
                    blocked_urls = [];
                }
                console.log("urls loaded from sync.");
            });
            chrome.storage.sync.get('hidden', function (items) {
                hidden_urls = items['hidden'];
                if (hidden_urls === undefined) {
                    hidden_urls = [];
                }
                console.log("urls loaded from sync.");
            });
        } else if (items.sync === 'local') {
            chrome.storage.local.get('blocked', function (items) {
                blocked_urls = items['blocked'];
                if (blocked_urls === undefined) {
                    blocked_urls = [];
                }
                console.log("urls loaded from local.");
            });
            chrome.storage.local.get('hidden', function (items) {
                hidden_urls = items['hidden'];
                if (hidden_urls === undefined) {
                    hidden_urls = [];
                }
                console.log("urls loaded from local.");
            });
        } else if (items.sync === 'server') {
            const server = items.server;
            const request = new XMLHttpRequest();
            request.open("POST", server, true);
            request.setRequestHeader('X-Requested-With', 'XMLHttpRequest');
            request.setRequestHeader('Content-Type', 'application/json; charset=UTF-8');
            request.onreadystatechange = function () {
                if (this.readyState === 4) {
                    if (this.status === 200) {
                        var myArr = JSON.parse(this.responseText);
                        if (myArr.code === 'done') {
                            blocked_urls = myArr.blocked_urls;
                            hidden_urls = myArr.hidden_urls;
                            console.log("urls loaded from server:");
                            console.log("blocked_urls");
                            console.log(blocked_urls);
                            console.log("hidden_urls");
                            console.log(hidden_urls);
                        }
                    } else {
                        console.log("this.readyState");
                        console.log(this.readyState);
                        console.log(this.responseText);
                        console.log("urls loading from server failed.");
                    }
                }
            };
            request.send(JSON.stringify({'action': 'query', 'urls': []}));
        } else {
            console.log("unknown 'sync' value.");
        }
    });
}

function add_blocked(url) {
    save_list('add', 'block', strip_url(url));
}

function add_hidden(url) {
    save_list('add', 'hide', strip_url(url));
}

function rm_blocked(url) {
    save_list('remove', 'block', strip_url(url));
}

function requestChecker(request) {
    if (request && request.url && request.type === "main_frame") {
        if (check_blocked(request.url) === 'blocked') {
            var redirectUrl = chrome.extension.getURL(
                "blockedSite.html?blocked=" + request.url);
            return {redirectUrl: redirectUrl};
        } else if (check_blocked(request.url) === 'hidden' && !chrome.extension.inIncognitoContext) {
            // chrome.tabs.remove(request.tabId);
            chrome.windows.create({url: request.url , incognito: true});
            // return {cancel: true};
            return {redirectUrl: 'javascript:void(0)'};
        }
    }
}

function onload() {
    load_list();
}

function context_cb(object){
    if (!chrome.extension.inIncognitoContext){
        add_hidden(object.linkUrl);
        chrome.windows.create({url: object.linkUrl , incognito: true});
    }
}

chrome.webRequest.onBeforeRequest.addListener(requestChecker, {urls: ["*://*/*"]}, ["blocking"]);
chrome.runtime.onStartup.addListener(onload);
chrome.runtime.onInstalled.addListener(onload);

chrome.contextMenus.create({
    'title':'always in incognito',
    'contexts':['link'],
    'id':'contexEnter',
    'onclick':context_cb
});