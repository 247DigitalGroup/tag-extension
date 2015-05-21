(function() {
  var _tabs;

  _tabs = {};

  chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    var message;
    console.log('get', request);
    if (request.action) {
      if (sender.tab) {
        switch (request.action) {
          case 'tab.info':
            if (typeof _tabs[sender.tab.id] !== 'undefined') {
              console.log('post', _tabs[sender.tab.id]);
              sendResponse(_tabs[sender.tab.id]);
            } else {
              console.log('post', {});
              sendResponse({});
            }
        }
      } else {
        switch (request.action) {
          case 'open':
            if (typeof request._id !== 'undefined' && typeof request.url !== 'undefined') {
              message = {
                action: 'open',
                _id: request._id,
                url: request.url
              };
              chrome.tabs.query({
                active: true,
                currentWindow: true
              }, function(tabs) {
                var tabId;
                tabId = tabs[0].id;
                _tabs[tabId] = {
                  _id: request._id,
                  url: request.url
                };
                chrome.tabs.executeScript(tabId, {
                  code: 'window.onbeforeunload = null;'
                });
                return chrome.tabs.update(tabId, {
                  url: request.url
                });
              });
            }
            break;
          case 'tab.info':
            chrome.tabs.query({
              active: true,
              currentWindow: true
            }, function(tabs) {
              var tabId;
              tabId = tabs[0].id;
              if (typeof _tabs[tabId] !== 'undefined') {
                console.log('post', _tabs[tabId]);
                return sendResponse(_tabs[tabId]);
              } else {
                console.log('post', {});
                return sendResponse({});
              }
            });
        }
      }
    }
    return true;
  });

  window._tabs = _tabs;

}).call(this);
