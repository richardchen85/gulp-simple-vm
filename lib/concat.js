var path = require('path'),
    Q = require('q'),
    gutil = require('gulp-util');

module.exports = function(gulp, cfg) {
    gulp.task('concat', function() {
        var uglify = require('gulp-uglify'),
            sourcemap = require('gulp-sourcemaps'),
            cssminify = require('gulp-minify-css'),
            concat = require('gulp-concat'),
            deferred = Q.defer(),
            num = cfg.concat.length;

        cfg.concat.forEach(function(obj) {
            var fileType = path.extname(obj.out);
            var src = [];
            var op = uglify;

            obj.src.forEach(function(f) {
                src.push(cfg.baseDir + '/' + f);
            });

            if (fileType == '.css') {
                op = cssminify;
            }
            gulp.src(src)
                .pipe(obj.sourcemap ? sourcemap.init() : gutil.noop())
                .pipe(concat(obj.out))
                .pipe(cfg.optimize ? op() : gutil.noop())
                .pipe(obj.sourcemap ? sourcemap.write('.') : gutil.noop())
                .pipe(gulp.dest(cfg.buildDir))
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