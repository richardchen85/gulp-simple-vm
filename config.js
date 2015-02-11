/**
 * @main config file
 */

module.exports = {
    // port for express
    'appPort': 8008,
    // port for livereload
    'lrPort': 4003,
    // server default page
    'homePage': '',
    // if is true, will optimize css, js and images
    'optimize': false,
    'less': {
        // root of less, for watching
        'dir': 'less',
        'files': ['index.less'],
        'out': 'css'
    },
    'js': {
        // directory of js files
        'dir': 'js',
        // concat config
        'concat': [
            {
                'src': ['jquery.js', 'jquery.pin.js'],
                'out': 'app.js',
                'sourcemap': false
            }
        ]
    },
    // see https://github.com/jrburke/r.js
    'requirejs': {
        'appDir': 'src/app',
        'baseUrl': './',
        'mainConfigFile': 'src/app/config.js',
        'dir': 'app',
        'removeCombined': true,
        'findNestedDependencies': true,
        'optimize': 'uglify2',
        'modules': [
            { 'name': 'config', 'exclude': ['jquery'] }, 
            { 'name': 'lib/require', 'include': ['jquery'] }
        ]
    },
    // see https://github.com/winnieBear/gulp-velocity
    'velocity': {
        'dir': 'src/vm',
        'config': {
            // tpl root 
            'root': 'src/vm/tpl/',
            'encoding': 'utf-8',
            //global macro defined file
            'macro': 'src/vm/tpl/global-macro/macro.vm',
            'globalMacroPath': 'src/vm/tpl/global-macro',
            // test data root path
            'dataPath': 'src/vm/data/'
        },
        // files for watch, path related to config.root
        'watchList': [
            { 'src': 'index.vm', 'out': 'index.html' }
        ],
        // this config is related BASE_PATH in task.js
        'out': ''
    }
}