var path = require('path'),
    minimist = require('minimist'),
    $ = require('./base.js');

module.exports = function(gulp, cfg) {
    /**
     * deploy static files to cfg.deploy.appPath(cdnPath if give -v)
     * @argv:
     *   -v[version]: version number
     */
    gulp.task('deploy', function() {
        var argv = minimist(process.argv.slice(2));
        var vDir = function() {
            var date = new Date(),
                year = date.getFullYear(),
                month = date.getMonth() + 1,
                date = date.getDate(),
                version = argv.v;

            month = month < 10 ? '0'.concat(month) : month;
            date = date < 10 ? '0'.concat(date) : date;
            version = version && version.toString() !== 'true' ? version : '';

            return ['v', year, month, date, version].join('');
        }

        var target = argv.v ? path.join(cfg.deploy.cdnPath, vDir()) : cfg.deploy.appPath;

        $.compressFile([cfg.buildDir + '/**', '!' + cfg.buildDir + '/**/*.html'], target);
    });
}