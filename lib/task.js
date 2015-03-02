/**
 * @regist gulp's tasks
 */

var path = require('path'),
    del = require('del'),
    fs = require('fs'),
    minimist = require('minimist'),
    concat = require('gulp-concat'),
    cssminify = require('gulp-minify-css'),
    rename = require('gulp-rename'),
    gutil = require('gulp-util'),
    util = require('./util.js');

var gulp,
    cfg,
    concatList = []; // 需要合并的文件先存储到数组

module.exports = function(_gulp, _cfg) {
    gulp = _gulp;
    cfg = _cfg;

    
    cfg.concat && cfg.concat.forEach(function(cnct) {
        cnct.src.forEach(function(f) {
            concatList.push(cfg.BASE_DIR + '/' + f);
        });
    });

    optimizeTasks();
    devTasks();
};

// 优化代码的task，包括 less, imagemin, concat, requirejs, velocity
function optimizeTasks() {
    // less compile
    gulp.task('less', function() {
        var less = require('gulp-less'),
            autoprefixer = require('gulp-autoprefixer'),
            files = cfg.less.files,
            realDir = cfg.BASE_DIR + '/' + cfg.less.dir + '/',
            outDir = cfg.BUILD_DIR + '/' + cfg.cssDir + '/';

        files.forEach(function(file) {
            gulp.src(realDir + file)
                .pipe(less({
                    compress: cfg.optimize
                }).on('error', gutil.log))
                .pipe(autoprefixer())
                .pipe(gulp.dest(outDir + path.dirname(file)));
        });
    });

    // imagemin
    gulp.task('imagemin', function() {
        optimizeImage(cfg.BASE_DIR + '/**', cfg.BUILD_DIR);
    });

    // concat js and css
    gulp.task('concat', function() {
        var uglify = require('gulp-uglify'),
            sourcemap = require('gulp-sourcemaps'),
            cssminify = require('gulp-minify-css');

        cfg.concat.forEach(function(cnct) {
            var fileType = path.extname(cnct.out);
            var src = [];
            var op = uglify;

            cnct.src.forEach(function(f) {
                src.push(cfg.BASE_DIR + '/' + f);
            });

            if (fileType == '.css') {
                op = cssminify;
            }
            gulp.src(src)
                .pipe(cnct.sourcemap ? sourcemap.init() : gutil.noop())
                .pipe(concat(cnct.out))
                .pipe(cfg.optimize ? op() : gutil.noop())
                .pipe(cnct.sourcemap ? sourcemap.write('.') : gutil.noop())
                .pipe(gulp.dest(cfg.BUILD_DIR));
        });
    });

    // requirejs optimizer
    gulp.task('requirejs', function() {
        var rjs = require('requirejs'),
            build;

        // r.js需要的配置项
        // 用clone方式，因为r.js会修改配置项
        build = util.clone(cfg.requirejs);
        // 修改输出目录
        build.dir = cfg.BUILD_DIR + '/' + cfg.jsDir;
        // 修改r.js的压缩选项
        build.optimize = cfg.optimize ? build.optimize : '';

        rjs.optimize(build, function() {
            // 删除r.js生成的build.txt
            del(build.dir + '/build.txt');
        });
    });

    // render velocity
    gulp.task('vm', function() {
        var rename = require('gulp-rename'),
            vm = require('gulp-velocityjs'),
            vmCfg = cfg.velocity,
            files = vmCfg.watchList;

        files.forEach(function(file) {
            var absPath = vmCfg.config.root + file.src;
            if (fs.existsSync(absPath)) {
                gulp.src(absPath)
                    .pipe(vm(vmCfg.config).on('error', gutil.log))
                    .pipe(rename(file.out))
                    .pipe(gulp.dest(cfg.BUILD_DIR + '/' + cfg.htmlDir));
            }
        });
    });
}

