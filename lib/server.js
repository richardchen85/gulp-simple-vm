var gutil = require('gulp-util'),
    minimist = require('minimist'),
    util = require('./util.js');

module.exports = function(gulp, cfg) {
    gulp.task('server', ['build'], function() {
        var express = require('express'),
            openurl = require('./openurl.js'),
            url = 'http://' + util.getIp() + ':' + cfg.appPort + '/' + cfg.homePage,
            argv = minimist(process.argv.slice(2));

        var app = express();
        app.use(express.static(cfg.buildDir));
        app.listen(cfg.appPort);
        gutil.log(gutil.colors.green('http server started at ' + url));

        if (argv.o || argv.optimize) {
            cfg.optimize = true;
        }
        if (argv.b || argv.browser) {
            openurl.open(url);
        }

        gulp.start(['watch', 'livereload']);
    });
}