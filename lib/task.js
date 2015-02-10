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

var gulp, cfg;


module.exports = function(_gulp, _cfg) {
    gulp = _gulp;
    cfg = _cfg;

    optimizeTasks();
    devTasks();
};

// optimize tasks like less, imagemin, js uglify & concat, requirejs, velocity
function optimizeTasks() {
    // less compile
    gulp.task('less', function() {
        var less = require('gulp-less'),
            autoprefixer = require('gulp-autoprefixer'),
            files = cfg.less.files,
            realDir = cfg.BASE_DIR + '/' + cfg.less.dir + '/',
            outDir = cfg.BUILD_DIR + '/' + cfg.less.out + '/';

        files.forEach(function(file) {
            gulp.src(realDir + file)
                .pipe(less({
                    compress: cfg.optimize
                }))
                .pipe(autoprefixer())
                .pipe(gulp.dest(outDir + path.dirname(file)));
        });
    });

    // imagemin
    gulp.task('imagemin', function() {
        optimizeImage(cfg.BASE_DIR + '/**', cfg.BUILD_DIR);
    });

    // js uglify and concat
    gulp.task('js', function() {
        var uglify = require('gulp-uglify'),
            sourcemap = require('gulp-sourcemaps'),
            jsCfg = cfg.js;

        // uglify javascript
        jsCfg.concat.forEach(function(obj) {
            var src = [];
            obj.src.forEach(function(f) {
                src.push(cfg.BASE_DIR + '/' + jsCfg.dir + '/' + f);
            });

            gulp.src(src)
                .pipe(obj.sourcemap ? sourcemap.init() : gutil.noop())
                .pipe(concat(obj.out))
                .pipe(cfg.optimize ? uglify() : gutil.noop())
                .pipe(obj.sourcemap ? sourcemap.write('.') : gutil.noop())
                .pipe(gulp.dest(cfg.BUILD_DIR + '/' + jsCfg.dir));
        });
    });

    // requirejs optimizer
    gulp.task('requirejs', function() {
        var rjs = require('requirejs'),
            build;

        // for requirejs optimizer config
        // use clone because r.js will change it
        build = util.clone(cfg.requirejs);
        // change default 'dir' config
        build['dir'] = cfg.BUILD_DIR + '/' + build.dir;
        // change optimize config
        build['optimize'] = cfg.optimize ? build['optimize'] : '';

        rjs.optimize(build, function() {
            // del build.txt
            del(build.dir + '/build.txt');
        });
    });

    // render velocity
    gulp.task('vm', function() {
        var rename = require('gulp-rename'),
        vm = require('gulp-velocity'),
        vmCfg = cfg.velocity,
        files = vmCfg.watchList;

        files.forEach(function(file) {
            var absPath = vmCfg.config.root + file;
            if (fs.existsSync(absPath)) {
                gulp.src(absPath)
                    .pipe(vm(vmCfg.config).on('error', gutil.log))
                    .pipe(rename({
                        extname: '.html'
                    }))
                    .pipe(gulp.dest(cfg.BUILD_DIR + '/' + vmCfg.out + '/' + path.dirname(file)));
            }
        });
    });
}

// develop tasks like clean, watch, livereload, express, server, build, deploy
function devTasks() {
    // clean
    gulp.task('clean', function(cb) {
        del([cfg.BUILD_DIR], cb);
    });

    // watch
    gulp.task('watch', function() {
        gulp.watch(cfg.BASE_DIR + '/**', function(file) {
            processWatch(file);
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
            url = 'http://' + util.getIp() + ':' + cfg.appPort;
        var app = express();

        app.use(express.static('build'));
        app.listen(cfg.appPort);

        gutil.log(gutil.colors.green('http server started at ' + url));
        openurl.open(url);
    });

    // start express and other tasks by given parameters
    // e.g.
    //   -o: optimize
    //   -r: livereload
    //   -w: watch
    gulp.task('server', function() {
        var tasks = ['express'];
        var argv = minimist(process.argv.slice(2));
        if(argv.o || argv.optimize) {
            cfg.optimize = true;
        }
        if(argv.r || argv.livereload) {
            tasks.push('livereload');
        }
        if(argv.w || argv.watch) {
            tasks.push('watch');
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
        } else {
            tasks.push('js');
            exclude.push(cfg.js.dir);
        }
        if (cfg.velocity) {
            tasks.push('vm');
            exclude.push(cfg.velocity.dir);
        }
        fileList = util.walk(cfg.BASE_DIR, exclude);
        gutil.log(gutil.colors.yellow('exclude ' + exclude.toString()));
        gulp.start(tasks);
        for(var i = 0; i < fileList.length; i++) {
            processWalk(fileList[i]);
        }
    });

    // deploy: copy files to dir named by version
    gulp.task('deploy', function() {
        var argv = minimist(process.argv.slice(2));
        var date = new Date();

        gulp.src(cfg.BUILD_DIR + '/**')
            .pipe(gulp.dest([
                'v',
                date.getFullYear(),
                date.getMonth() + 1,
                date.getDate(),
                argv.v
            ].join('')));

        gutil.log(gutil.colors.green('deploy complete...'));
    });
}

// process watch callback
function processWatch(file) {
    var extname = path.extname(file.path);
    var related = file.path.replace(path.resolve(cfg.BASE_DIR), '');

    switch(extname) {
        case '.less':
            gulp.start('less');
            break;
        case '.vm':
            gulp.start('vm');
            break;
        case '.css':
            if(file.type == 'deleted') {
                del(cfg.BUILD_DIR + '/' + related);
            } else {
                optimizeCss(file.path, cfg.BUILD_DIR + '/' + path.dirname(related));
            }
            break;
        case '.js':
            if (cfg.requirejs && file.path.indexOf(path.resolve(cfg.requirejs.appDir)) >= 0) {
                gulp.start('requirejs');
            } else if (file.path.indexOf(path.resolve(cfg.js.dir)) >= 0) {
                gulp.start('js');
            } else if (file.type == 'deleted') {
                del(cfg.BUILD_DIR + '/' + related);
            } else {
                optimizeJS(file.path, cfg.BUILD_DIR + '/' + path.dirname(related));
            }
            break;
        default:
            if(util.isImageFile(extname)) {
                if (file.type == 'changed' || file.type == 'added') {
                    optimizeImage(file.path, cfg.BUILD_DIR + '/' + path.dirname(related));
                } else {
                    del(cfg.BUILD_DIR + '/' + related);
                }
            } else {
                if (file.type == 'changed' || file.type == 'added') {
                    gulp.src(file.path)
                        .pipe(gulp.dest(cfg.BUILD_DIR + '/' + path.dirname(related)));
                } else {
                    del(cfg.BUILD_DIR + '/' + related);
                }
            }
    }
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
function optimizeImage(path, out) {
    var imagemin = require('gulp-imagemin'),
        pngquant = require('imagemin-pngquant');

    gulp.src(path)
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
function optimizeJS(path, out) {
    var uglify = require('gulp-uglify');

    gulp.src(path)
        .pipe(cfg.optimize ? uglify() : gutil.noop())
        .pipe(gulp.dest(out));
}

// optimize css
function optimizeCss(path, out) {
    var cssminify = require('gulp-minify-css');

    gulp.src(path)
        .pipe(cfg.optimize ? cssminify() : gutil.noop())
        .pipe(gulp.dest(out));
}
