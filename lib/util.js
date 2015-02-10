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

var Util = {};

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

Util.isTextFile = function(path){
    return getFileTypeReg('text').test(path || '');
};

Util.isImageFile = function(path){
    return getFileTypeReg('image').test(path || '');
};

Util.md5 = function(data, len){
    var md5sum = crypto.createHash('md5'),
        encoding = typeof data === 'string' ? 'utf8' : 'binary';
    md5sum.update(data, encoding);
    len = len || 7;
    return md5sum.digest('hex').substring(0, len);
};

Util.getIp = function(){
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
}

Util.clone = function(src) {
    var newObj = {};

    if(src instanceof Array) {
        newObj = [];
    }
    for(var key in src) {
        var val = src[key];
        newObj[key] = typeof val === 'object' ? Util.clone(val) : val;
    }
    return newObj;
}

Util.walk = function(dir, exclude) {
    var regExp,
        fileList = [];

    fs.readdirSync(dir).forEach(function(file) {
        var tmpPath = dir + '/' + file;
        if(exclude && new RegExp(exclude.join('|')).test(tmpPath)) {
            return;
        }
        if (fs.statSync(tmpPath).isFile()) {
            fileList.push(tmpPath);
        } else if (fs.statSync(tmpPath).isDirectory()) {
            fileList = fileList.concat(Util.walk(tmpPath, exclude));
        }
    });
    return fileList;
}

module.exports = Util;