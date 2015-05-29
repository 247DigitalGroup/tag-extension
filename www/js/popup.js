(function() {
  var api, openUrl, tag;

  api = {
    root: 'http://192.168.1.17:8080',
    tag: '/articles/image_tagging',
    login: '/login'
  };

  openUrl = function(data) {
    var message;
    if (typeof data._id !== 'undefined' && typeof data.url !== 'undefined') {
      message = {
        action: 'open',
        _id: data._id,
        url: data.url
      };
      chrome.runtime.sendMessage(message);
      return null;
    }
  };

  tag = function(data) {
    if (data == null) {
      data = null;
    }
    console.log('submit', data);
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
            showError(404, 'Could not connect to the Tree of Souls!');
            break;
          case 401:
            showError(401, 'You are not one of us!');
        }
        return null;
      }
    });
  };

  $(document).ready(function() {
    $('#tag').click(function() {
      return tag();
    });
    $('#skip').click(function() {
      return chrome.tabs.query({
        active: true,
        currentWindow: true
      }, function(tabs) {
        var tabId;
        tabId = tabs[0].id;
        return chrome.runtime.sendMessage({
          action: 'tab.info'
        }, function(info) {
          var data;
          if (typeof info._id !== 'undefined' && typeof info.url !== 'undefined') {
            data = {
              _id: info._id,
              url: info.url,
              skip: true
            };
            return tag(data);
          }
        });
      });
    });
    $('#reveal').change(function() {
      var action, value;
      value = $(this).prop('checked');
      if (value === true) {
        action = 'reveal';
      } else {
        action = 'unreveal';
      }
      return chrome.tabs.query({
        active: true,
        currentWindow: true
      }, function(tabs) {
        chrome.tabs.sendMessage(tabs[0].id, {
          action: action
        });
        return null;
      });
    });
    return $('#login').click(function(e) {
      var email, hideProgressBar, password, progressBar, showProgressBar, statusBar;
      e.preventDefault();
      email = $('input#email').val();
      password = $('input#password').val();
      statusBar = $('.status');
      progressBar = $('.progress');
      showProgressBar = function() {
        return $(progressBar).removeClass('hide');
      };
      hideProgressBar = function() {
        return setTimeout(function() {
          return $(progressBar).addClass('hide');
        }, 1000);
      };
      return $.ajax({
        url: "" + api.root + api.login,
        method: 'post',
        xhrFields: {
          withCredentials: true
        },
        data: {
          email: email,
          password: password
        },
        beforeSend: function() {
          $(statusBar).stop().hide().addClass('hide');
          return showProgressBar();
        },
        success: function(data, status, xhr) {
          $(statusBar).text('Welcome to the matrix!').removeClass('hide').stop().hide().fadeIn();
          return hideProgressBar();
        },
        error: function(xhr, status, e) {
          $(statusBar).text('One does not simply walk into mordor!').removeClass('hide').stop().hide().fadeIn();
          return hideProgressBar();
        }
      });
    });
  });

  chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    console.log(request, sender);
    if (typeof request.action !== 'undefined') {
      switch (request.action) {
        case 'error':
          if (typeof request.code !== 'undefined' && typeof request.description !== 'undefined') {
            return showError(request.code, request.description);
          }
          break;
        case 'images':
          if (typeof request.data !== 'undefined') {
            return createImagesList(request.data);
          }
      }
    }
  });

}).call(this);
