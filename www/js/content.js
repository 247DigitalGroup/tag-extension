(function() {
  var aim, check, checked, clean, cleanButton, enterCleanMode, exitCleanMode, onCleanMode, tagButton, toolbar;

  aim = function(e) {
    $('*').removeClass('cl-in-aim');
    $(e.target).addClass('cl-in-aim');
    return null;
  };

  clean = function(e) {
    if ($(e.target).attr('class').indexOf('clicklion-') >= 0) {
      return null;
    }
    $(e.target).remove();
    e.stopPropagation();
    e.preventDefault();
    return null;
  };

  enterCleanMode = function() {
    cleanButton.addClass('clicklion-active');
    $('*').removeClass('cl-in-aim').on('mouseover', aim).on('click', clean);
    return null;
  };

  exitCleanMode = function() {
    cleanButton.removeClass('clicklion-active');
    $('*').removeClass('cl-in-aim').off('mouseover', aim).off('click', clean);
    return null;
  };

  onCleanMode = false;

  checked = {};

  tagButton = $('<span class="clicklion-button">Submit</span>').click(function() {
    var data;
    data = {
      html: document.documentElement.outerHTML,
      image_urls: Object.keys(checked),
      note: ''
    };
    return chrome.runtime.sendMessage({
      action: 'tag',
      data: data
    });
  });

  cleanButton = $('<span class="clicklion-button">Clean</span>').click(function() {
    if (onCleanMode) {
      exitCleanMode();
      return onCleanMode = false;
    } else {
      enterCleanMode();
      return onCleanMode = true;
    }
  });

  toolbar = $('<div class="clicklion-toolbar"></div>');

  $(toolbar).append(tagButton).append(cleanButton);

  check = function(e) {
    var src;
    if (e.altKey === false) {
      e.preventDefault();
      src = $(this).attr('src');
      if (typeof checked[src] === 'undefined') {
        checked[src] = true;
        return $(this).addClass('clicklion-checked');
      } else {
        delete checked[src];
        return $(this).removeClass('clicklion-checked');
      }
    }
  };

  if (true) {
    $(document).delegate('img', 'contextmenu', check);
    $('body').append(toolbar);
  }

  chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    console.log('content::received', request);
    if (typeof request.action !== 'undefined') {
      switch (request.action) {
        case 'open':
          if (typeof request.url !== 'undefined') {
            return window.location = "" + request.url;
          }
      }
    }
  });

}).call(this);
