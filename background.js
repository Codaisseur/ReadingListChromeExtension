// background.js

// Called when the user clicks on the browser action.
chrome.browserAction.onClicked.addListener(function(tab) {
  // Send a message to the active tab
  chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
    var activeTab = tabs[0];

    // Get the saved creds using the Chrome extension storage API.
    chrome.storage.sync.get(['email', 'password'], function(response) {
      chrome.tabs.sendMessage(activeTab.id, {"message": "clicked_browser_action", 'creds': response});
    });
  });
});

// Listen for messages from content.js
chrome.runtime.onMessage.addListener(
  function(request, sender, sendResponse) {
    switch (request.message) {
      case  "open_new_tab" :
        chrome.tabs.create({"url": request.url});

      case "notify" :
        chrome.notifications.create(null, request.options);

      default :
        return
    }
  }
);

chrome.runtime.onMessageExternal.addListener(
  function(request, sender, sendResponse) {
    switch (request.action) {
      case 'AUTHORIZE' :
        // Save creds using the Chrome extension storage API.
        return chrome.storage.sync.set({ 'email': request.payload.email, 'password': request.payload.password }, function() {
          sendResponse({
            success: true,
            message: 'Settings saved!'
          })
        });

      default :
        return sendResponse({
          success: false,
          message: 'Unknown action!',
          request: request
        })
    }

    return sendResponse({
      success: false,
      message: 'Unknown request!'
    })
  }
);
