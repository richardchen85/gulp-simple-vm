var $ = require('./base.js');

module.exports = function(gulp, cfg) {
    gulp.task('imagemin', function() {
        var src = cfg.baseDir + '/' + cfg.imageDir + '/**',
            out = cfg.buildDir + '/' + cfg.imageDir;
        return $.compressFile(src, out, 'image');
    });
};