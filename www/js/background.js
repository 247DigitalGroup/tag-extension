(function() {
  var api, current, openUrl, tag;

  api = {
    root: 'http://192.168.1.17:8080',
    tag: '/articles/image_tagging',
    login: '/login'
  };

  current = {
    _id: null,
    url: null
  };

  tag = function(data) {
    if (data == null) {
      data = null;
    }
    if (data !== null) {
      data._id = current._id;
      data.url = current.url;
    }
    console.log('background::tag', data);
    return $.ajax({
      url: api.root + api.tag,
      method: 'post',
      dataType: 'json',
      data: data,
      success: function(res, status, xhr) {
        typeof res !== 'undefined' && typeof res.data !== 'undefined' && openUrl(res.data);
        return null;
      },
      error: function(xhr, status, e) {
        var em;
        em = {
          action: 'error',
          code: '0',
          description: ''
        };
        switch (xhr.status) {
          case 0:
            em.code = 404;
            em.description = 'Could not connect to the Tree of Souls!';
            break;
          case 401:
            em.code = 401;
            em.description = 'You are not one of us!';
        }
        chrome.runtime.sendMessage(em);
        return null;
      }
    });
  };

  openUrl = function(data) {
    var message;
    if (typeof data._id !== 'undefined' && typeof data.url !== 'undefined') {
      current._id = data._id;
      current.url = data.url;
      message = {
        action: 'open',
        _id: data._id,
        url: data.url
      };
      chrome.tabs.query({
        active: true,
        currentWindow: true
      }, function(tabs) {
        chrome.tabs.sendMessage(tabs[0].id, message);
        return null;
      });
      return null;
    }
  };

  chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    console.log('background::received', request);
    if (sender.tab) {
      if (typeof request.action !== 'undefined') {
        switch (request.action) {
          case 'tag':
            return typeof request.data !== 'undefined' && tag(request.data);
        }
      }
    } else {
      if (typeof request.action !== 'undefined') {
        switch (request.action) {
          case 'start':
            return tag();
          case 'skip':
            if (current._id !== null) {
              return tag({
                _id: current._id,
                skip: true
              });
            }
            break;
          case 'api':
            return sendResponse(api);
        }
      }
    }
  });

}).call(this);
