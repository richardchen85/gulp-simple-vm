var gutil = require('gulp-util'),
    util = require('./util.js'),
    vm = require('./vm.js'),
    $ = require('./base.js'),
    cfg = require('../config.js');

module.exports = function(gulp, cfg) {
    cfg.widget.globalMacroPath = cfg.widget.root + '/' + 'marcro';
    gulp.task('widget', ['widgetStatic'], function() {
        return gulp.src(cfg.baseDir + '/' + cfg.htmlDir + '/**/*.html')
            .pipe(vm(cfg.widget).on('error', gutil.log))
            .pipe(gulp.dest(cfg.buildDir + '/' + cfg.htmlDir));
    });
    gulp.task('widgetStatic', function(cb) {
        var fileList = util.walk(cfg.widget.root, ['.*.json', '.*.vm']);
        var num = fileList.length;
        if(num === 0) return cb();
        fileList.forEach(function(file) {
            $.processWalk(file).on('end', function() {
                num--;
                num === 0 && cb();
            });
        });
    });
    gulp.task('widgetConcat', function() {
        //
    });
};