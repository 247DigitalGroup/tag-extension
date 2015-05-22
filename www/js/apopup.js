(function() {
  var api, tagging;

  api = {
    root: 'http://192.168.1.17:8080',
    tag: '/articles/image_tagging',
    login: '/login'
  };

  tagging = false;

  angular.module('ClickLionTagger', []).directive('ngRightClick', function($parse) {
    return function(scope, element, attrs) {
      var fn;
      fn = $parse(attrs.ngRightClick);
      return element.bind('contextmenu', function(e) {
        return scope.$apply(function() {
          e.preventDefault();
          return fn(scope, {
            $event: e
          });
        });
      });
    };
  }).controller('PopupController', function($scope) {
    var calcSizes, getImage, getSelectedImages, init, openUrl, tag;
    $scope.user = {
      email: 'gia@coa.vn',
      password: 'gia.ninja'
    };
    $scope.imgs = [];
    $scope.selectedImgs = [];
    $scope.error = null;
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
            switch (xhr.status) {
              case 0:
                $scope.error = {
                  code: 404,
                  description: 'Could not connect to the Tree of Souls!'
                };
                break;
              case 401:
                $scope.error = {
                  code: 401,
                  description: 'You are not one of us!'
                };
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
              switch (xhr.status) {
                case 0:
                  $scope.error = {
                    code: 404,
                    description: 'Could not connect to the Tree of Souls!'
                  };
                  break;
                case 401:
                  $scope.error = {
                    code: 401,
                    description: 'You are not one of us!'
                  };
              }
              return null;
            }
          });
          return null;
        });
      }
      return null;
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
        $scope.imgs = [];
        return null;
      }
    };
    calcSizes = function() {
      var i, img, j, len, ref, results;
      ref = $scope.imgs;
      results = [];
      for (i = j = 0, len = ref.length; j < len; i = ++j) {
        img = ref[i];
        results.push($('<img/>').attr('src', img.path).load(function() {
          if (typeof $scope.imgs[i] !== 'undefined') {
            $scope.imgs[i].width = this.width;
            return $scope.imgs[i].height = this.height;
          }
        }));
      }
      return results;
    };
    getImage = function() {
      chrome.tabs.query({
        active: true,
        currentWindow: true
      }, function(tabs) {
        var currentTabId;
        currentTabId = tabs[0].id;
        chrome.tabs.sendMessage(currentTabId, {
          action: 'images'
        }, function(images) {
          $scope.imgs = images;
          calcSizes();
          return null;
        });
        return null;
      });
      return null;
    };
    getSelectedImages = function() {
      var selected;
      selected = _.filter($scope.imgs, function(o) {
        if (typeof o.selected && o.selected === true) {
          return true;
        }
        return false;
      });
      selected = _.map(selected, function(o) {
        return o.path;
      });
      return selected;
    };
    $scope.find = function(img) {
      chrome.tabs.query({
        active: true,
        currentWindow: true
      }, function(tabs) {
        return chrome.tabs.sendMessage(tabs[0].id, {
          action: 'show',
          src: img.src
        });
      });
      return null;
    };
    $scope.select = function(img) {
      if (img.selected) {
        img.selected = false;
      } else {
        img.selected = true;
      }
      return null;
    };
    $scope.check = function() {
      chrome.tabs.query({
        active: true,
        currentWindow: true
      }, function(tabs) {
        return chrome.tabs.sendMessage(tabs[0].id, {
          action: 'html'
        }, function(html) {
          var data, urls;
          urls = [];
          data = {
            html: html,
            image_urls: getSelectedImages()
          };
          return tag(data);
        });
      });
      return null;
    };
    $scope.skip = function() {
      tag({
        skip: true
      });
      return null;
    };
    $scope.refresh = function() {
      getImage();
      return null;
    };
    $scope.login = function() {
      console.log($scope.user);
      return false;
    };
    init = function() {
      return chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
        if (typeof request.action !== 'undefined') {
          switch (request.action) {
            case 'error':
              if (typeof request.code !== 'undefined' && typeof request.description !== 'undefined') {
                $scope.error = {
                  code: request.code,
                  description: request.description
                };
              }
              break;
            case 'images':
              if (typeof request.data !== 'undefined') {
                $scope.imgs = request.data;
                calcSizes();
              }
          }
        }
        return null;
      });
    };
    $scope.init = function() {
      init();
      return getImage();
    };
    return null;
  });

}).call(this);
