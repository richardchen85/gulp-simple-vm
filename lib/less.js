var path = require('path'),
    Q = require('q'),
    less = require('gulp-less'),
    autoprefixer = require('gulp-autoprefixer'),
    gutil = require('gulp-util');

module.exports = function(gulp, cfg) {
    gulp.task('less', function() {
        var deferred = Q.defer(),
            files = cfg.less.files,
            num = files.length,
            realDir = cfg.baseDir + '/' + cfg.less.dir + '/',
            outDir = cfg.buildDir + '/' + cfg.cssDir + '/';

        if(num === 0) {
            deferred.reject();
        } else {
            files.forEach(function(file) {
                gulp.src(realDir + file)
                    .pipe(less({
                        compress: cfg.optimize
                    }))
                    .pipe(autoprefixer())
                    .pipe(gulp.dest(outDir + path.dirname(file)))
                    .on('end', function() {
                        num--;
                        if(num === 0) {
                            deferred.resolve();
                        }
                    });
            });
        }
        return deferred.promise;
    });
};