// gulp base
var gulp = require('gulp'),
    gutil = require('gulp-util'),
    cfg = require('./config.js');

// base path of config
// all configs' path are related to this path
// except requirejs and velocity config.
cfg.BASE_DIR = 'src';
// path for build
cfg.BUILD_DIR = 'build';

// load tasks
require('./lib/task.js')(gulp, cfg);

// default
gulp.task('default', function() {
    var str = gutil.colors.green('\r\n' +
        '++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++\r\n' +
        '              Welcome to gulp-simple-vm\r\n' +
        '--------------------------------------------------------------\r\n\r\n' +
        'Usage: gulp <command>\r\n\r\n' +
        'Comamnds:\r\n' +
        '  build: build project to "build" directory\r\n' +
        '    -[o|optimize]: optimize css, js and image files\r\n\r\n' +
        '  server: open http server, "build" as root，so use "gulp build" first\r\n' +
        '    -[o|optimize]: optimize css, js and image files\r\n' +
        '    -[b|browser]: auto open browser\r\n\r\n' +
        '  deploy: copy "build" directory as "vyyyyMMdd[version]"\r\n' +
        '    -v[version]: version number \r\n\r\n' +
        '++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++\r\n');

    console.log(str);
});

