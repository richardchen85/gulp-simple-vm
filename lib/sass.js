var path = require('path'),
    Q = require('q'),
    sass = require('gulp-sass'),
    autoprefixer = require('gulp-autoprefixer'),
    cssminify = require('gulp-minify-css'),
    gutil = require('gulp-util');

module.exports = function(gulp, cfg) {
    gulp.task('sass', function() {
        var deferred = Q.defer(),
            files = cfg.sass.files,
            num = files.length,
            realDir = cfg.baseDir + '/' + cfg.sass.dir + '/',
            outDir = cfg.buildDir + '/' + cfg.cssDir + '/';

        if (num === 0) {
            deferred.reject();
        } else {
            files.forEach(function(file) {
                gulp.src(realDir + file)
                    .pipe(sass())
                    .pipe(autoprefixer())
                    .pipe(cfg.optimize ? cssminify({compatibility:'ie7'}) : gutil.noop())
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