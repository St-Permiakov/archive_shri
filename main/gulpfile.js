const gulp = require('gulp');
// building
const fileinclude = require('gulp-file-include');
const sourcemaps = require('gulp-sourcemaps');
const sass = require('gulp-sass');
const prefixer = require('gulp-autoprefixer');
const cssmin = require('gulp-minify-css');
const imagemin = require('gulp-imagemin');
// building -- webpack
const webpack = require('webpack');
const webpackStream = require('webpack-stream');
const webpackConfig = require('./webpack.config.js');
// error handling
const plumber = require('gulp-plumber');
// utils
const watch = require('gulp-watch');
const del = require('del');
const rename = require('gulp-rename');
const flatten = require('gulp-flatten');
// server
const browserSync = require("browser-sync");
const reload = browserSync.reload;

const path = {
    src: {
        html: 'app/components/views/**/*.html',
        style: 'app/assets/css/*.scss',
        js: 'app/assets/js/*.js',
        img: 'app/assets/images/**/*.*',
        misc: 'app/resources/**/*.*'
    },
    watch: {
        html: 'app/components/**/*.html',
        style: 'app/**/*.scss',
        js: 'app/**/*.js',
        img: 'app/assets/images/**/*.*',
        misc: 'app/resources/**/*.*'
    },
    build: {
        html: 'dist',
        style: 'dist/assets/css/',
        js: 'dist/assets/js/',
        img: 'dist/assets/img/',
        misc: 'dist/resources/'
    }
};

const clean = function () {
    return del('dist');
};

gulp.task('html:build', () => {
    return gulp.src(path.src.html)
        .pipe(plumber())
        .pipe(flatten())
        .pipe(fileinclude({
            basepath: '@root',
            indent: true
        }))
        .pipe(gulp.dest(path.build.html))
        .pipe(reload({stream: true}));
});

gulp.task('css:build', () => {
    return gulp.src(path.src.style)
        .pipe(plumber())
        // .pipe(sourcemaps.init())
        .pipe(sass({
            outputStyle: 'expanded'
        }).on('error', sass.logError))
        .pipe(gulp.dest(path.build.style))
        .pipe(prefixer())
        .pipe(rename({suffix: '.min'}))
        .pipe(cssmin())
        // .pipe(sourcemaps.write())
        .pipe(gulp.dest(path.build.style))
        .pipe(reload({stream: true}));
});

gulp.task('js:build', () => {
    return gulp.src(path.src.js)
        .pipe(webpackStream(webpackConfig), webpack)
        .pipe(gulp.dest(path.build.js))
        .pipe(reload({stream: true}));
});

gulp.task('img:build', () => {
    return gulp.src(path.src.img)
        // .pipe(imagemin({ progressive: true, svgoPlugins: [{removeViewBox: false}], interlaced: true }))
        .pipe(gulp.dest(path.build.img))
        .pipe(reload({stream: true}));
});

gulp.task('resources:build', () => {
    return gulp.src(path.src.misc)
        .pipe(gulp.dest(path.build.misc));
});

// watch
gulp.task('watch', () => {
    gulp.watch(path.watch.html,  gulp.series('html:build'));
    gulp.watch(path.watch.style, gulp.series('css:build'));
    gulp.watch(path.watch.js,    gulp.series('js:build'));
    gulp.watch(path.watch.img,   gulp.series('img:build'));
    gulp.watch(path.watch.misc,   gulp.series('resources:build'));
});

// server
gulp.task('server', () => {
    browserSync({
        server: {
            baseDir: "./dist"
        },
        tunnel: false,
        host: 'localhost',
        port: 3000,
        logPrefix: "SHRI2018",
        browser: ["chrome.exe"]
    });
});

gulp.task('build', gulp.parallel('html:build', 'css:build', 'js:build', 'img:build', 'resources:build'));

gulp.task('default', gulp.series(clean, 'build', gulp.parallel('server', 'watch')));