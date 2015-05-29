(function() {
  var _images, addImage, addImageLarge, addImageMedium, addImageSmall, addImageXLarge, api, doc, findImage, getImages, getTabInfo, init, scrollTo, showError, tabInfo, tag;

  api = {
    root: 'http://192.168.1.17:8080',
    tag: '/articles/image_tagging',
    login: '/login'
  };

  doc = null;

  _images = [];

  tabInfo = {};

  showError = function() {
    return null;
  };

  getImages = function() {
    $(doc).find('ul.images').html('');
    return $('img').each(function(i, e) {
      var img;
      img = new Image();
      img.onload = function() {
        var _image;
        if (img.width >= 320 && img.height >= 240) {
          _image = {
            w: img.width,
            h: img.height,
            _src: $(img).attr('src'),
            src: encodeURI($(img).attr('src')),
            path: img.src
          };
          if (_image.w * _image.h >= 153000) {
            return addImageXLarge(_image);
          }
          if (_image.w * _image.h >= 76800) {
            return addImageLarge(_image);
          }
          if (_image.w * _image.h > 12000) {
            return addImageMedium(_image);
          }
          return addImageSmall(_image);
        }
      };
      return img.src = $(e).attr('src');
    });
  };

  tag = function(data) {
    if (typeof tabInfo._id !== 'undefined' && typeof tabInfo.url !== 'undefined') {
      data._id = tabInfo._id;
      data.url = tabInfo.url;
    }
    $.ajax({
      url: api.root + api.tag,
      method: 'post',
      dataType: 'json',
      data: data,
      beforeSend: function() {
        return $(doc).find('#loading').stop().fadeIn();
      },
      complete: function() {
        return $(doc).find('#loading').stop().fadeOut();
      },
      success: function(res, status, xhr) {
        if (typeof res !== 'undefined' && typeof res.data !== 'undefined') {
          return chrome.runtime.sendMessage({
            action: 'tag',
            data: res.data
          });
        }
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
  };

  scrollTo = function(e) {
    var y;
    $('.clicklion-checked, .clicklion-image').removeClass('clicklion-checked').removeClass('clicklion-image');
    $(e).addClass('clicklion-checked clicklion-image');
    setTimeout(function() {
      return $(e).removeClass('clicklion-checked').removeClass('clicklion-image');
    }, 3000);
    y = $(e).offset().top - ($(window).height() - $(e).height()) / 2;
    return $('html, body').stop().animate({
      scrollTop: y
    }, 200);
  };

  findImage = function(src) {
    return scrollTo($("img[src=\"" + src + "\"]"));
  };

  addImage = function(img, size) {
    var li;
    li = $('<li data-src="' + img._src + '" data-path="' + img.path + '"><div class="image" style="background-image: url(' + img.src + ')"><p class="meta">' + img.w + 'x' + img.h + '</p></div></li>');
    return $(doc).find('ul.images#' + size).append($(li));
  };

  addImageXLarge = function(img) {
    return addImage(img, 'xlarge');
  };

  addImageLarge = function(img) {
    return addImage(img, 'large');
  };

  addImageMedium = function(img) {
    return addImage(img, 'medium');
  };

  addImageSmall = function(img) {
    return addImage(img, 'small');
  };

  getTabInfo = function() {
    return chrome.runtime.sendMessage({
      action: 'tab.info'
    }, function(info) {
      if (typeof info._id !== 'undefined') {
        tabInfo = info;
        return init();
      }
    });
  };

  getTabInfo();

  init = function() {
    var html, iframe;
    iframe = $('<iframe id="clicklion-iframe"/>');
    html = '<div id="loading"></div>\n<div class="buttons">\n	<button id="tag">Tag</button>\n	<button id="skip">Skip</button>\n	<button id="refresh">Refresh</button>\n</div>\n<div class="selector">\n	<h5>xlarge</h5>\n	<ul class="images bg sp-0 sm-2" id="xlarge"></ul>\n	<h5>large</h5>\n	<ul class="images bg sp-0 sm-3" id="large"></ul>\n	<h5 class="h">medium</h5>\n	<ul class="images bg sp-0 sm-3 h" id="medium"></ul>\n	<h5 class="h">small</h5>\n	<ul class="images bg sp-0 sm-4 h" id="small"></ul>\n</div>';
    $(iframe).css({
      position: 'fixed',
      right: '20px',
      top: '20px',
      width: '400px',
      height: '500px',
      border: '3px solid rgba(0, 0, 0, .4)',
      'border-radius': '4px',
      'z-index': '999999999999'
    }).appendTo('body');
    doc = $(iframe).contents().find('head').append($('<link rel="stylesheet" type="text/css" href="' + chrome.extension.getURL('/css/gia.ui.css') + '">')).append($('<link rel="stylesheet" type="text/css" href="' + chrome.extension.getURL('/css/iframe.css') + '">')).end().find('body');
    $(doc).delegate('li[data-src]', 'click', function(e) {
      var src;
      src = $(e.currentTarget).attr('data-src');
      return findImage(src);
    }).delegate('li[data-src]', 'contextmenu', function(e) {
      var image, src;
      e.preventDefault();
      src = $(e.currentTarget).attr('data-src');
      findImage(src);
      image = $(e.currentTarget).find('div.image');
      if ($(image).hasClass('selected')) {
        return $(image).removeClass('selected');
      } else {
        return $(image).addClass('selected');
      }
    });
    $(doc).append($(html));
    $(doc).find('button#tag').click(function() {
      var data, e, i, j, paths, ref;
      paths = [];
      e = $(doc).find('ul.images > li[data-path]');
      for (i = j = 0, ref = e.length - 1; 0 <= ref ? j <= ref : j >= ref; i = 0 <= ref ? ++j : --j) {
        if ($(e[i]).find('> div.image').hasClass('selected')) {
          paths.push($(e[i]).attr('data-path'));
        }
      }
      console.log(paths);
      data = {
        image_urls: paths,
        html: document.documentElement.outerHTML
      };
      return tag(data);
    }).end().find('button#skip').click(function() {
      var data;
      data = {
        skip: true
      };
      return tag(data);
    }).end().find('button#refresh').click(function() {
      return getImages();
    });
    window.onbeforeunload = function() {
      return 'Anti-redirect...';
    };
    return $(document).ready(function() {
      $(doc).find('#loading').stop().fadeOut();
      return getImages();
    });
  };

}).call(this);
