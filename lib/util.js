'use strict';

var crypto = require('crypto'),
    fs = require('fs'),
    path = require('path');

var TEXT_FILE_EXTS = [
        'css', 'tpl', 'js', 'php',
        'txt', 'json', 'xml', 'htm',
        'text', 'xhtml', 'html', 'md',
        'conf', 'po', 'config', 'tmpl',
        'coffee', 'less', 'sass', 'jsp',
        'scss', 'manifest', 'bak', 'asp',
        'tmp', 'haml', 'jade', 'aspx',
        'ashx', 'java', 'py', 'c', 'cpp',
        'h', 'cshtml', 'asax', 'master',
        'ascx', 'cs', 'ftl', 'vm', 'ejs',
        'styl', 'jsx', 'handlebars'
    ],
    IMAGE_FILE_EXTS = [
        'svg', 'tif', 'tiff', 'wbmp',
        'png', 'bmp', 'fax', 'gif',
        'ico', 'jfif', 'jpe', 'jpeg',
        'jpg', 'woff', 'cur', 'webp',
        'swf', 'ttf', 'eot'
    ];

var Util = {
    exists: fs.exists || path.exists,
    existsSync: fs.existsSync || path.existsSync,
    isTextFile: function(path){
        return getFileTypeReg('text').test(path || '');
    },
    isImageFile: function(path){
        return getFileTypeReg('image').test(path || '');
    },
    isFile: function(path){
        return this.exists(path) && fs.statSync(path).isFile();
    },
    isDir: function(path){
        return this.exists(path) && fs.statSync(path).isDirectory();
    },
    md5: function(data, len){
        var md5sum = crypto.createHash('md5'),
            encoding = typeof data === 'string' ? 'utf8' : 'binary';
        md5sum.update(data, encoding);
        len = len || 7;
        return md5sum.digest('hex').substring(0, len);
    },
    getIp: function(){
        var net = require('os').networkInterfaces();
        for(var key in net){
            if(net.hasOwnProperty(key)){
                var items = net[key];
                if(items && items.length){
                    for(var i = 0; i < items.length; i++){
                        var ip = String(items[i].address).trim();
                        if(ip && /^\d+(?:\.\d+){3}$/.test(ip) && ip !== '127.0.0.1'){
                            return ip;
                        }
                    }
                }
            }
        }
        return '127.0.0.1';
    },
    clone: function(src) {
        var newObj = {};

        if(src instanceof Array) {
            newObj = [];
        }
        for(var key in src) {
            var val = src[key];
            newObj[key] = typeof val === 'object' ? clone(val) : val;
        }
        return newObj;
    },
    walk: function(dir, exclude) {
        var _this = this,
            fileList = [];

        fs.readdirSync(dir).forEach(function(file) {
            var tmpPath = dir + '/' + file;
            if(exclude && new RegExp(exclude.join('|')).test(tmpPath)) {
                return;
            }
            if (_this.isFile(tmpPath)) {
                fileList.push(tmpPath);
            } else if (_this.isDir(tmpPath)) {
                fileList: fileList.concat(walk(tmpPath, exclude));
            }
        });
        return fileList;
    }
};

function getFileTypeReg(type){
    var map = [];
    if(type === 'text'){
        map = TEXT_FILE_EXTS;
    } else if(type === 'image'){
        map = IMAGE_FILE_EXTS;
    }
    map = map.join('|');
    return new RegExp('\\.(?:' + map + ')$', 'i');
}

module.exports = Util;