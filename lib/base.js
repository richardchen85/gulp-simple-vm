var path = require('path'),
    fs = require('fs'),
    gulp = require('gulp'),
    gutil = require('gulp-util'),
    util = require('./util.js'),
    cfg = require('../config.js');

var Base = {};

// 缓存要压缩的文件
Base.concatList = [];
cfg.concat && cfg.concat.forEach(function(obj) {
    obj.src.forEach(function(f) {
        Base.concatList.push(cfg.baseDir + '/' + f);
    });
});

// copy files to buildDir exclude optimized files
Base.processWalk = function(file) {
    var extname = path.extname(file);
    var related = file.replace(cfg.baseDir, '');
    var out = cfg.buildDir + '/' + path.dirname(related);

    if (extname == '.css') {
        return Base.compressFile(file, out, 'css');
    } else if (extname == '.js') {
        return Base.compressFile(file, out, 'js');
    } else if (util.isImageFile(extname)) {
        return Base.compressFile(file, out, 'image');
    } else {
        return Base.compressFile(file, out);
    }
}

// 执行文件压缩操作，如果不指定文件类型仅复制文件
Base.compressFile = function(src, out, fileType) {
    var imagemin = require('gulp-imagemin'),
        pngquant = require('imagemin-pngquant'),
        uglify = require('gulp-uglify'),
        cssminify = require('gulp-minify-css');

    switch (fileType) {
        case 'image':
            return gulp.src(src)
                .pipe(cfg.optimize ? imagemin({
                    progressive: true,
                    svgoPlugins: [{
                        removeViewBox: false
                    }],
                    use: [pngquant()]
                }) : gutil.noop())
                .pipe(gulp.dest(out));
            break;
        case 'js':
            return gulp.src(src)
                .pipe(cfg.optimize ? uglify(cfg.optimizeConfig) : gutil.noop())
                .pipe(gulp.dest(out));
            break;
        case 'css':
            return gulp.src(src)
                .pipe(cfg.optimize ? cssminify(cfg.optimizeConfig) : gutil.noop())
                .pipe(gulp.dest(out));
            break;
        case 'html':
            return gulp.src(src)
                .pipe(gulp.dest(out));
            break;
        default:
            return gulp.src(src)
                .pipe(gulp.dest(out));
            break;
    };
}

// given file is in concatList or not
Base.isConcatFile = function(src) {
    var result = false;
    Base.concatList.forEach(function(cnt) {
        cnt = path.resolve(cnt);
        if (src.indexOf(cnt) >= 0) {
            result = true;
            return;
        }
    });
    return result;
}

module.exports = Base;