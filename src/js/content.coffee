current = {}

sendImages = (images) ->
	chrome.runtime.sendMessage action: 'images', data: images


getAllImages = () ->
	images = jQuery 'img'
		.map (i, e) ->
			return {
				depth: jQuery(e).parents().length
				width: jQuery(e).width()
				height: jQuery(e).height()
				src: jQuery(e).attr('src')
				path: jQuery(e)[0].src
			}
	images = _.groupBy images, (o) ->
		if o.width * o.height > 120000 then return 'xlarge'
		if o.width * o.height > 50000 then return 'large'
		if o.width * o.height > 12000 then return 'medium'
		return 'small'
	images


scrollTo = (e) ->
	jQuery '.clicklion-checked, .clicklion-image'
		.removeClass 'clicklion-checked'
		.removeClass 'clicklion-image'
	jQuery e
		.addClass 'clicklion-checked clicklion-image'
	
	setTimeout () ->
			jQuery e
				.removeClass 'clicklion-checked'
				.removeClass 'clicklion-image'
		, 3000

	y = jQuery(e).offset().top - (jQuery(window).height() - jQuery(e).height()) / 2
	jQuery 'html, body'
		.stop()
		.animate {scrollTop: y}, 200


findImage = (src) -> 
	scrollTo jQuery("img[src=\"#{src}\"]")


syncTab = () ->
	chrome
		.runtime
		.sendMessage {action: 'tab.info'}, (info) ->
			console.log info
			if typeof info._id isnt 'undefined' and typeof info.url isnt 'undefined'
				current = info
				window.onbeforeunload = () -> 'Anti-redirect...'
				jQuery document
					.ready () ->
						chrome.runtime.sendMessage action: 'images', data: getAllImages()


showAll = (reveal = true) ->
	if reveal
		revealCSS =
			'display': 'block'
			'overflow': 'visible'
			'position': 'initial'
			'visibility': 'visible'
			'opacity': 1
			'float': 'none'
			# 'height': 'auto'
			# 'max-width': 'none'
			# 'max-height': 'none'
			# 'min-width': 'none'
			# 'min-height': 'none'
		jQuery 'img'
			.addClass 'clicklion-reveal'
			.each (i, e) ->
				jQuery e
					# .css revealCSS
					.addClass 'clicklion-reveal'
					.parents()
					# .css revealCSS
					.addClass 'clicklion-reveal'
	else
		jQuery '.clicklion-reveal'
			.removeClass 'clicklion-reveal'


syncTab()


chrome
	.runtime
	.onMessage
	.addListener (request, sender, sendResponse) ->
		console.log 'content::received', request
		if typeof request.action isnt 'undefined'
			switch request.action
				when 'images'
					if document.readyState is 'complete'
						sendResponse getAllImages()
					else
						jQuery document
							.unbind 'ready'
							.bind 'ready', () ->
								sendResponse getAllImages()
				when 'show'
					if typeof request.src isnt 'undefined'
						findImage request.src
				when 'html'
					sendResponse document.documentElement.outerHTML
				when 'reveal'
					showAll true
				when 'unreveal'
					showAll false