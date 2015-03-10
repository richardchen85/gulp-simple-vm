var watch = require('gulp-chokidar'),
    livereload = require('gulp-livereload');

module.exports = function(gulp, cfg) {
    gulp.task('livereload', function() {
        livereload.listen(cfg.lrPort);
        // gulp.watch删除目录会报错，用gulp-chokidar代替
        watch(cfg.buildDir + '/**', { root: cfg.buildDir })
            .on('all', function(event, filename) {
                livereload.changed(filename, cfg.lrPort);
            });
    });
};