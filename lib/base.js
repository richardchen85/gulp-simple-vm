var path = require('path'),
    fs = require('fs-extra'),
    es = require('event-stream'),
    Q = require('q'),
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
        return Base.parseHtml(file, out);
    } else {
        return Base.copy(file, out);
    }
};

Base.css = function(src, out) {
    var cssminify = require('gulp-minify-css'),
        deferred = Q.defer();
    gulp.src(src)
        .pipe(cfg.optimize ? cssminify({compatibility:'ie7'}) : gutil.noop())
        .pipe(gulp.dest(out))
        .on('end', function() {
            deferred.resolve();
        });
    return deferred.promise;
};

Base.js = function(src, out) {
    var uglify = require('gulp-uglify'),
        deferred = Q.defer();
    gulp.src(src)
        .pipe(cfg.optimize ? uglify() : gutil.noop())
        .pipe(gulp.dest(out))
        .on('end', function() {
            deferred.resolve();
        });
    return deferred.promise;
};

Base.concat = function(obj) {
    var uglify = require('gulp-uglify'),
        sourcemap = require('gulp-sourcemaps'),
        cssminify = require('gulp-minify-css'),
        concat = require('gulp-concat'),
        deferred = Q.defer(),
        fileType = path.extname(obj.out),
        op = fileType === '.css' ? cssminify : uglify;
    gulp.src(obj.src)
        .pipe(obj.sourcemap ? sourcemap.init() : gutil.noop())
        .pipe(concat(obj.out))
        .pipe(cfg.optimize ? op({compatibility:'ie7'}) : gutil.noop())
        .pipe(obj.sourcemap ? sourcemap.write('.') : gutil.noop())
        .pipe(gulp.dest(cfg.buildDir))
        .on('end', function() {
            deferred.resolve();
        });
    return deferred.promise;
}

// combine less
Base.less = function(src, out) {
    var less = require('gulp-less'),
        autoprefixer = require('gulp-autoprefixer'),
        deferred = Q.defer();
    gulp.src(src)
        .pipe(less({
            compress: cfg.optimize
        }))
        .pipe(autoprefixer())
        .pipe(gulp.dest(out))
        .on('end', function() {
            deferred.resolve();
        });
    return deferred.promise;
    /*var less = require('less'),
        contents,
        deferred = Q.defer();
    if(!util.existsSync(src)) {
        throw new Error(src + ' dose not exist');
    }
    contents = String(fs.readFileSync(src));
    try {
        less.render(contents, {
            filename: path.basename(src),
            compress: cfg.optimize
        }, function (err, output) {
            if (err) {
                // Convert the keys so PluginError can read them
                err.lineNumber = err.line;
                err.fileName = err.filename;

                // Add a better error message
                err.message = err.message + ' in file ' + err.fileName + ' line no. ' + err.lineNumber;

                throw new Error('less error:\r\n' + err);
            } else {
                fs.outputFileSync(out + '/' + path.basename(src).replace('.less', '.css'), output.css);
                deferred.resolve();
            }
        });
    } catch (err) {
        throw new Error('less error:\r\n' + err);
    }
    return deferred.promise;*/
};

// combine sass
Base.sass = function(src, out) {
    var sass = require('gulp-sass'),
        autoprefixer = require('gulp-autoprefixer'),
        deferred = Q.defer();
    gulp.src(src)
        .pipe(sass())
        .pipe(autoprefixer())
        .pipe(cfg.optimize ? cssminify({compatibility:'ie7'}) : gutil.noop())
        .pipe(gulp.dest(out))
        .on('end', function() {
            deferred.resolve();
        });
    return deferred.promise;
    /*var sass = require('node-sass'),
        contents,
        deferred = Q.defer();
    if(!util.existsSync(src)) {
        throw new Error(src + ' dose not exist');
    }
    contents = String(fs.readFileSync(src));
    try {
        var result = sass.renderSync({
            data: contents,
            outputStyle: cfg.optimize ? 'compressed' : '',
            includePaths: [cfg.baseDir + '/' + cfg.cssDir]
        });
        if(result.css.toString() !== '') {
            fs.outputFileSync(out + '/' + path.basename(src).replace('.scss', '.css'), result.css);
        }
        deferred.resolve();
    } catch (err) {
        throw new Error('node sass error:\r\n' + err);
    }
    return deferred.promise;*/
};

// combine html with widgets
Base.parseHtml = function(src, out) {
    var deferred = Q.defer(),
        dest = path.resolve(out + '/' + path.basename(src));
    widget.init(src);
    Base.widgetStatic(widget.widgets)
        .then(function() {
            return widget.parseHtml(dest);
        })
        .then(function() {
            if(cfg.widget.combineStatic) Base.widgetConcat(widget);
            deferred.resolve();
        });
    return deferred.promise;
};

Base.widgetStatic = function(widgets) {
    var fileList = [],
        num,
        deferred = Q.defer();
    widgets.forEach(function(widget) {
        var src = path.join(cfg.widget.root, widget);
        fileList = fileList.concat(util.walk(path.resolve(src), ['.(vm|json)$']));
    });
    num = fileList.length;
    fileList.forEach(function(file) {
        Base.processWalk(file).then(function() {
            num--;
            num === 0 && deferred.resolve();
        });
    });
    return deferred.promise;
};

Base.widgetConcat = function(widget) {
    var deferred = Q.defer(),
        cssSrc = [],
        jsSrc = [];
    widget.widgets.forEach(function(w) {
        // 复制所有图片到cfg.imageDir
        var src = cfg.buildDir + cfg.widget.root.replace(cfg.baseDir, '') + '/' + w + '/' + cfg.imageDir
        if(util.existsSync(src)) {
            fs.copySync(src, cfg.buildDir + '/' + cfg.imageDir);
        }
    });
    cssSrc = widget.cssList.map(function(css) {
        return cfg.buildDir + css;
    });
    jsSrc = widget.jsList.map(function(js) {
        return cfg.buildDir + js;
    });
    Base.concat({
            src: cssSrc,
            out: cfg.cssDir + '/' +path.basename(widget.filePath).replace('.html', '.widget.css'),
            sourcemap: false
        })
        .then(function() {
            return Base.concat({
                src: jsSrc,
                out: cfg.jsDir + '/' + path.basename(widget.filePath).replace('.html', '.widget.js'),
                sourcemap: false
            });
        })
        .then(function() {
            deferred.resolve();
        });
    return deferred.promise;
};

// imagemin
Base.imagemin = function(src, out) {
    var imagemin = require('gulp-imagemin'),
        pngquant = require('imagemin-pngquant'),
        deferred = Q.defer();
    gulp.src(src)
        .pipe(cfg.optimize ? imagemin({
            progressive: true,
            svgoPlugins: [{
                removeViewBox: false
            }],
            use: [pngquant()]
        }) : gutil.noop())
        .pipe(gulp.dest(out))
        .on('end', function() {
            deferred.resolve();
        });
    return deferred.promise;
};

// copy file
Base.copy = function(src, out) {
    var deferred = Q.defer();
    gulp.src(src)
        .pipe(gulp.dest(out))
        .on('end', function() {
            deferred.resolve();
        });
    return deferred.promise;
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