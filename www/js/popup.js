(function() {
  var api, createImagesList, getImages, imageClick, imageHover, openUrl, showError, tag, tagging;

  api = {
    root: 'http://192.168.1.17:8080',
    tag: '/articles/image_tagging',
    login: '/login'
  };

  tagging = false;

  openUrl = function(data) {
    var message;
    if (typeof data._id !== 'undefined' && typeof data.url !== 'undefined') {
      message = {
        action: 'open',
        _id: data._id,
        url: data.url
      };
      chrome.runtime.sendMessage(message);
      $('div#images ul.images').html('');
      return null;
    }
  };

  tag = function(data) {
    if (data == null) {
      data = null;
    }
    console.log('submit', data);
    if (data === null) {
      $.ajax({
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
    } else {
      chrome.runtime.sendMessage({
        action: 'tab.info'
      }, function(current) {
        if (typeof current._id !== 'undefined' && typeof current.url !== 'undefined') {
          data._id = current._id;
          data.url = current.url;
        }
        $.ajax({
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
        return null;
      });
    }
    return null;
  };

  imageHover = function(e) {
    var src;
    src = $(e.currentTarget).attr('data-src');
    chrome.tabs.query({
      active: true,
      currentWindow: true
    }, function(tabs) {
      return chrome.tabs.sendMessage(tabs[0].id, {
        action: 'show',
        src: src
      });
    });
    return e.preventDefault();
  };

  imageClick = function(e) {
    $(e.target).toggleClass('selected');
    return e.preventDefault();
  };

  createImagesList = function(images) {
    var group, image, j, len, listHTML, results, type;
    $('div#images > ul.images').html('');
    results = [];
    for (type in images) {
      group = images[type];
      listHTML = '';
      for (j = 0, len = group.length; j < len; j++) {
        image = group[j];
        listHTML += "<li data-src=\"" + image.src + "\" data-path=\"" + image.path + "\"><div class=\"image\" style=\"background-image: url(" + image.path + ")\"></div></li>";
      }
      results.push($("div#images > ul#" + type).html(listHTML));
    }
    return results;
  };

  getImages = function() {
    return chrome.tabs.query({
      active: true,
      currentWindow: true
    }, function(tabs) {
      var currentTabId;
      currentTabId = tabs[0].id;
      return chrome.tabs.sendMessage(currentTabId, {
        action: 'images'
      }, function(images) {
        return createImagesList(images);
      });
    });
  };

  $(document).ready(function() {
    getImages();
    $('ul.images').delegate('> li', 'click', imageHover).delegate('> li', 'contextmenu', imageClick);
    $('#tag').click(function() {
      return chrome.tabs.query({
        active: true,
        currentWindow: true
      }, function(tabs) {
        return chrome.tabs.sendMessage(tabs[0].id, {
          action: 'html'
        }, function(html) {
          var data, e, i, j, len, src, urls;
          urls = [];
          e = $('div#images li[data-src] div.image.selected');
          for (j = 0, len = e.length; j < len; j++) {
            i = e[j];
            src = $(i).parent().attr('data-path');
            urls.push(src);
          }
          data = {
            html: html,
            image_urls: urls
          };
          return tag(data);
        });
      });
    });
    $('#skip').click(function() {
      return tag({
        skip: true
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
