var path = require('path'),
    fs = require('fs'),
    gulp = require('gulp'),
    gutil = require('gulp-util'),
    util = require('./util.js'),
    cfg = require('../config.js');

var Base = {};

// 缓存要压缩的文件
Base.concatList = [];
cfg.concat && cfg.concat.forEach(function(concat) {
    concat.src.forEach(function(file) {
        Base.concatList.push(cfg.baseDir + '/' + file);
    });
});

// copy files to buildDir exclude optimized files
Base.processWalk = function(file) {
    var extname = path.extname(file);
    var related = file.replace(cfg.baseDir, '');
    var out = cfg.buildDir + '/' + path.dirname(related);
    var fileType = {
        isCss: extname === '.css',
        isJs: extname === '.js',
        isLess: extname === '.less',
        isSass: extname === '.scss',
        isHtml: extname === '.html',
        isImage: util.isImageFile(extname)
    };

    if (fileType.isCss) {
        return Base.css(file, out);
    } else if (fileType.isJs) {
        return Base.js(file, out);
    } else if (fileType.isLess) {
        return Base.less(file, out);
    } else if (fileType.isSass) {
        return Base.sass(file, out);
    } else if (fileType.isImage) {
        return Base.imagemin(file, out);
    } else if (fileType.isHtml) {
        return Base.widget(file, out);
    } else {
        return Base.copy(file, out);
    }
};

Base.css = function(src, out) {
    var cssminify = require('gulp-minify-css');
    return gulp.src(src)
        .pipe(cfg.optimize ? cssminify({compatibility:'ie7'}) : gutil.noop())
        .pipe(gulp.dest(out));
};

Base.js = function(src, out) {
    var uglify = require('gulp-uglify');
    return gulp.src(src)
        .pipe(cfg.optimize ? uglify() : gutil.noop())
        .pipe(gulp.dest(out));
};

// combine less
Base.less = function(src, out) {
    var less = require('gulp-less'),
        autoprefixer = require('gulp-autoprefixer');
    return gulp.src(src)
        .pipe(less({
            compress: cfg.optimize
        }))
        .pipe(autoprefixer())
        .pipe(gulp.dest(out));
};

// combine sass
Base.sass = function(src, out) {
    var sass = require('gulp-sass'),
        autoprefixer = require('gulp-autoprefixer');
    return gulp.src(src)
        .pipe(sass())
        .pipe(autoprefixer())
        .pipe(cfg.optimize ? cssminify({compatibility:'ie7'}) : gutil.noop())
        .pipe(gulp.dest(out));
};

// combine widget
Base.widget = function(src, out) {
    var vm = require('./vm.js');
    return gulp.src(src)
        .pipe(vm(cfg.widget).on('error', gutil.log))
        .pipe(gulp.dest(out));
};

// imagemin
Base.imagemin = function(src, out) {
    var imagemin = require('gulp-imagemin'),
        pngquant = require('imagemin-pngquant');
    return gulp.src(src)
        .pipe(cfg.optimize ? imagemin({
            progressive: true,
            svgoPlugins: [{
                removeViewBox: false
            }],
            use: [pngquant()]
        }) : gutil.noop())
        .pipe(gulp.dest(out));
};

// copy file
Base.copy = function(src, out) {
    return gulp.src(src)
        .pipe(gulp.dest(out));
};

// given file is in concatList or not
Base.isConcatFile = function(src) {
    var result = false,
        arr = Base.concatList,
        i;
    for(i = 0; i < arr.length; i++) {
        if(src === path.resolve(arr[i])) {
            result = true;
            break;
        }
    }
    return result;
};

module.exports = Base;