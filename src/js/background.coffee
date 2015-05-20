api = 
  root: 'http://192.168.1.17:8080'
  tag: '/articles/image_tagging'
  login: '/login'

current =
  _id: null
  url: null

tag = (data = null) ->

  if data isnt null
    data._id = current._id
    data.url = current.url

  console.log 'background::tag', data

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
          em.code = 404
          em.description = 'Could not connect to the Tree of Souls!'
        when 401
          em.code = 401
          em.description = 'You are not one of us!'
      chrome.runtime.sendMessage em
      null


openUrl = (data) ->
  if typeof data._id isnt 'undefined' and typeof data.url isnt 'undefined'
    current._id = data._id
    current.url = data.url
    message = action: 'open', _id: data._id, url: data.url
    chrome.tabs.query {active: true, currentWindow: true}, (tabs) ->
      chrome.tabs.sendMessage tabs[0].id, message
      null
    null

chrome
  .runtime
  .onMessage
  .addListener (request, sender, sendResponse) ->
    console.log 'background::received', request
    if sender.tab
      if typeof request.action isnt 'undefined'
        switch request.action
          when 'tag'
            typeof request.data isnt 'undefined' and tag request.data
    else
      if typeof request.action isnt 'undefined'
        switch request.action
          when 'start'
            tag()
          when 'skip'
            if current._id isnt null
              tag _id: current._id, skip: true
          when 'api'
            sendResponse api