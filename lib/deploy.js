var path = require('path'),
    minimist = require('minimist'),
    $ = require('./base.js');

module.exports = function(gulp, cfg) {
    /**
     * deploy static files to cfg.deploy.appPath(cdnPath if give -v)
     * @argv:
     *   -v: shoose cfg.deploy.cdnPath
     */
    gulp.task('deploy', function() {
        var argv = minimist(process.argv.slice(2));
        var target = argv.v ? cfg.deploy.cdnPath : cfg.deploy.appPath;

        $.compressFile([cfg.buildDir + '/**', '!' + cfg.buildDir + '/**/*.html'], target);
    });
}