// 布署用的tasks，包括 clean, watch, livereload, express, server, build, deploy
function devTasks() {
    // clean
    gulp.task('clean', function(cb) {
        del([cfg.BUILD_DIR], cb);
    });

    // watch
    gulp.task('watch', function() {
        // watch less
        if(cfg.less) {
            gulp.watch(cfg.BASE_DIR + '/' + cfg.less.dir + '/**/*.less', ['less']);
        }

        // watch requirejs
        if(cfg.requirejs) {
            gulp.watch(cfg.BASE_DIR + '/' + cfg.requirejs.appDir + '/**/*.js', ['requirejs']);
        }

        // watch velocity
        if(cfg.velocity) {
            gulp.watch(cfg.velocity.dir + '/**', ['vm']);
        }

        // watch image
        gulp.watch(cfg.BASE_DIR + '/' + cfg.imageDir + '/**', function(file) {
            var related = file.path.replace(path.resolve(cfg.BASE_DIR), '');
            if (file.type == 'changed' || file.type == 'added') {
                optimizeImage(file.path, cfg.BUILD_DIR + '/' + path.dirname(related));
            } else {
                del(cfg.BUILD_DIR + '/' + related);
            }
        });

        // watch js
        gulp.watch(cfg.BASE_DIR + '/' + cfg.jsDir + '/**', function(file) {
            var related = file.path.replace(path.resolve(cfg.BASE_DIR), '');
            if(isConcatFile(file.path)) {
                gulp.start('concat');
            } else if (file.type == 'changed' || file.type == 'added') {
                optimizeJS(file.path, cfg.BUILD_DIR + '/' + path.dirname(related));
            } else {
                del(cfg.BUILD_DIR + '/' + related);
            }
        });

        // watch css
        gulp.watch(cfg.BASE_DIR + '/' + cfg.cssDir + '/**', function(file) {
            var related = file.path.replace(path.resolve(cfg.BASE_DIR), '');
            if(isConcatFile(file.path)) {
                gulp.start('concat');
            } else if (file.type == 'changed' || file.type == 'added') {
                optimizeCss(file.path, cfg.BUILD_DIR + '/' + path.dirname(related));
            } else {
                del(cfg.BUILD_DIR + '/' + related);
            }
        });

        // watch html
        gulp.watch(cfg.BASE_DIR + '/' + cfg.htmlDir + '/**/*.html', function(file) {
            var related = file.path.replace(path.resolve(cfg.BASE_DIR), '');
            if (file.type == 'changed' || file.type == 'added') {
                optimizeHtml(file.path, cfg.BUILD_DIR + '/' + path.dirname(related));
            } else {
                del(cfg.BUILD_DIR + '/' + related);
            }
        });
    });

    // livereload
    gulp.task('livereload', function() {
        var livereload = require('gulp-livereload');

        livereload.listen(cfg.lrPort);
        gulp.watch(cfg.BUILD_DIR + '/**', function(file) {
            livereload.changed(file.path, cfg.lrPort);
        });
    });

    // express for http server
    gulp.task('express', function() {
        var express = require('express'),
            openurl = require('./openurl.js'),
            url = 'http://' + util.getIp() + ':' + cfg.appPort + '/' + cfg.homePage;
        var app = express();

        app.use(express.static('build'));
        app.listen(cfg.appPort);

        gutil.log(gutil.colors.green('http server started at ' + url));
        openurl.open(url);
    });

    // 开启express任务，并启动livereload, watch
    // e.g.
    //   -[o|optimize]: optimize
    gulp.task('server', function() {
        var tasks = ['express', 'watch', 'livereload'];
        var argv = minimist(process.argv.slice(2));
        if(argv.o || argv.optimize) {
            cfg.optimize = true;
        }
        gulp.start(tasks);
    });

    // build this project
    gulp.task('build', ['clean'], function() {
        var tasks = ['less'],
            fileList = [],
            exclude = ['gitignore', cfg.less.dir];

        var argv = minimist(process.argv.slice(2));
        if(argv.o || argv.optimize) {
            cfg.optimize = true;
        }
        if (cfg.requirejs) {
            tasks.push('requirejs');
            exclude.push(cfg.requirejs.appDir);
        }
        if (cfg.concat) {
            tasks.push('concat');
            exclude = exclude.concat(concatList);
        }
        if (cfg.velocity) {
            tasks.push('vm');
            exclude.push(cfg.velocity.dir);
        }
        fileList = util.walk(cfg.BASE_DIR, exclude);
        //gutil.log(gutil.colors.yellow('exclude ' + exclude.toString()));
        gulp.start(tasks);
        fileList.forEach(function(file) {
            processWalk(file);
        });
    });

    // deploy: copy files to dir named by version
    gulp.task('deploy', function() {
        var argv = minimist(process.argv.slice(2));
        var date = new Date();
        var vDir = [
                'v',
                date.getFullYear(),
                date.getMonth() + 1,
                date.getDate(),
                argv.v
            ].join('');

        gulp.src([cfg.BUILD_DIR + '/**', '!' + cfg.BUILD_DIR + '/**/*.html'])
            .pipe(gulp.dest(vDir));

        gutil.log(gutil.colors.green('deploy complete...'));
    });
}

// copy files to BUILD_DIR exclude optimized files
function processWalk(file) {
    var extname = path.extname(file);
    var related = file.replace(cfg.BASE_DIR, '');

    switch(extname) {
        case '.css':
            optimizeCss(file, cfg.BUILD_DIR + '/' + path.dirname(related));
            break;
        case '.js':
            optimizeJS(file, cfg.BUILD_DIR + '/' + path.dirname(related));
            break;
        default:
            if(util.isImageFile(extname)) {
                optimizeImage(file, cfg.BUILD_DIR + '/' + path.dirname(related));
            } else {
                gulp.src(file)
                    .pipe(gulp.dest(cfg.BUILD_DIR + '/' + path.dirname(related)));
            }
    }
}

// optimize images by imagemin
function optimizeImage(src, out) {
    var imagemin = require('gulp-imagemin'),
        pngquant = require('imagemin-pngquant');

    gulp.src(src)
        .pipe(cfg.optimize ? imagemin({
            progressive: true,
            svgoPlugins: [{
                removeViewBox: false
            }],
            use: [pngquant()]
        }) : gutil.noop())
        .pipe(gulp.dest(out));
}

// optimize javascript
function optimizeJS(src, out) {
    var uglify = require('gulp-uglify');

    gulp.src(src)
        .pipe(cfg.optimize ? uglify() : gutil.noop())
        .pipe(gulp.dest(out));
}

// optimize css
function optimizeCss(src, out) {
    var cssminify = require('gulp-minify-css');

    gulp.src(src)
        .pipe(cfg.optimize ? cssminify() : gutil.noop())
        .pipe(gulp.dest(out));
}

// optimize html
function optimizeHtml(src, out) {
    gulp.src(src)
        .pipe(gulp.dest(out));
}

// given file is in concatList or not
function isConcatFile(src) {
    var result = false;
    concatList.forEach(function(cnt) {
        cnt = path.resolve(cnt);
        if(src.indexOf(cnt) >= 0) {
            result = true;
            return;
        }
    });
    return result;
}
