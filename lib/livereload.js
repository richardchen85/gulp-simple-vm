var livereload = require('gulp-livereload');

module.exports = function(gulp, cfg) {
    gulp.task('livereload', function() {
        livereload.listen(cfg.lrPort);
        gulp.watch(cfg.buildDir + '/**/*.*', function(event) {
            livereload.changed(event.path, cfg.lrPort);
        });
    });
};