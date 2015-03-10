var Q = require('q'),
    del = require('del'),
    util = require('./util.js'),
    cfg = require('../config.js');

module.exports = function(gulp) {
    gulp.task('requirejs', function() {
        var rjs = require('requirejs'),
            deferred = Q.defer(),
            build;

        // r.js需要的配置项
        // 用clone方式，因为r.js会修改配置项
        build = util.clone(cfg.requirejs);
        // 修改输出目录
        build.dir = cfg.buildDir + '/' + cfg.requirejs.dir;
        // 修改r.js的压缩选项
        build.optimize = cfg.optimize ? build.optimize : '';

        rjs.optimize(build, function() {
            // 删除r.js生成的build.txt
            del(build.dir + '/build.txt', function() {
                deferred.resolve();
            });
        });

        return deferred.promise;
    });
};