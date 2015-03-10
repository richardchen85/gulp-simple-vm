var Q = require('q'),
    gutil = require('gulp-util'),
    rename = require('gulp-rename'),
    vm = require('gulp-velocityjs');

module.exports = function(gulp, cfg) {
    gulp.task('vm', function() {
        var deferred = Q.defer(),
            vmCfg = cfg.velocity,
            num = vmCfg.watchList.length;

        vmCfg.watchList.forEach(function(obj) {
            var absPath = vmCfg.config.root + obj.src;
            gulp.src(absPath)
                .pipe(vm(vmCfg.config).on('error', gutil.log))
                .pipe(rename(obj.out))
                .pipe(gulp.dest(cfg.buildDir + '/' + cfg.htmlDir))
                .on('end', function() {
                    num--;
                    if(num === 0) {
                        deferred.resolve();
                    }
                });
        });

        return deferred.promise;
    });
};