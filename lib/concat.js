var path = require('path'),
    Q = require('q'),
    gutil = require('gulp-util'),
    $ = require('./base.js');

module.exports = function(gulp, cfg) {
    gulp.task('concat', function() {
        var deferred = Q.defer(),
            num = cfg.concat.length;

        cfg.concat.forEach(function(obj) {
            obj.src = obj.src.map(function(f) {
                return cfg.baseDir + '/' + f;
            });
            $.concat(obj).then(function() {
                num--;
                num === 0 && deferred.resolve();
            });
        });

        return deferred.promise;
    });
};