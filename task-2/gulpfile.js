'use strict';

const gulp          = require('gulp'),                // сборщик
      watch         = require('gulp-watch'),          // отслеживание изменения файлоф
      errorHandler  = require('gulp-error-handle'),   // обработчик ошибок
      gutil         = require('gulp-util'),           // логирование ошибок
      prefixer      = require('gulp-autoprefixer'),   // префиксер для поддержки старых браузеров
      uglify        = require('gulp-uglify'),         // минификация JS
      sass          = require('gulp-sass'),           // препроцессор CSS
      sourcemaps    = require('gulp-sourcemaps'),     // карта исходных файлов
      fileinclude   = require('gulp-file-include'),   // конкатинация файлоф
      cssmin        = require('gulp-clean-css'),      // минификация css
      rename        = require('gulp-rename'),         // переименование файла
      clean         = require('del'),                 // удаление файлов для очистки build
      run           = require('run-sequence'),        // поочерёдный запуск задач gulp
      serve         = require('browser-sync'),        // синхронизация с браузером
      gulpif        = require('gulp-if'),             // условный оператор для запуска разных задач
      webpack       = require('webpack'),
      webpackStream = require('webpack-stream'),
      reload        = serve.reload;

// Проверка переменной среды
function getNodeEnv (key) {
    return process.env.NODE_ENV == key;
}
const sync = 'serv';
const prod = 'production';

const logError = function(err) {
    gutil.log(err.toString(), '\n\b', err.codeFrame);
    this.emit('end');
};

var path = {
    build: {
        html:    'dist/',
        css:     'dist/css/',
        js:      'dist/js/',
        img:     'dist/img/',
        fonts:   'dist/fonts/',
        data:    'dist/data/' // модули, которые по каким-то причинам не нужно конкатинировать
    },
    src: {
        html:    'app/blocks/views/**/*.html',
        style:   'app/common/styles/*.@(scss|sass)',
        js:      'app/common/scripts/*.js',
        img:     'app/common/img/**/*.*',
        fonts:   'app/resources/fonts/**/*.*',
        data:    'app/resources/data/**/*.*'
    },
    watch: {
        html:    'app/blocks/**/*.html',
        style:   'app/**/*.scss',
        js:      'app/**/*.js',
        img:     'app/common/img/**/*.*',
        fonts:   'app/resources/fonts/**/*.*',
        data:    'app/resources/data/**/*.*'
    },
    clean: './dist'
};

// сборка HTML

gulp.task('html:build', function() {
    gulp.src(path.src.html)
        .pipe(fileinclude({
            basepath: 'app/'
        }))
        .pipe(gulp.dest(path.build.html))
        .pipe(gulpif(getNodeEnv(sync), reload({stream: true})));
});

// сборка CSS

gulp.task('css:build', function() {
    gulp.src(path.src.style)
        .pipe(sourcemaps.init())
        .pipe(sass({
            errLogToConsole: true
        }).on('error', sass.logError))
        .pipe(prefixer({
            browsers: ['last 4 versions'],
            cascade: false,
            remove: true
        }))
        .pipe(rename('style.min.css'))
        .pipe(gulp.dest(path.build.css))
        .pipe(gulpif(getNodeEnv(prod), cssmin()))
        .pipe(sourcemaps.write())
        .pipe(gulpif(getNodeEnv(prod), gulp.dest(path.build.css)))
        .pipe(gulpif(getNodeEnv(sync), reload({stream: true})));
});

// сборка JS

gulp.task('js:build', function() {
    return gulp.src(path.src.js)
        .pipe(errorHandler(logError))
        .pipe(webpackStream({
          output: {
            filename: 'main.js',
          },
          module: {
            rules: [
              {
                test: /\.(js)$/,
                loader: 'babel-loader',
                query: {
                  presets: ['env']
                }
              }
            ]
          }
        }))
        .pipe(gulpif(getNodeEnv(prod), uglify()))
        .pipe(gulpif(getNodeEnv(prod), rename({ suffix: '.min' })))
        .pipe(gulp.dest(path.build.js))
        .pipe(gulpif(getNodeEnv(sync), reload({stream: true})));
});

// сборка IMG

gulp.task('image:build', function() {
    return gulp.src(path.src.img)
        .pipe(gulp.dest(path.build.img))
        .pipe(gulpif(getNodeEnv(sync), reload({stream: true})));
});

// сборка FONTS

gulp.task('fonts:build', function() {
    gulp.src(path.src.fonts)
        .pipe(gulp.dest(path.build.fonts));
});

// перенос сторонних модулей

gulp.task('modules:build', function() {
    gulp.src(path.src.data)
        .pipe(gulp.dest(path.build.data));
});

// очистка папки build

gulp.task('clean', function() {
    return clean(path.clean);
});

/*  ============================================
    СБОРКА ПРОЕКТА
    ============================================ */

gulp.task('build', function(fn) {
    run(
        'clean',
        'html:build',
        'css:build',
        'js:build',
        'fonts:build',
        'image:build',
        'modules:build',
        fn);
});

/*  ============================================
    ЖИВОЕ ОТСЛЕЖИВАНИЕ ПРОЕКТА
    ============================================ */

gulp.task('watch', function() {
    gulp.watch([path.watch.html], function (e, cb) {
        gulp.start('html:build');
    });
    gulp.watch([path.watch.style], function (e, cb) {
        gulp.start('css:build');
    });
    gulp.watch([path.watch.js], function (e, cb) {
        gulp.start('js:build');
    });
    gulp.watch([path.watch.img], function (e, cb) {
        gulp.start('image:build');
    });
    gulp.watch([path.watch.fonts], function (e, cb) {
        gulp.start('fonts:build');
    });
    gulp.watch([path.watch.data], function (e, cb) {
        gulp.start('modules:build');
    });
});

/*  ============================================
    СЕРВЕР
    ============================================ */

gulp.task('server', function() {
    serve({
        server: {
            baseDir: './dist',
            index: 'index.html'
        },
        tunnel: false,
        host: 'localhost',
        logPrefix: 'Yandex task 2'
    });
});

/*  ============================================
    ЗАПУСК ПРОЕКТА
    ============================================ */

gulp.task('sync', ['build', 'watch'], function() {
    gulp.start('server');
});

gulp.task('default', ['build', 'watch']);