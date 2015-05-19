(function() {
  var api, showError;

  api = null;

  chrome.runtime.sendMessage({
    action: 'api'
  }, function(_api) {
    return api = _api;
  });

  $(document).ready(function() {
    $('#start').click(function() {
      return chrome.runtime.sendMessage({
        action: 'start'
      });
    });
    $('#skip').click(function() {
      return chrome.runtime.sendMessage({
        action: 'skip'
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

  showError = function(code, description) {
    return $('#error').find('> h1.code').text(code).end().find('> p.description').text(description).end().removeClass('hide');
  };

  chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    if (typeof request.action !== 'undefined') {
      switch (request.action) {
        case 'error':
          if (typeof request.code !== 'undefined' && typeof request.description !== 'undefined') {
            return showError(request.code, request.description);
          }
      }
    }
  });

}).call(this);
