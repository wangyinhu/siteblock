var url = document.URL;
url = url.substring(url.indexOf("?"));
url = url.substring(url.indexOf("=") + 1);
$("#blockMessage").text(url + " has been Blacklisted.");

// document.getElementById('go-to-options').addEventListener('click',function() {
//     if (chrome.runtime.openOptionsPage) {
//         chrome.runtime.openOptionsPage();
//     } else {
//         window.open(chrome.runtime.getURL('options.html'));
//     }
// });