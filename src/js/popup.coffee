api = 
  root: 'http://192.168.1.17:8080'
  tag: '/articles/image_tagging'
  login: '/login'


openUrl = (data) ->
  if typeof data._id isnt 'undefined' and typeof data.url isnt 'undefined'
    message = action: 'open', _id: data._id, url: data.url
    chrome.runtime.sendMessage message
    null


tag = (data = null) ->
  console.log 'submit', data
  $.ajax
    url: api.root + api.tag
    method: 'post'
    dataType: 'json'
    data: data
    success: (res, status, xhr) ->
      typeof res isnt 'undefined' and typeof res.data isnt 'undefined' and openUrl res.data
      null
    error: (xhr, status, e) ->
      em = action: 'error', code: '0', description: ''
      switch xhr.status
        when 0
          showError 404, 'Could not connect to the Tree of Souls!'
        when 401
          showError 401, 'You are not one of us!'
      null


$ document
  .ready () ->

    $ '#tag'
      .click () ->
        tag()


    $ '#skip'
      .click () ->
        chrome.tabs.query {active: true, currentWindow: true}, (tabs) ->
          tabId = tabs[0].id
          chrome.runtime.sendMessage {action: 'tab.info'}, (info) ->
            if typeof info._id isnt 'undefined' and typeof info.url isnt 'undefined'
              data =
                _id: info._id
                url: info.url
                skip: true
              tag data


    $ '#reveal'
      .change () ->
        value = $ this
          .prop 'checked'
        if value is true then action = 'reveal' else action = 'unreveal'
        chrome.tabs.query {active: true, currentWindow: true}, (tabs) ->
          chrome.tabs.sendMessage tabs[0].id, {action: action}
          null


    $ '#login'
      .click (e) ->
        e.preventDefault()
        email = $('input#email').val()
        password = $('input#password').val()

        statusBar = $ '.status'
        progressBar = $ '.progress'
        showProgressBar = () ->
          $ progressBar
            .removeClass 'hide'
        hideProgressBar = () ->
          setTimeout () ->
              $ progressBar
                .addClass 'hide'
            , 1000

        $.ajax
          url: "#{api.root}#{api.login}"
          method: 'post'
          xhrFields:
            withCredentials: true
          data:
            email: email
            password: password
          beforeSend: () ->
            $ statusBar
              .stop()
              .hide()
              .addClass 'hide'
            showProgressBar()
          success: (data, status, xhr) ->
            $ statusBar
              .text 'Welcome to the matrix!'
              .removeClass 'hide'
              .stop()
              .hide()
              .fadeIn()
            hideProgressBar()
          error: (xhr, status, e) ->
            $ statusBar
              .text 'One does not simply walk into mordor!'
              .removeClass 'hide'
              .stop()
              .hide()
              .fadeIn()
            hideProgressBar()

chrome
  .runtime
  .onMessage
  .addListener (request, sender, sendResponse) ->
    console.log request, sender
    if typeof request.action isnt 'undefined'
      switch request.action
        when 'error'
          if typeof request.code isnt 'undefined' and typeof request.description isnt 'undefined'
            showError request.code, request.description
        when 'images'
          if typeof request.data isnt 'undefined'
            createImagesList request.data