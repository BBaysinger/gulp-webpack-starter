/**
* GULPFILE.JS
* - setting up a modern web development environment 
*/
var gulp = require('gulp');

/**
* Import gulp plugins
* - gulp-plumber (prevent pipe breaking coused by errors from gulp plugins)
* - gulp-concat (concatenate js files)
* - gulp-sass (SASS compiler)
* - gulp-notify (messages)
* - sourcemaps (maps CSS back to SASS files)
* - sassGlob (allow to use glob imports in scss files)
* - imageMin (minify image format - png, jpeg, gif and svn)
* - cleanCSS (css optimizer)
* - gulp-autoprefixer (add vendor prefixes to CSS rules)
* - gulp-browser-sync (create external link for browsing)
* - webpack-stream (adding webpack technology)
* - webpackconfig (webpack file with configuration)
*/
const plumber		= require('gulp-plumber');
const concat		= require('gulp-concat');
const dartSass		= require('sass');
const gulpSass		= require('gulp-sass');
const sourcemaps	= require('gulp-sourcemaps');
const sassGlob		= require('gulp-sass-glob');
const imageMin		= require('gulp-imagemin');
const cleanCSS		= require('gulp-clean-css');
const autoprefixer	= require('gulp-autoprefixer');
const browserSync	= require('browser-sync').create();
const del 			= require('del');
const notify		= require('gulp-notify');
const notifier		= require('node-notifier');

// Webpack config
const webpack 		= require('webpack-stream');
const webpackconfig	= require('./webpack.config.js');

// Set sass compiler. TODO: Use Node-SASS (faster)
const sass = gulpSass( dartSass );

// Task script
gulp.task('script', function(done){
	return gulp.src(['./src/components/main.js'], {since: gulp.lastRun('script')})
		.pipe(plumber({
			errorHandler: notify.onError("Error: <%= error.message %>")
		}))
		.pipe(webpack(webpackconfig), webpack)
		.pipe(gulp.dest('./dest/js'))
		.pipe(browserSync.stream())
		// .pipe(notify({message: "JS task completed!"}))
});

// Task style
gulp.task('sass', function() {
	// (BBaysinger) Putting style.scss in the `sass` directory gave an error with the update to SASS.
	// I had to move it out of the folder. But having styles out at the root level is a
	// paradigm I've worked with much in the past. It's a great default location for 
	// global styles in systems where all the other SASS is encapsulated. 
	return gulp.src(['./styles.scss', './sass/**/*.scss'], {since: gulp.lastRun('sass')})
		.pipe(plumber({
			errorHandler: notify.onError("Error: <%= error.message %>")
		}))
		.pipe(sourcemaps.init())
		.pipe(sassGlob())
		.pipe(sass({
			style: 'compressed',
			errLogToConsole: false,
			onError: function(error_message) {
				return notify().write(error_message);
			}
		}))
		.pipe(autoprefixer())
		.pipe(cleanCSS({
			compatibility: 'ie9',
			level: {
				1: {
					specialComments: 'all',
				}
			}
		}))
		.pipe(sourcemaps.write())
		.pipe(concat('style.css'))
		.pipe(gulp.dest('./dest/css'))
		.pipe(browserSync.stream())
		// .pipe(notify({message: "Style task completed!"}))
});

// Image task
gulp.task('image', function(){
	return gulp.src(['./images/**/*.+(png|jpg|jpeg|gif|svg|ico)'], {since: gulp.lastRun('image')})
		.pipe(plumber())
		.pipe(imageMin({
			progressive: true,
            interlaced: true,
            pngquant: true,
			verbose: true,
		}))
		.pipe(gulp.dest('./dest/images'))
		.pipe(browserSync.stream())
		// .pipe(notify({message: "Image task completed!"}))
});

// Static task
gulp.task('static', function(){
    return gulp.src('./static/**/*')
		// .pipe(notify({message: "Copying static files!"}))
        .pipe(gulp.dest('dest'));
});

// Clean dist task
gulp.task('clean', function(){
	return del('dest/**', {force:true});
});

// Notify that we're complete.
gulp.task('finish', function(){
	notifier.notify({ title: 'Build (default task).', message: 'Complete' });
	return Promise.resolve('the value is ignored');
});

// Clean 'dist' task
gulp.task('gulp:clean', gulp.series(['clean']));

// Static task
gulp.task('gulp:static', gulp.series(['static']));

// Script task
gulp.task('gulp:script', gulp.series(['script']));

// SASS task
gulp.task('gulp:sass', gulp.series(['sass']));

// Image task
gulp.task('gulp:image', gulp.series(['image']));

// Image task
gulp.task('gulp:finish', gulp.series(['finish']));

// Default task
gulp.task('default', gulp.series(['clean', 'static', 'script', 'sass', 'image', 'finish']))

// Serve task
// (BBaysinger) I renamed the task previously named 'build' to 'serve', since that's what it does.
// 'build' suggests more like what our default process is doing.
gulp.task('serve', function(){
	browserSync.init({
		server: "./dest",
		port: 3000,
		open: false,
	});
	gulp.watch('./src/components/**/*.js', gulp.series(['script']));
	gulp.watch('./sass/**/*.scss', gulp.series(['sass']));
	gulp.watch('./images/**/*.+(png|jpg|jpeg|gif|svg|ico)', gulp.series(['image']));
})

