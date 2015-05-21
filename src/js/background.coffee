_tabs = {}

chrome
  .runtime
  .onMessage
  .addListener (request, sender, sendResponse) ->
    console.log 'get', request
    if request.action
      if sender.tab
        switch request.action
          when 'tab.info'
            if typeof _tabs[sender.tab.id] isnt 'undefined'
              console.log 'post', _tabs[sender.tab.id]
              sendResponse _tabs[sender.tab.id]
            else
              console.log 'post', {}
              sendResponse {}
      else
        switch request.action
          when 'open'
            if typeof request._id isnt 'undefined' and typeof request.url isnt 'undefined'
              message = action: 'open', _id: request._id, url: request.url
              chrome.tabs.query {active: true, currentWindow: true}, (tabs) ->
                tabId = tabs[0].id
                _tabs[tabId] =
                  _id: request._id
                  url: request.url
                chrome.tabs.executeScript tabId, code: 'window.onbeforeunload = null;'
                chrome.tabs.update tabId, url: request.url
          when 'tab.info'
            chrome.tabs.query {active: true, currentWindow: true}, (tabs) ->
              tabId = tabs[0].id
              if typeof _tabs[tabId] isnt 'undefined'
                console.log 'post', _tabs[tabId]
                sendResponse _tabs[tabId]
              else
                console.log 'post', {}
                sendResponse {}
    return true

window._tabs = _tabs