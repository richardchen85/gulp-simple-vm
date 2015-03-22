// gulp base
var gulp = require('gulp'),
    gutil = require('gulp-util'),
    cfg = require('./config.js');

// load tasks
require('./lib/less.js')(gulp, cfg);
require('./lib/sass.js')(gulp, cfg);
require('./lib/imagemin.js')(gulp, cfg);
require('./lib/concat.js')(gulp, cfg);
require('./lib/requirejs.js')(gulp, cfg);
require('./lib/widget.js')(gulp, cfg);
require('./lib/clean.js')(gulp, cfg);
require('./lib/watch.js')(gulp, cfg);
require('./lib/livereload.js')(gulp, cfg);
require('./lib/build.js')(gulp, cfg);
require('./lib/server.js')(gulp, cfg);
require('./lib/deploy.js')(gulp, cfg);

// default
gulp.task('default', function() {
    var str = gutil.colors.green('\r\n' +
        '++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++\r\n' +
        '              Welcome to gulp-simple-vm\r\n' +
        '----------------------------------------------------------------------\r\n\r\n' +
        'Usage: gulp <command>\r\n\r\n' +
        'Comamnds:\r\n\r\n' +
        '  build: build project to "build" directory\r\n' +
        '    -[o|optimize]: optimize css, js and image files\r\n\r\n' +
        '  server: open http server, "build" as root\r\n' +
        '    -[o|optimize]: optimize css, js and image files\r\n' +
        '    -[b|browser]: auto open browser\r\n\r\n' +
        '  deploy: deploy static files to appPath (give -v to cdnPath)\r\n' +
        '    -v[version]: folder named "vyyyyMMdd[version]" for CDN\r\n\r\n' +
        '++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++\r\n');

    console.log(str);
});

