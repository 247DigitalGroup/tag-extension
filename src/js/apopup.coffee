api = 
	root: 'http://192.168.1.17:8080'
	tag: '/articles/image_tagging'
	login: '/login'
tagging = false


angular.module 'ClickLionTagger', []

	.directive 'ngRightClick', ($parse) ->
		(scope, element, attrs) ->
			fn = $parse attrs.ngRightClick
			element.bind 'contextmenu', (e) ->
				scope.$apply () ->
						e.preventDefault()
						fn scope, $event: e

	
	.controller 'PopupController', ($scope) ->

		$scope.user =
			email: 'gia@coa.vn'
			password: 'gia.ninja'

		$scope.imgs = []
		$scope.selectedImgs = []
		$scope.error = null

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
						switch xhr.status
							when 0
								$scope.error = code: 404, description: 'Could not connect to the Tree of Souls!'
							when 401
								$scope.error = code: 401, description: 'You are not one of us!'
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
								switch xhr.status
									when 0
										$scope.error = code: 404, description: 'Could not connect to the Tree of Souls!'
									when 401
										$scope.error = code: 401, description: 'You are not one of us!'
								null
						null
			null

		openUrl = (data) ->
			if typeof data._id isnt 'undefined' and typeof data.url isnt 'undefined'
				message = action: 'open', _id: data._id, url: data.url
				chrome.runtime.sendMessage message
				$scope.imgs = []
				null

		calcSizes = () ->
			for img, i in $scope.imgs
				$ '<img/>'
					.attr 'src', img.path
					.load () ->
						if typeof $scope.imgs[i] isnt 'undefined'
							$scope.imgs[i].width = this.width
							$scope.imgs[i].height = this.height

		getImage = () ->
			chrome
				.tabs
				.query {active: true, currentWindow: true}, (tabs) ->
					currentTabId = tabs[0].id
					chrome.tabs.sendMessage currentTabId, {action: 'images'}, (images) ->
						$scope.imgs = images
						calcSizes()
						null
					null
			null

		getSelectedImages = () ->
			selected = _.filter $scope.imgs, (o) ->
				if typeof o.selected and o.selected is true then return true
				return false
			selected = _.map selected, (o) ->
				return o.path
			selected

		$scope.find = (img) ->
			chrome.tabs.query {active: true, currentWindow: true}, (tabs) ->
				chrome.tabs.sendMessage tabs[0].id, action: 'show', src: img.src
			null

		$scope.select = (img) ->
			if img.selected then img.selected = false else img.selected = true
			null

		$scope.check = () ->
			chrome.tabs.query {active: true, currentWindow: true}, (tabs) ->
				chrome.tabs.sendMessage tabs[0].id, {action: 'html'}, (html) ->
					urls = []
					data =
						html: html
						image_urls: getSelectedImages()
					tag data
			null

		$scope.skip = () ->
			tag skip: true
			null

		$scope.refresh = () ->
			getImage()
			null

		$scope.login = () ->
			console.log $scope.user
			false

		init = () ->
			chrome
				.runtime
				.onMessage
				.addListener (request, sender, sendResponse) ->
					if typeof request.action isnt 'undefined'
						switch request.action
							when 'error'
								if typeof request.code isnt 'undefined' and typeof request.description isnt 'undefined'
									$scope.error = code: request.code, description: request.description
							when 'images'
								if typeof request.data isnt 'undefined'
									$scope.imgs = request.data
									calcSizes()
					null

		$scope.init = () ->
			init()
			getImage()

		null