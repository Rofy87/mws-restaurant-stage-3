var gulp = require('gulp');
var rename = require("gulp-rename");
var imageResize = require('gulp-image-resize');
var csso = require('gulp-csso');
var babel = require('gulp-babel');
var uglify = require('gulp-uglify');
var inlinesource = require('gulp-inline-source');
var babelify = require('babelify');
var browserify = require('browserify');
var source = require('vinyl-source-stream');
var buffer = require('vinyl-buffer');
var uglify = require('gulp-uglify');
var sourcemaps = require('gulp-sourcemaps');

gulp.task("resizeThumb", function () {
    gulp.src("./dev/img/*.*")
      .pipe(imageResize({ width : 400 , quality:0.7}))
      //.pipe(rename(function (path) { path.basename += "-thumbnail"; }))
      .pipe(gulp.dest("./images"));
});
gulp.task("resizeOrginal", function () {
    gulp.src("./dev/img/*.*")
        .pipe(imageResize({ width : 800 , quality:0.5}))
        .pipe(rename(function (path) { path.basename += "_800"; }))
        .pipe(gulp.dest("./images"));
});
 gulp.task('styles', function () {
    return gulp.src('./dev/css/*.css')
      .pipe(csso())
      .pipe(gulp.dest('./css'))
  });

  gulp.task('inline', function() {
    return gulp.src('./dev/html/*.html')
    .pipe(inlinesource())
    .pipe(gulp.dest('./'));
   });

   gulp.task('scripts:main', function() {
    browserify(['dev/js/register_sw.js','./dev/js/dbhelper.js', './dev/js/main.js'])
      .transform(babelify.configure({
        presets: ['env']
      }))
      .bundle()
      .pipe(source('main_bundle.js'))
      .pipe(buffer())
      .pipe(sourcemaps.init())
      .pipe(uglify())
      .pipe(sourcemaps.write('maps')) 
      .pipe(gulp.dest('./js'));
  });
  gulp.task('scripts:rest', function() {
    browserify(['./dev/js/dbhelper.js', './dev/js/restaurant_info.js'])
      .transform(babelify.configure({
        presets: ['env']
      }))
      .bundle()
      .pipe(source('restaurant_bundle.js'))
      .pipe(buffer())
      .pipe(sourcemaps.init())
      .pipe(uglify())
      .pipe(sourcemaps.write('maps')) 
      .pipe(gulp.dest('./js'));
  });
  gulp.task('scripts:sw', function() {
    browserify(['./dev/sw.js'])
      .transform(babelify.configure({
        presets: ['env']
      }))
      .bundle()
      .pipe(source('sw.js'))
      .pipe(buffer())
      .pipe(sourcemaps.init())
      .pipe(uglify())
      .pipe(sourcemaps.write('maps')) 
      .pipe(gulp.dest('./'));
  });
gulp.task('default', ['resizeOrginal', 'resizeThumb','styles' , 'scripts']);
gulp.task('watch', function(){
    gulp.watch('./dev/img/*.*', ['resizeOrginal','resizeThumb']); 
    gulp.watch('./dev/css/*.css', ['styles','inline']); 
    gulp.watch([ './dev/sw.js','./dev/js/*.js'], ['scripts:main','scripts:rest','scripts:sw']);
    gulp.watch('./dev/html/*.html',['inline']);
  })

