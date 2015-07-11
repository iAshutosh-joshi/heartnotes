path = require('path')

fs = require 'fs'
gulp = require('gulp')
gutil = require 'gulp-util'
args = require('yargs').argv


options = 
  debugBuild: if args.debug then true else false
  dontExitOnError: false


if options.debugBuild
  console.log 'DEBUG mode'


# paths

paths =
  root: __dirname
  npm: path.join(__dirname, 'node_modules')
  src:
    stylus: path.join(__dirname, 'src', 'stylus')
    js: path.join(__dirname, 'src', 'js')
    img: path.join(__dirname, 'src', 'img')
    jade: path.join(__dirname, 'src', 'jade')
    fonts: path.join(__dirname, 'src', 'fonts')
    lib: path.join(__dirname, 'src', 'lib')
    ckeditor: path.join(__dirname, 'src', 'lib', 'ckeditor')
  build: 
    root: path.join(__dirname, 'build') 
    html: path.join(__dirname, 'build') 
    css: path.join(__dirname, 'build', 'css') 
    img: path.join(__dirname, 'build', 'img') 
    js: path.join(__dirname, 'build', 'js') 
    ckeditor: path.join(__dirname, 'build', 'ckeditor') 
    fonts: path.join(__dirname, 'build', 'fonts') 
    electron: path.join(__dirname, 'build-electron')
  files: {}
  watch: {}


# Stylus
paths.watch.stylus = path.join(paths.src.stylus, '**', '**', '*.styl')

# Img 
paths.files.img = path.join(paths.src.img, '**', '*.*')
paths.watch.img = paths.files.img

# Js
paths.files.js = path.join(paths.src.js, 'app.js')
paths.watch.js = path.join(paths.src.js, '**', '**', '**', '*.js')

# Jade
paths.files.jade = path.join(paths.src.jade, 'index.jade')
paths.watch.jade = path.join(paths.src.jade, '**', '**', '*.jade')



# initialisation
# 

# load all gulp tasks
tasksFolder = path.join(__dirname, 'gulp')
taskFiles = fs.readdirSync tasksFolder

for tf in taskFiles
  if '.coffee' isnt path.extname(tf)
    continue

  fn = require(path.join(tasksFolder, tf))
  taskInfo = fn(paths, options)

  handler = undefined
  deps = []

  if taskInfo.deps
    deps = taskInfo.deps
    handler = taskInfo.task
  else
    handler = taskInfo

  gulp.task path.basename(tf, '.coffee'), deps, handler


# default task
gulp.task 'default', ['dev']
