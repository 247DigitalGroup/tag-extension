api = 
  root: 'http://192.168.1.17:8080'
  tag: '/articles/image_tagging'
  login: '/login'


doc = null
_images = []
tabInfo = {}


showError = () ->
	null


tag = (data) ->
	if typeof tabInfo._id isnt 'undefined' and typeof tabInfo.url isnt 'undefined'
		data._id = tabInfo._id
		data.url = tabInfo.url
	$.ajax
    url: api.root + api.tag
    method: 'post'
    dataType: 'json'
    data: data
    beforeSend: () ->
    	$ doc
    		.find '#loading'
    		.stop()
    		.fadeIn()
    complete: () ->
    	$ doc
    		.find '#loading'
    		.stop()
    		.fadeOut()
    success: (res, status, xhr) ->
      if typeof res isnt 'undefined' and typeof res.data isnt 'undefined'
        chrome.runtime.sendMessage action: 'tag', data: res.data
    error: (xhr, status, e) ->
      em = action: 'error', code: '0', description: ''
      switch xhr.status
        when 0
          showError 404, 'Could not connect to the Tree of Souls!'
        when 401
          showError 401, 'You are not one of us!'
      null
  null

scrollTo = (e) ->
	$ '.clicklion-checked, .clicklion-image'
		.removeClass 'clicklion-checked'
		.removeClass 'clicklion-image'
	$ e
		.addClass 'clicklion-checked clicklion-image'
	setTimeout () ->
			$ e
				.removeClass 'clicklion-checked'
				.removeClass 'clicklion-image'
		, 3000
	y = $(e).offset().top - ($(window).height() - $(e).height()) / 2
	$ 'html, body'
		.stop()
		.animate {scrollTop: y}, 200


findImage = (src) -> 
	scrollTo $("img[src=\"#{src}\"]")


addImage = (img, size) ->
	li = $ '<li data-src="' + img._src + '" data-path="' + img.path + '"><div class="image" style="background-image: url(' + img.src + ')"><p class="meta">' + img.w + 'x' + img.h + '</p></div></li>'
	$ doc
		.find 'ul.images#' + size
		.append $(li)


addImageXLarge = (img) -> addImage img, 'xlarge'
addImageLarge = (img) -> addImage img, 'large'
addImageMedium = (img) -> addImage img, 'medium'
addImageSmall = (img) -> addImage img, 'small'


getTabInfo = () ->
	chrome.runtime.sendMessage {action: 'tab.info'}, (info) ->
		if typeof info._id isnt 'undefined'
			tabInfo = info
			init()

getTabInfo()

init = () ->
	# markup-ing
	iframe = $ '<iframe id="clicklion-iframe"/>'
	html = '''
		<div id="loading"></div>
		<div class="buttons">
			<button id="tag">Tag</button>
			<button id="skip">Skip</button>
			<input type="checkbox" id="reveal"/>
		</div>
		<div class="selector">
			<h5>xlarge</h5>
			<ul class="images bg sp-0 sm-2" id="xlarge"></ul>
			<h5>large</h5>
			<ul class="images bg sp-0 sm-3" id="large"></ul>
			<h5 class="h">medium</h5>
			<ul class="images bg sp-0 sm-3 h" id="medium"></ul>
			<h5 class="h">small</h5>
			<ul class="images bg sp-0 sm-4 h" id="small"></ul>
		</div>
	'''
	# create the iframe
	$ iframe
		.css
			position: 'fixed'
			right: '20px'
			top: '20px'
			width: '400px'
			height: '500px'
			border: '3px solid rgba(0, 0, 0, .4)'
			'border-radius': '4px'
			'z-index': '999999999999'
		.appendTo 'body'
	# insert css into iframe
	doc = $ iframe
		.contents()
		.find 'head'
			.append $('<link rel="stylesheet" type="text/css" href="' + chrome.extension.getURL('/css/gia.ui.css') + '">')
			.append $('<link rel="stylesheet" type="text/css" href="' + chrome.extension.getURL('/css/iframe.css') + '">')
		.end()
		.find 'body'
	# bind image select and finding events
	$ doc
		.delegate 'li[data-src]', 'click', (e) ->
			src = $ e.currentTarget
				.attr 'data-src'
			findImage src
		.delegate 'li[data-src]', 'contextmenu', (e) ->
			e.preventDefault()
			src = $ e.currentTarget
				.attr 'data-src'
			findImage src
			image = $ e.currentTarget
				.find 'div.image'
			if $(image).hasClass 'selected'
				$ image
					.removeClass 'selected'
			else
				$ image
					.addClass 'selected'
	# append ui to iframe
	$ doc
		.append $(html)
	$ doc
		.find 'button#tag'
		.click () ->
			paths = []
			e = $ doc
				.find 'ul.images > li[data-path]'
			for i in [0 .. e.length - 1]
				if $(e[i]).find('> div.image').hasClass('selected')
					paths.push $(e[i]).attr('data-path')
			console.log paths
			# paths = _images.map (o) -> o.path
			data =
				image_urls: paths
				html: document.documentElement.outerHTML
			tag data
		.end()
		.find 'button#skip'
		.click () ->
			data =
				skip: true
			tag data
		.end()
	# window unload check
	window.onbeforeunload = () -> 'Anti-redirect...'
	# bind document init
	$ document
		.ready () ->
			$ doc
				.find '#loading'
				.stop()
				.fadeOut()
			$ 'img'
				.each (i, e) ->
					img = new Image()
					img.onload = () ->
						if img.width >= 320 and img.height >= 240
							_image = 
								w: img.width
								h: img.height
								_src: $(img).attr 'src'
								src: encodeURI($(img).attr 'src')
								path: img.src
							if _image.w * _image.h >= 153000 then return addImageXLarge _image
							if _image.w * _image.h >= 76800 then return addImageLarge _image
							if _image.w * _image.h > 12000 then return addImageMedium _image
							return addImageSmall _image
					img.src = $(e).attr 'src'