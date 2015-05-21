(function() {
  var current, findImage, getAllImages, scrollTo, sendImages, syncTab;

  current = {};

  sendImages = function(images) {
    return chrome.runtime.sendMessage({
      action: 'images',
      data: images
    });
  };

  getAllImages = function() {
    var images;
    images = $('img').map(function(i, e) {
      return {
        depth: $(e).parents().length,
        width: $(e).width(),
        height: $(e).height(),
        src: $(e).attr('src'),
        path: $(e)[0].src
      };
    });
    images = _.groupBy(images, function(o) {
      if (o.width * o.height > 120000) {
        return 'xlarge';
      }
      if (o.width * o.height > 50000) {
        return 'large';
      }
      if (o.width * o.height > 12000) {
        return 'medium';
      }
      return 'small';
    });
    return images;
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
    return scrollTo($("img[src='" + src + "']"));
  };

  syncTab = function() {
    return chrome.runtime.sendMessage({
      action: 'tab.info'
    }, function(info) {
      console.log(info);
      if (typeof info._id !== 'undefined' && typeof info.url !== 'undefined') {
        current = info;
        window.onbeforeunload = function() {
          return 'Anti-redirect...';
        };
        return $(document).ready(function() {
          return chrome.runtime.sendMessage({
            action: 'images',
            data: getAllImages()
          });
        });
      }
    });
  };

  syncTab();

  chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    console.log('content::received', request);
    if (typeof request.action !== 'undefined') {
      switch (request.action) {
        case 'images':
          if (document.readyState === 'complete') {
            return sendResponse(getAllImages());
          } else {
            return $(document).unbind('ready').bind('ready', function() {
              return sendResponse(getAllImages());
            });
          }
          break;
        case 'show':
          if (typeof request.src !== 'undefined') {
            return findImage(request.src);
          }
          break;
        case 'html':
          return sendResponse(document.documentElement.outerHTML);
      }
    }
  });

}).call(this);
