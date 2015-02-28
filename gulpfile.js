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
        '              欢迎使用 gulp-simple-vm\r\n' +
        '--------------------------------------------------------------\r\n\r\n' +
        'gulp build: 生成命令\r\n' +
        '   -[o|optimize]: optimize css, js and image files\r\n\r\n' +
        'gulp server: 启动http服务器\r\n' +
        '   -[o|optimize]: optimize css, js and image files\r\n' +
        'gulp deploy: 复制VM文件和"build"目录为"vyyyyMMdd[version]"格式\r\n' +
        '   -v[version]: 当天布署的次数作为版本号 \r\n\r\n' +
        '++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++\r\n');

    console.log(str);
});

