/**
 * @regist gulp's tasks
 */

var path = require('path'),
    del = require('del'),
    fs = require('fs'),
    Q = require('q'),
    minimist = require('minimist'),
    gutil = require('gulp-util'),
    util = require('./util.js');

var gulp,
    cfg,
    concatList = []; // 需要合并的文件先存储到数组

module.exports = function(_gulp, _cfg) {
    gulp = _gulp;
    cfg = _cfg;

    cfg.concat && cfg.concat.forEach(function(obj) {
        obj.src.forEach(function(f) {
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
            deferred = Q.defer(),
            files = cfg.less.files,
            num = files.length;

        var realDir = cfg.BASE_DIR + '/' + cfg.less.dir + '/',
            outDir = cfg.BUILD_DIR + '/' + cfg.cssDir + '/';

        files.forEach(function(file) {
            gulp.src(realDir + file)
                .pipe(less({
                    compress: cfg.optimize
                }).on('error', gutil.log))
                .pipe(autoprefixer())
                .pipe(gulp.dest(outDir + path.dirname(file)))
                .on('end', function() {
                    num--;
                    if(num === 0) {
                        deferred.resolve();
                    }
                });
        });
        return deferred.promise;
    });

    // imagemin
    gulp.task('imagemin', function() {
        return compressFile(cfg.BASE_DIR + '/**', cfg.BUILD_DIR, 'image');
    });

    // concat js and css
    gulp.task('concat', function() {
        var uglify = require('gulp-uglify'),
            sourcemap = require('gulp-sourcemaps'),
            cssminify = require('gulp-minify-css'),
            concat = require('gulp-concat'),
            deferred = Q.defer(),
            num = cfg.concat.length;

        cfg.concat.forEach(function(obj) {
            var fileType = path.extname(obj.out);
            var src = [];
            var op = uglify;

            obj.src.forEach(function(f) {
                src.push(cfg.BASE_DIR + '/' + f);
            });

            if (fileType == '.css') {
                op = cssminify;
            }
            gulp.src(src)
                .pipe(obj.sourcemap ? sourcemap.init() : gutil.noop())
                .pipe(concat(obj.out))
                .pipe(cfg.optimize ? op() : gutil.noop())
                .pipe(obj.sourcemap ? sourcemap.write('.') : gutil.noop())
                .pipe(gulp.dest(cfg.BUILD_DIR))
                .on('end', function() {
                    num--;
                    if(num === 0) {
                        deferred.resolve();
                    }
                });
        });

        return deferred.promise;
    });

    // requirejs optimizer
    gulp.task('requirejs', function() {
        var rjs = require('requirejs'),
            deferred = Q.defer(),
            build;

        // r.js需要的配置项
        // 用clone方式，因为r.js会修改配置项
        build = util.clone(cfg.requirejs);
        // 修改输出目录
        build.dir = cfg.BUILD_DIR + '/' + cfg.requirejs.dir;
        // 修改r.js的压缩选项
        build.optimize = cfg.optimize ? build.optimize : '';

        rjs.optimize(build, function() {
            // 删除r.js生成的build.txt
            del(build.dir + '/build.txt', function() {
                deferred.resolve();
            });
        });

        return deferred.promise;
    });

    // render velocity
    gulp.task('vm', function() {
        var rename = require('gulp-rename'),
            vm = require('gulp-velocityjs'),
            deferred = Q.defer(),
            vmCfg = cfg.velocity,
            num = vmCfg.watchList.length;

        vmCfg.watchList.forEach(function(obj) {
            var absPath = vmCfg.config.root + obj.src;
            gulp.src(absPath)
                .pipe(vm(vmCfg.config).on('error', gutil.log))
                .pipe(rename(obj.out))
                .pipe(gulp.dest(cfg.BUILD_DIR + '/' + cfg.htmlDir))
                .on('end', function() {
                    num--;
                    if(num === 0) {
                        deferred.resolve();
                    }
                });
        });

        return deferred.promise;
    });
}

// 布署用的tasks，包括 clean, watch, livereload, server, build, deploy
function devTasks() {
    // clean
    gulp.task('clean', function(cb) {
        del([cfg.BUILD_DIR], cb);
    });

    // watch
    gulp.task('watch', function() {
        var nodeWatch = require('node-watch'),
            lessDir = path.resolve(cfg.BASE_DIR + '/' + cfg.less.dir),
            requirejsDir = path.resolve(cfg.requirejs.appDir),
            vmDir = path.resolve(cfg.velocity.dir);

        // gulp.watch删除目录会报错，用node-watch替换
        nodeWatch(cfg.BASE_DIR, function(filename) {
            var filename = path.resolve(filename),
                related = filename.replace(path.resolve(cfg.BASE_DIR), ''),
                extname = path.extname(filename),
                out = cfg.BUILD_DIR + '/' + path.dirname(related);

            // 如果是目录操作，直接跳过
            if(extname == '') return;

            if(filename.indexOf(lessDir) > -1) {
                gulp.start('less');
            } else if (filename.indexOf(requirejsDir) > -1) {
                gulp.start('requirejs');
            } else if (filename.indexOf(vmDir) > -1) {
                gulp.start('vm');
            } else if (isConcatFile(filename)) {
                gulp.start('concat');
            } else if (util.existsSync(filename)) {
                if (util.isImageFile(extname)) {
                    compressFile(filename, out, 'image');
                } else if (extname == '.js') {
                    compressFile(filename, out, 'js');
                } else if (extname == '.css') {
                    compressFile(filename, out, 'css');
                } else if (extname == '.html') {
                    compressFile(filename, out, 'html');
                } else {
                    compressFile(filename, out);
                }
            }
        });
    });

    // livereload
    gulp.task('livereload', function() {
        var livereload = require('gulp-livereload');

        livereload.listen(cfg.lrPort);
        gulp.watch(cfg.BUILD_DIR + '/**', function(filename) {
            livereload.changed(filename, cfg.lrPort);
        });
    });

    // 开启http服务，并启动livereload, watch
    // args:
    //   -[o|optimize]: optimize
    //   -[b|browser]: auto open browser
    gulp.task('server', ['build'], function() {
        var express = require('express'),
            openurl = require('./openurl.js'),
            url = 'http://' + util.getIp() + ':' + cfg.appPort + '/' + cfg.homePage,
            argv = minimist(process.argv.slice(2));

        var app = express();
        app.use(express.static('build'));
        app.listen(cfg.appPort);
        gutil.log(gutil.colors.green('http server started at ' + url));

        if (argv.o || argv.optimize) {
            cfg.optimize = true;
        }
        if (argv.b || argv.browser) {
            openurl.open(url);
        }

        gulp.start(['watch', 'livereload']);
    });

    // build this project
    // args:
    //   -[o|optimize]: optimize
    gulp.task('build', ['clean'], function(cb) {
        var seq = require('run-sequence'),
            tasks = ['less'],
            fileList = [],
            exclude = ['gitignore', cfg.less.dir];

        var argv = minimist(process.argv.slice(2));
        if (argv.o || argv.optimize) {
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
        seq(tasks, function() {
            var num = fileList.length;
            if(num === 0) {
                cb();
                return;
            }
            fileList.forEach(function(file) {
                processWalk(file).on('end', function() {
                    num--;
                    if(num === 0) {
                        cb();
                    }
                });
            });
        });
    });

    // deploy: deploy static files to cfg.deploy.appPath(cdnPath if give -v)
    // args:
    //   -v[version]: version number
    gulp.task('deploy', ['build'], function() {
        var argv = minimist(process.argv.slice(2));
        var vDir = function() {
            var date = new Date(),
                year = date.getFullYear(),
                month = date.getMonth() + 1,
                date = date.getDate(),
                version = argv.v;

            month = month < 10 ? '0'.concat(month) : month;
            date = date < 10 ? '0'.concat(date) : date;
            version = version && version.toString() !== 'true' ? version : '';

            return ['v', year, month, date, version].join('');
        }

        var target = argv.v ? path.join(cfg.deploy.cdnPath, vDir()) : cfg.deploy.appPath;

        compressFile([cfg.BUILD_DIR + '/**', '!' + cfg.BUILD_DIR + '/**/*.html'], target);
    });
}

// copy files to BUILD_DIR exclude optimized files
function processWalk(file) {
    var extname = path.extname(file);
    var related = file.replace(cfg.BASE_DIR, '');
    var out = cfg.BUILD_DIR + '/' + path.dirname(related);

    if (extname == '.css') {
        return compressFile(file, out, 'css');
    } else if (extname == '.js') {
        return compressFile(file, out, 'js');
    } else if (util.isImageFile(extname)) {
        return compressFile(file, out, 'image');
    } else {
        return compressFile(file, out);
    }
}

// 执行文件压缩操作，如果不指定文件类型仅复制文件
function compressFile(src, out, fileType) {
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
                .pipe(cfg.optimize ? uglify() : gutil.noop())
                .pipe(gulp.dest(out));
            break;
        case 'css':
            return gulp.src(src)
                .pipe(cfg.optimize ? cssminify() : gutil.noop())
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
function isConcatFile(src) {
    var result = false;
    concatList.forEach(function(cnt) {
        cnt = path.resolve(cnt);
        if (src.indexOf(cnt) >= 0) {
            result = true;
            return;
        }
    });
    return result;
}