api = 
  root: 'http://192.168.1.17:8080'
  tag: '/articles/image_tagging'
  login: '/login'
tagging = false



openUrl = (data) ->
  if typeof data._id isnt 'undefined' and typeof data.url isnt 'undefined'
    message = action: 'open', _id: data._id, url: data.url
    chrome.runtime.sendMessage message
    $ 'div#images ul.images'
      .html ''
    null



tag = (data = null) ->
  console.log 'submit', data
  if data is null
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
  else 
    chrome
      .runtime
      .sendMessage {action: 'tab.info'}, (current) ->
        if typeof current._id isnt 'undefined' and typeof current.url isnt 'undefined'
          data._id = current._id
          data.url = current.url
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
        null
  null



imageHover = (e) ->
  src = $(e.currentTarget).attr 'data-src'
  chrome.tabs.query {active: true, currentWindow: true}, (tabs) ->
    chrome.tabs.sendMessage tabs[0].id, action: 'show', src: src
  e.preventDefault()



imageClick = (e) ->
  $ e.target
    .toggleClass 'selected'
  e.preventDefault()



createImagesList = (images) ->
  $ 'div#images > ul.images'
    .html ''
  for type, group of images
    listHTML = ''
    for image in group
      listHTML += "<li data-src=\"#{image.src}\" data-path=\"#{image.path}\"><div class=\"image\" style=\"background-image: url(#{image.path})\"></div></li>"
    $ "div#images > ul##{type}"
      .html listHTML



getImages = () ->
  chrome
    .tabs
    .query {active: true, currentWindow: true}, (tabs) ->
      currentTabId = tabs[0].id
      chrome.tabs.sendMessage currentTabId, {action: 'images'}, (images) ->
        createImagesList images



$ document
  .ready () ->

    getImages()

    $ 'ul.images'
      .delegate '> li', 'click', imageHover
      .delegate '> li', 'contextmenu', imageClick

    $ '#tag'
      .click () ->
        chrome.tabs.query {active: true, currentWindow: true}, (tabs) ->
          chrome.tabs.sendMessage tabs[0].id, {action: 'html'}, (html) ->
            urls = []
            e = $ 'div#images li[data-src] div.image.selected'
            for i in e
              src = $ i
                .parent()
                .attr 'data-path'
              urls.push src
            data =
              html: html
              image_urls: urls
            tag data


    $ '#skip'
      .click () ->
        tag skip: true



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
    console.log request, sender
    if typeof request.action isnt 'undefined'
      switch request.action
        when 'error'
          if typeof request.code isnt 'undefined' and typeof request.description isnt 'undefined'
            showError request.code, request.description
        when 'images'
          if typeof request.data isnt 'undefined'
            createImagesList request.data