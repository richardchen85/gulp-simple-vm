var path = require('path'),
    del = require('del'),
    watch = require('gulp-chokidar'),
    util = require('./util.js'),
    $ = require('./base.js');

module.exports = function(gulp, cfg) {
    gulp.task('watch', function() {
        var lessDir = path.resolve(cfg.baseDir + '/' + cfg.less.dir),
            requirejsDir = cfg.requirejs ? path.resolve(cfg.requirejs.appDir) : null,
            vmDir = cfg.velocity ? path.resolve(cfg.velocity.dir) : null;

        // gulp.watch删除目录会报错，用gulp-chokidar代替
        watch(cfg.baseDir, { root: cfg.baseDir })
            .on('all', function(event, filename) {
                var filename = path.resolve(filename),
                    related = filename.replace(path.resolve(cfg.baseDir), ''),
                    extname = path.extname(filename),
                    out = cfg.buildDir + '/' + path.dirname(related);

                if(event === 'unlink') {
                    del(cfg.buildDir + related);
                    return;
                }

                if(filename.indexOf(lessDir) > -1) {
                    gulp.start('less');
                } else if (filename.indexOf(requirejsDir) > -1) {
                    gulp.start('requirejs');
                } else if (filename.indexOf(vmDir) > -1) {
                    gulp.start('vm');
                } else if ($.isConcatFile(filename)) {
                    gulp.start('concat');
                } else if (util.existsSync(filename)) {
                    if (util.isImageFile(extname)) {
                        $.compressFile(filename, out, 'image');
                    } else if (extname == '.js') {
                        $.compressFile(filename, out, 'js');
                    } else if (extname == '.css') {
                        $.compressFile(filename, out, 'css');
                    } else if (extname == '.html') {
                        $.compressFile(filename, out, 'html');
                    } else {
                        $.compressFile(filename, out);
                    }
                }
            });
    });
};