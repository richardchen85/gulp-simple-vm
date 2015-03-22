var es = require('event-stream'),
    vEngine = require('velocity').Engine,
    Parser = require('velocity').parser,
    Buffer = require('buffer').Buffer,
    path = require('path'),
    fs = require('fs'),
    util = require('util');

var regWidgetNoComment = '^(<!--){0}\\s*{%widget\\s.*?name="(.*?)".*?%}\\s*(-->){0}$',
    regWidgetName = '{%widget\\s.*?name="(.*?)".*?%}';

function getContext(opt) {
    var context = {},
        dataFiles = [];

    dataFiles = getParseFiles(opt.template, opt.filePath, opt);

    dataFiles.forEach(function(data) {
        if(fs.existsSync(data)) {
            var json = JSON.parse(fs.readFileSync(data));
            for(cnxt in json) {
                context[cnxt] = json[cnxt];
            }
        }
    });

    return context;
}

function getParseFiles(content, filePath, opt) {
    var result = [],
        tplRoot = util.isArray(opt.root) ? opt.root[0] : opt.root,
        dirname = path.dirname(filePath),
        ast = Parser.parse(content);

    tplRoot = path.resolve(tplRoot);
    if(ast && ast.body) {
        ast.body.forEach(function(p) {
            if(p.type === 'Parse') {
                var tmp = p.argument.value;
                if(tmp.indexOf('/') === 0) {
                    tmp = tplRoot + tmp.replace(/\//g, path.sep);
                } else {
                    tmp = dirname + tmp.replace(/.\/|\//g, path.sep);
                }
                result.push(getDataFilePath(tmp, opt));
            }
        });
    }

    return result;
}

function getDataFilePath(vFile, opt) {
    var datafilePath = vFile.replace('.vm', '.json');
    return path.resolve(datafilePath);
}

function widgetToParse(content, opt) {
    var regWidget = new RegExp(regWidgetNoComment, 'gm'),
        result = content.match(regWidget);
    if(result) {
        result.forEach(function(str) {
            var regName = new RegExp(regWidgetName,'gm'),
                name = regName.exec(str)[1];
            name = '/' + name + '/' + name + '.vm';
            name = fs.existsSync(opt.root + name) ? '#parse("' + name + '")' : '';
            content = content.replace(str, name);
        });
    }
    return content;
}
//backup opt
var backOption = null;

module.exports = function(opt) {
    if (backOption === null) {
        backOption = opt;
    }

    function renderTpl(file) {
        //clone opt,because velocity may modify opt
        var opt = {};
        for (var p in backOption) {
            if (backOption.hasOwnProperty(p)) {
                opt[p] = backOption[p];
            }
        }

        if (file.isNull()) {
            return this.emit('data', file); // pass along
        }
        if (file.isStream()) {
            return this.emit('error', new Error(PLUGIN_NAME + ": Streaming not supported"));
        }

        if (file.isBuffer()) {
            opt.filePath = file.path;
            opt.template = String(file.contents);
            // change widget include into velocity parse
            opt.template = widgetToParse(opt.template, opt);
            try {
                var context = getContext(opt);
            } catch (err) {
                return this.emit('error', err)
            }

            try {
                var renderResult = new vEngine(opt).render(context);
            } catch (err) {
                return this.emit('error', err)
            }
            file.contents = new Buffer(renderResult);
            this.emit('data', file);
        }
    }

    return es.through(renderTpl);
}