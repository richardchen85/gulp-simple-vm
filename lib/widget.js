var vEngine = require('velocity').Engine,
    Parser = require('velocity').parser,
    path = require('path'),
    fs = require('fs-extra'),
    util = require('./util.js'),
    cfg = require('../config.js');

var Widget = function() {};
Widget.prototype = {
    constructor: Widget,
    reg: {
        noComment: function() {
            return new RegExp('^(<!--){0}\\s*{%widget\\s.*?name="(.*?)".*?%}\\s*(-->){0}$', 'gm');
        },
        widgetName: function() {
            return new RegExp('{%widget\\s.*?name="(.*?)".*?%}', 'gm');
        }
    },
    // 收集引用的widget及其json文件
    getParseFiles: function() {
        var tplRoot = path.resolve(cfg.widget.root),
            ast = Parser.parse(this.content),
            i = 0,
            arg,
            name;
        if(!ast || !ast.body) return;
        for(; i < ast.body.length; i++) {
            if(ast.body[i].type === 'Parse') {
                arg = ast.body[i].argument.value;
                name = path.basename(arg).replace('.vm', '');
                this.widgets.push(name);
                this.dataFiles.push(path.normalize(tplRoot + '/' + path.dirname(arg) + '/' + name + '.json'));
            }
        }
    },
    // 将文件内容中的{%widget%}转换为#parse()
    widgetToParse: function() {
        var regWidget = this.reg.noComment(),
            regName,
            result = this.content.match(regWidget),
            i = 0,
            name;
        if(!result) return;
        for(; i < result.length; i++) {
            regName = this.reg.widgetName();
            name = regName.exec(result[i])[1];
            name = '/' + name + '/' + name + '.vm';
            name = util.existsSync(cfg.widget.root + name) ? '#parse("' + name + '")' : '';
            this.content = this.content.replace(result[i], name);
        }
    },
    // 生成velocity需要的context
    getContext: function() {
        var files = this.dataFiles,
            i = 0,
            len = files.length,
            json;
        for(; i < len; i++) {
            if(util.existsSync(files[i])) {
                json = JSON.parse(fs.readFileSync(files[i]));
                for(cxt in json) {
                    this.context[cxt] = json[cxt];
                }
            }
        }
    },
    parseHtml: function(file, target) {
        // 初始化需要的变量
        this.filePath = '';
        this.content = '';
        this.widgets = [];
        this.dataFiles = [];
        this.context = {};

        //clone opt,because velocity may modify opt
        var opt = {};
        for (var p in cfg.widget) {
            if (cfg.widget.hasOwnProperty(p)) {
                opt[p] = cfg.widget[p];
            }
        }
        this.filePath = file;
        if(!util.existsSync(this.filePath)) {
            console.log(file + 'dose not exists');
            return;
        }
        // 读取文件内容
        this.content = fs.readFileSync(this.filePath, { encoding: cfg.widget.encoding });
        // 替换{%widget%}引用为#parse
        this.widgetToParse();
        // 收集引用的widget及其json文件
        this.getParseFiles();
        // 通过dataFile生成context
        this.getContext();

        opt.filePath = this.filePath;
        opt.template = this.content;
        try {
            var renderResult = new vEngine(opt).render(this.context);
        } catch (err) {
            return console.log(err);
        }
        fs.outputFileSync(target, renderResult);
        if(cfg.widget.combineStatic) {
            try {
                this.combineStatic();
            } catch (err) {
                console.log(err);
            }
        }
    },
    combineStatic: function() {
        var fileList = [],
            num;
        this.widgets.forEach(function(widget) {
            var src = path.join(cfg.widget.root, widget);
            fileList = fileList.concat(util.walk(path.resolve(src)));
            /*var src = path.join(cfg.widget.root, widget),
                dest = path.join(cfg.buildDir, cfg.widget.root.replace(cfg.baseDir, ''), widget);
            gulp.src(src + '/' + widget + '.')
            fs.copySync(src, dest, function(src) {
                return !/.(vm|json|less|sass|scss)$/.test(src);
            });*/
        });
        num = fileList.length;
        fileList.forEach(function(file) {
            var extname = path.extname(file);
            if(extname == '.less') {}
            /*$.processWalk(file).on('end', function() {
                num--;
                num === 0 && cb();
            });*/
        });
    }
};

module.exports = new Widget;











/*var gutil = require('gulp-util'),
    util = require('./util.js'),
    vm = require('./vm.js'),
    $ = require('./base.js'),
    cfg = require('../config.js');*/

//module.exports = function(gulp, cfg) {
//    cfg.widget.globalMacroPath = cfg.widget.root + '/' + 'marcro';
//    gulp.task('widget', ['widgetStatic'], function() {
//        //return gulp.src(cfg.baseDir + '/' + cfg.htmlDir + '/**/\\*.html')
        //    .pipe(vm(cfg.widget).on('error', gutil.log))
        //    .pipe(gulp.dest(cfg.buildDir + '/' + cfg.htmlDir));
//    });
    /*gulp.task('widgetStatic', function(cb) {
        var fileList = util.walk(cfg.widget.root, ['.*.json', '.*.vm']);
        var num = fileList.length;
        if(num === 0) return cb();
        fileList.forEach(function(file) {
            $.processWalk(file).on('end', function() {
                num--;
                num === 0 && cb();
            });
        });
    });
    gulp.task('widgetConcat', function() {
        //
    });*/
//};