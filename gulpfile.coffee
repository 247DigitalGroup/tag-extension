gulp = require 'gulp'
gutil  = require 'gulp-util'
minimist = require 'minimist'
nib = require 'nib'

plugins = require('gulp-load-plugins')({
		pattern: ['gulp-*', 'gulp.*']
		replaceString: /\bgulp[\-.]/
	})


basePaths =

	src: './src'
	dest: './www'
	bower: './bower_components'

paths =

	ignore:
		src: 'bower_components'

	img:
		src: basePaths.src + '/img/'
		dest: basePaths.dest + '/img/'

	html:
		src: basePaths.src
		dest: basePaths.dest
		jade: basePaths.src + '/**/*.jade'

	js:
		src: basePaths.src + '/js/'
		dest: basePaths.dest + '/js/'
		coffee: basePaths.src + '/js/**/*.coffee'

	css:
		src: basePaths.src + '/css/'
		dest: basePaths.dest + '/css/'
		stylus: basePaths.src + '/css/**/*.styl'

configs = 

	jade:
		pretty: true

	coffee:
		bare: false

	stylus:
		compress: false
		use: nib()
		import: 'nib'

	size:
		showFiles: true
		gzip: true

	clone:
		src: [
				"#{basePaths.src}/**/*"
				"!#{basePaths.src}/**/*.coffee"
				"!#{basePaths.src}/**/*.styl"
				"!#{basePaths.src}/**/*.jade"
			]

knowOptions =
	string: 'p',
	default: { p: 8080 }

options = minimist(process.argv.slice(2), knowOptions)

onChange = (e) ->
	gutil.log 'file', gutil.colors.cyan(e.path.replace(new RegExp('/.*(?=/' + basePaths.src + ')/'), '')), 'was', gutil.colors.magenta(e.type)

gulp.task 'jade', [], () ->
	gulp.src paths.html.jade
		.pipe plugins.jade(configs.jade).on('error', gutil.log)
		.pipe plugins.size(configs.size)
		.pipe plugins.connect.reload()
		.pipe gulp.dest(paths.html.dest)

gulp.task 'coffee', [], () ->
	gulp.src paths.js.coffee
		.pipe plugins.coffee(configs.coffee).on('error', gutil.log)
		.pipe plugins.size(configs.size)
		.pipe plugins.connect.reload()
		.pipe gulp.dest(paths.js.dest)

gulp.task 'stylus', [], () ->
	gulp.src paths.css.stylus
		.pipe plugins.stylus(configs.stylus).on('error', gutil.log)
		.pipe plugins.size(configs.size)
		.pipe plugins.connect.reload()
		.pipe gulp.dest(paths.css.dest)

gulp.task 'html', ['jade']
gulp.task 'js', ['coffee']
gulp.task 'css', ['stylus']

gulp.task 'clone', () ->
	gulp.src configs.clone.src
		.pipe plugins.size(configs.size)
		.pipe gulp.dest(basePaths.dest)

gulp.task 'connect', () ->
	plugins.connect.server({
		port: options.p
		root: './www',
		livereload: true
		})

gulp.task 'watch', [], () ->
	gulp.watch paths.html.jade, ['html']
		.on 'change', onChange
	gulp.watch paths.js.coffee, ['js']
		.on 'change', onChange
	gulp.watch paths.css.stylus, ['css']
		.on 'change', onChange
	gulp.watch configs.clone.src, ['clone']
		.on 'change', onChange

gulp.task 'default', () ->
	gutil.log gutil.colors.cyan('gulp compile') + ' to compile HTML, JS, CSS.'
	gutil.log gutil.colors.cyan('gulp watch') + ' to start watch on HTML, JS, CSS.'
	gutil.log gutil.colors.cyan('gulp server') + ' to start server on 8080 port.'
	gutil.log gutil.colors.cyan('gulp server -p 8888') + ' to start server on 8888 port.'

gulp.task 'compile', ['html', 'js', 'css', 'clone']
gulp.task 'server', ['compile', 'connect', 'watch']