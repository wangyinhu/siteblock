var url = document.URL;
url = url.substring(url.indexOf("?"));
url = url.substring(url.indexOf("=") + 1);
$("#blockMessage").text(url + " has been Blacklisted.");

