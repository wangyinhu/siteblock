// Saves options to chrome.storage
function save_options() {
    var sync = document.getElementById('sync').value;
    var server = document.getElementById('server').value;
    chrome.storage.sync.set({
        sync: sync,
        server: server
    }, function() {
        // Update status to let user know options were saved.
        var status = document.getElementById('status');
        status.textContent = 'Options saved.';
        setTimeout(function() {
            status.textContent = '';
        }, 750);
    });
}

// Restores select box and checkbox state using the preferences
// stored in chrome.storage.
function restore_options() {
    // Use default value color = 'red' and likesColor = true.
    chrome.storage.sync.get({
        sync: 'sync',
        server: "https://example.com"
    }, function(items) {
        document.getElementById('sync').value = items.sync;
        document.getElementById('server').value = items.server;
        document.getElementById('server').disabled = items.sync !== 'server';
    });
}

function syncChange (){
    document.getElementById('server').disabled = document.getElementById('sync').value !== 'server';
}

document.addEventListener('DOMContentLoaded', restore_options);
document.getElementById('save').addEventListener('click', save_options);
document.getElementById('sync').addEventListener("change", syncChange);