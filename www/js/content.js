(function() {
  var current, findImage, getAllImages, scrollTo, sendImages, showAll, syncTab;

  current = {};

  sendImages = function(images) {
    return chrome.runtime.sendMessage({
      action: 'images',
      data: images
    });
  };

  getAllImages = function() {
    var images;
    images = jQuery('img').map(function(i, e) {
      return {
        depth: jQuery(e).parents().length,
        width: jQuery(e).width(),
        height: jQuery(e).height(),
        src: jQuery(e).attr('src'),
        path: jQuery(e)[0].src
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
    jQuery('.clicklion-checked, .clicklion-image').removeClass('clicklion-checked').removeClass('clicklion-image');
    jQuery(e).addClass('clicklion-checked clicklion-image');
    setTimeout(function() {
      return jQuery(e).removeClass('clicklion-checked').removeClass('clicklion-image');
    }, 3000);
    y = jQuery(e).offset().top - (jQuery(window).height() - jQuery(e).height()) / 2;
    return jQuery('html, body').stop().animate({
      scrollTop: y
    }, 200);
  };

  findImage = function(src) {
    return scrollTo(jQuery("img[src=\"" + src + "\"]"));
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
        return jQuery(document).ready(function() {
          return chrome.runtime.sendMessage({
            action: 'images',
            data: getAllImages()
          });
        });
      }
    });
  };

  showAll = function(reveal) {
    var revealCSS;
    if (reveal == null) {
      reveal = true;
    }
    if (reveal) {
      revealCSS = {
        'display': 'block',
        'overflow': 'visible',
        'position': 'initial',
        'visibility': 'visible',
        'opacity': 1,
        'float': 'none'
      };
      return jQuery('img').addClass('clicklion-reveal').each(function(i, e) {
        return jQuery(e).addClass('clicklion-reveal').parents().addClass('clicklion-reveal');
      });
    } else {
      return jQuery('.clicklion-reveal').removeClass('clicklion-reveal');
    }
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
            return jQuery(document).unbind('ready').bind('ready', function() {
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
        case 'reveal':
          return showAll(true);
        case 'unreveal':
          return showAll(false);
      }
    }
  });

}).call(this);
