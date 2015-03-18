var gutil = require('gulp-util'),
    minimist = require('minimist'),
    express = require('express'),
    util = require('./util.js'),
    openurl = require('./openurl.js');

module.exports = function(gulp, cfg) {
    /**
     * 开启http服务，并启动livereload, watch
     * @argv:
     *   -[o|optimize]: optimize
     *   -[b|browser]: auto open browser
     */
    gulp.task('server', function() {
        var url = 'http://' + util.getIp() + ':' + cfg.appPort + '/' + cfg.homePage,
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

        gulp.start('watch');
        cfg.livereload && gulp.start('livereload');
    });
}