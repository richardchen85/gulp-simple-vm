var path = require('path'),
    minimist = require('minimist'),
    seq = require('run-sequence'),
    gutil = require('gulp-util'),
    util = require('./util.js'),
    $ = require('./base.js');

module.exports = function(gulp, cfg) {
    /**
     * build this project
     * @argv:
     *   -[o|optimize]: optimize
     */
    gulp.task('build', ['clean'], function(cb) {
        // accept args from cmd
        var argv = minimist(process.argv.slice(2));
        if (argv.o || argv.optimize) {
            cfg.optimize = true;
        }

        var tasks = [], fileList = [], exclude = [];

        /*tasks.push('widget');
        exclude.push(cfg.widget.root);
        exclude.push(cfg.baseDir + '/' + cfg.htmlDir);*/
        exclude.push(path.resolve(cfg.widget.root));

        if(cfg.concat) {
            tasks.push('concat');
            exclude = exclude.concat($.concatList);
        }
        if(cfg.requirejs) {
            //tasks.push('requirejs');
            exclude.push(path.resolve(cfg.requirejs.appDir));
        }
        fileList = util.walk(path.resolve(cfg.baseDir), exclude);
        seq(tasks, function() {
            var num = fileList.length;
            if(num === 0) return cb();
            try {
                fileList.forEach(function(file) {
                    $.processWalk(file).then(function() {
                        num--;
                        num === 0 && cb();
                    });
                });
            } catch(err) {
                gutil.log(gutil.colors.red(err));
            }
        });
    });
};