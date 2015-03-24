var path = require('path'),
    del = require('del'),
    util = require('./util.js'),
    $ = require('./base.js');

module.exports = function(gulp, cfg) {
    gulp.task('watch', function() {
        var rjsDir = cfg.requirejs ? path.resolve(cfg.requirejs.appDir) : null,
            vmDir = path.resolve(cfg.widget.root);

        gulp.watch(cfg.baseDir + '/**/*', function(event) {
            var filename = path.resolve(event.path),
                related = filename.replace(path.resolve(cfg.baseDir), ''),
                extname = path.extname(filename);
            var fileType = {
                isRequireJs: filename.indexOf(rjsDir) > -1,
                isWidget: filename.indexOf(vmDir) > -1 && (extname === '.vm' || extname === '.json'),
                isConcat: $.isConcatFile(filename)
            };
            // 删除文件时直接操作，无需判断
            if (event.type === 'deleted') {
                extname && del(cfg.buildDir + related);
                return;
            }
            if (fileType.isRequireJs) {
                gulp.start('requirejs');
            } else if (fileType.isConcat) {
                gulp.start('concat');
            } else if (fileType.isWidget) {
                util.walk(path.resolve(cfg.baseDir + '/' + cfg.htmlDir)).forEach(function(file) {
                    var extname = path.extname(file);
                    if(extname === '.html') {
                        $.processWalk(file);
                    }
                });
            } else {
                $.processWalk(filename);
            }
        });
    });
};