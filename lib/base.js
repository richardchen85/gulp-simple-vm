var path = require('path'),
    fs = require('fs'),
    es = require('event-stream'),
    gulp = require('gulp'),
    gutil = require('gulp-util'),
    util = require('./util.js'),
    widget = require('./widget.js'),
    cfg = require('../config.js');

var Base = {};

// 缓存要压缩的文件
Base.concatList = [];
cfg.concat && cfg.concat.forEach(function(concat) {
    concat.src.forEach(function(file) {
        Base.concatList.push(path.resolve(cfg.baseDir + '/' + file));
    });
});

// copy files to buildDir exclude optimized files
Base.processWalk = function(file) {
    var extname = path.extname(file),
        related = file.replace(path.resolve(cfg.baseDir), ''),
        out = cfg.buildDir + '/' + path.dirname(related),
        htmlDir = path.resolve(cfg.baseDir + '/' + cfg.htmlDir),
        vmDir = path.resolve(cfg.widget.root);
    var fileType = {
        isCss: extname === '.css',
        isJs: extname === '.js',
        isLess: extname === '.less',
        isSass: extname === '.scss',
        isHtml: extname === '.html' && file.indexOf(htmlDir) > -1,
        isWidget: file.indexOf(vmDir) > -1,
        isImage: util.isImageFile(extname)
    };

    if(fileType.isWidget) {
        if(extname === '.vm' || extname === '.json') {

        }
    } else if (fileType.isCss) {
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
        return Base.parseHtml(file, out);
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

// combine html with widgets
Base.parseHtml = function(src, out) {
    var dist = path.resolve(out + '/' + path.basename(src));
    widget.parseHtml(src, dist);
    return Base.copy(dist, out);
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