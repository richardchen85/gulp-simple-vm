var fs = require('fs'),
    path = require('path'),
    http = require('http'),
    url = require('url'),
    gutil = require('gulp-util'),
    minimist = require('minimist'),
    util = require('./util.js'),
    openurl = require('./openurl.js');

var mine = {
    "css": "text/css",
    "gif": "image/gif",
    "html": "text/html",
    "tpl": "text/html",
    "vm": "text/html",
    "shtml": "text/html",
    "ico": "image/x-icon",
    "jpeg": "image/jpeg",
    "jpg": "image/jpeg",
    "js": "text/javascript",
    "json": "application/json",
    "pdf": "application/pdf",
    "png": "image/png",
    "svg": "image/svg+xml",
    "swf": "application/x-shockwave-flash",
    "tiff": "image/tiff",
    "txt": "text/plain",
    "wav": "audio/x-wav",
    "wma": "audio/x-ms-wma",
    "wmv": "video/x-ms-wmv",
    "xml": "text/xml"
};

var server = {};

/**
 * @init
 * @param {String} serverCurrentDir 服务器文件夹本地路径
 * @param {String} port 服务器端口号
 */
server.init = function(serverCurrentDir, port){
    var config = http.createServer(function (request, response) {
        var requestUrl = request.url;
        var pathname = url.parse(requestUrl).pathname;

        if (typeof(serverCurrentDir) == 'undefined') {
            var realPath = fs.realpathSync('.') +'/'+ pathname;
        } else {
            var realPath = serverCurrentDir +'/'+ pathname;
        }
        realPath = decodeURI(realPath);

        var ext = path.extname(realPath);
        ext = ext ? ext.slice(1) : 'unknown';

        var response404 = function (){
            response.writeHead(404, {
                'Content-Type': mine.html
            });
            response.write('<center><h1>404 Not Found</h1></center>');
            response.end();
        }

        util.exists(realPath, function (exists) {
            if(!exists){
                response404();
                return;
            }

            fs.readFile(realPath, "binary", function (err, file) {
                if (err) {
                    if(err.errno == 28){
                        response.writeHead(200, {
                            'Content-Type': mine.html
                        });
                        var html = server.getDirList(realPath, pathname, port);
                        response.write(html);
                        response.end();
                    }else{
                        response.writeHead(500, {
                            'Content-Type': mine.html
                        });
                        response.end(err);
                    }
                } else {
                    var contentType = mine[ext] || "text/plain";
                    response.writeHead(200, {
                        'Content-Type': contentType
                    });
                    response.write(file, "binary");
                    response.end();
                }
            });
        });
    });
    config.listen(port);
    config.on('error', function(err){
        if (err.code === 'EADDRINUSE' || err.code === 'EACCES'){
            console.log('server : Port ' + port + ' has used');
        }
    });
}

/**
 * @get dir list
 */
server.getDirList = function(realPath, pathname, port){
    // console.log(realPath);
    var dirname = '/';
    var html = '<li style="padding-bottom:5px;"><a href="../">../</a></li>';
    realPath = path.normalize(realPath);
    pathname += '/';
    pathname = pathname.replace(/\/\//,'');

    fs.readdirSync(realPath).forEach(function(name){
        if( !/.Ds_Store$/.test(name) ){
            // console.log(name);
            var url = pathname +'/'+name;
            url = url.replace(/\/\//g,'/');
            url = encodeURI(url);
            dirname = path.dirname(url);
            if(util.isDir('.'+url)){
                url = url + '/';
                name = name + '/';
            }

            html += '<li style="padding-bottom:0.2em;"><a href="'+url+'">'+name+'</a></li>';
        }
    })

    html = '<ul>' +html+ '</ul>';
    html = '<h1>Index of '+dirname+'</h1><hr/>'+html+'<hr/> ';
    return html;
}


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

        server.init(cfg.buildDir, cfg.appPort);
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

