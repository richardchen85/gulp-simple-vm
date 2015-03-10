var minimist = require('minimist'),
    util = require('./util.js'),
    $ = require('./base.js');

module.exports = function(gulp, cfg) {
    /**
     * build this project
     * @argv:
     *   -[o|optimize]: optimize
     */
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
            exclude = exclude.concat($.concatList);
        }
        if (cfg.velocity) {
            tasks.push('vm');
            exclude.push(cfg.velocity.dir);
        }
        fileList = util.walk(cfg.baseDir, exclude);
        //gutil.log(gutil.colors.yellow('exclude ' + exclude.toString()));
        seq(tasks, function() {
            var num = fileList.length;
            if(num === 0) {
                cb();
                return;
            }
            fileList.forEach(function(file) {
                $.processWalk(file).on('end', function() {
                    num--;
                    if(num === 0) {
                        cb();
                    }
                });
            });
        });
    });
}