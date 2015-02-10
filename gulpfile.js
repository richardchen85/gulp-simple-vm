// gulp base
var gulp = require('gulp'),
    gutil = require('gulp-util'),
    cfg = require('./config.js');

// base path of config
// all configs' path are related to this path
// except requirejs and velocity config.
cfg.BASE_DIR = 'src';
// path for build task
cfg.BUILD_DIR = 'build';

// load tasks
require('./lib/task.js')(gulp, cfg);

// default: start server and livereload
gulp.task('default', function() {
    var str = gutil.colors.green('\r\n' +
        '++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++\r\n' +
        '              Welcome to use gulp-simple-vm\r\n' +
        '--------------------------------------------------------------\r\n\r\n' +
        'gulp build: build this project\r\n' +
        '   -[o|optimize]: optimize css, js and image files\r\n\r\n' +
        'gulp server: start a server to view webpages\r\n' +
        '   -[o|optimize]: optimize css, js and image files\r\n' +
        '   -[w|watch]: watch files\' modifycation\r\n' +
        '   -[r|livereload]: start livereload server\r\n\r\n' +
        'gulp deploy: rename "build" directory like "vyyyyMMdd[version]"\r\n' +
        '   -v[version]: deploy version of today \r\n\r\n' +
        '++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++\r\n');

    console.log(str);
});

