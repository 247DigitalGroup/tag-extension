api = null

chrome
  .runtime
  .sendMessage {action: 'api'}, (_api) ->
    api = _api

$ document
  .ready () ->

    $ '#start'
      .click () ->
        chrome
          .runtime
          .sendMessage action: 'start'

    $ '#skip'
      .click () ->
        chrome
          .runtime
          .sendMessage action: 'skip'

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

showError = (code, description) ->
  $ '#error'
    .find '> h1.code'
    .text code
    .end()
    .find '> p.description'
    .text description
    .end()
    .removeClass 'hide'

chrome
  .runtime
  .onMessage
  .addListener (request, sender, sendResponse) ->
    if typeof request.action isnt 'undefined'
      switch request.action
        when 'error'
          if typeof request.code isnt 'undefined' and typeof request.description isnt 'undefined'
            showError request.code, request.description