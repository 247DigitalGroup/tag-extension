current = {}

sendImages = (images) ->
	chrome.runtime.sendMessage action: 'images', data: images


getAllImages = () ->
	images = $ 'img'
		.map (i, e) ->
			return {
				depth: $(e).parents().length
				width: $(e).width()
				height: $(e).height()
				src: $(e).attr('src')
				path: $(e)[0].src
			}
	images = _.groupBy images, (o) ->
		if o.width * o.height > 120000 then return 'xlarge'
		if o.width * o.height > 50000 then return 'large'
		if o.width * o.height > 12000 then return 'medium'
		return 'small'
	images


scrollTo = (e) ->
	$ '.clicklion-checked'
		.removeClass 'clicklion-checked'
	$ e
		.addClass 'clicklion-checked'
	$ 'html, body'
		.stop()
		.animate {scrollTop: $(e).offset().top}, 200


findImage = (src) -> 
	scrollTo $("img[src='#{src}']")


syncTab = () ->
	chrome
		.runtime
		.sendMessage {action: 'tab.info'}, (info) ->
			console.log info
			if typeof info._id isnt 'undefined' and typeof info.url isnt 'undefined'
				current = info
				window.onbeforeunload = () -> 'Anti-redirect...'
				$ document
					.ready () ->
						chrome.runtime.sendMessage action: 'images', data: getAllImages()


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
						$ document
							.unbind 'ready'
							.bind 'ready', () ->
								sendResponse getAllImages()
				when 'show'
					if typeof request.src isnt 'undefined'
						findImage request.src
				when 'html'
					sendResponse document.documentElement.outerHTML