aim = (e) ->
	$ '*'
		.removeClass 'cl-in-aim'
	$ e.target
		.addClass 'cl-in-aim'
	null

clean = (e) ->
	if $(e.target).attr('class').indexOf('clicklion-') >= 0
		return null
	$ e.target
		.remove()
	e.stopPropagation()
	e.preventDefault()
	null

enterCleanMode = () ->
	cleanButton.addClass 'clicklion-active'
	$ '*'
		.removeClass 'cl-in-aim'
		.on 'mouseover', aim
		.on 'click', clean
	null

exitCleanMode = () ->
	cleanButton.removeClass 'clicklion-active'
	$ '*'
		.removeClass 'cl-in-aim'
		.off 'mouseover', aim
		.off 'click', clean
	null

onCleanMode = no

checked = {}
tagButton = $ '<span class="clicklion-button">Submit</span>'
	.click () ->
		data =
			html: document.documentElement.outerHTML
			image_urls: Object.keys checked
			note: ''
		chrome.runtime.sendMessage {action: 'tag', data: data}

cleanButton = $ '<span class="clicklion-button">Clean</span>'
	.click () ->
		if onCleanMode
			exitCleanMode()
			onCleanMode = false
		else
			enterCleanMode()
			onCleanMode = true

toolbar = $ '<div class="clicklion-toolbar"></div>'
$ toolbar
	.append tagButton
	.append cleanButton

check = (e) ->
	if e.altKey is false
		e.preventDefault()
		src = $(@).attr('src')
		if typeof checked[src] is 'undefined'
			checked[src] = true
			$(@).addClass 'clicklion-checked'
		else
			delete checked[src]
			$(@).removeClass 'clicklion-checked'


# if window.location.hash.search('#clicklion') >= 0
if true
	$ document
		.delegate 'img', 'contextmenu', check
	$ 'body'
		.append toolbar

chrome
	.runtime
	.onMessage
	.addListener (request, sender, sendResponse) ->
		console.log 'content::received', request
		if typeof request.action isnt 'undefined'
			switch request.action
				when 'open'
					if typeof request.url isnt 'undefined'
						window.location = "#{request.url}"