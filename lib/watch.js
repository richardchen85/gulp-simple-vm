var path = require('path'),
    del = require('del'),
    util = require('./util.js'),
    $ = require('./base.js');

module.exports = function(gulp, cfg) {
    gulp.task('watch', function() {
        // dirs need to be combined
        var rjsDir = cfg.requirejs ? path.resolve(cfg.requirejs.appDir) : null/*,
            htmlDir = path.resolve(cfg.baseDir + '/' + cfg.htmlDir),
            vmDir = path.resolve(cfg.widget.root)*/;

        gulp.watch(cfg.baseDir + '/**/*', function(event) {console.log(event);
            var filename = path.resolve(event.path),
                related = filename.replace(path.resolve(cfg.baseDir), ''),
                extname = path.extname(filename)/*,
                out = cfg.buildDir + '/' + path.dirname(related)*/;
            var fileType = {
                isRequireJs: filename.indexOf(rjsDir) > -1,
                //isWidget: filename.indexOf(htmlDir) > -1 || filename.indexOf(vmDir) > -1 && (extname === '.vm' || extname === '.json'),
                isConcat: $.isConcatFile(filename)/*,
                isCss: extname === '.css',
                isJs: extname === '.js',
                isLess: extname === '.less',
                isSass: extname === '.scss',
                isImage: util.isImageFile(extname)*/
            };
            // 删除文件时直接操作，无需判断
            if (event.type === 'deleted') {
                extname && del(cfg.buildDir + related);
                return;
            }
            if (fileType.isRequireJs) {
                gulp.start('requirejs');
            }/* else if (fileType.isWidget) {
                gulp.start('widget');
            }*/ else if (fileType.isConcat) {
                gulp.start('concat');
            } else {
                $.processWalk(filename);
            }
        });
    });
};