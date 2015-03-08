/**
 * @main config file
 */

module.exports = {
    // port for express
    appPort: 8008,
    // port for livereload
    lrPort: 4003,
    // server default page
    homePage: '',
    // if is true, will optimize css, js and images
    optimize: false,
    cssDir: 'css',
    imageDir: 'img',
    jsDir: 'js',
    htmlDir: '',
    less: {
        // root of less, for watching
        dir: 'less',
        files: ['index.less']
    },
    concat: [
        {
            src: ['js/jquery.js', 'js/jquery.pin.js'],
            out: 'js/lib.js',
            sourcemap: false
        },
        {
            src: ['css/bootstrap.min.css', 'css/chosen.min.css', 'css/glyphicon.css'],
            out: 'css/lib.css',
            sourcemap: false
        }
    ],
    // see https://github.com/jrburke/r.js
    requirejs: {
        appDir: 'src/app',
        baseUrl: './',
        mainConfigFile: 'src/app/config.js',
        dir: 'app',
        removeCombined: true,
        findNestedDependencies: true,
        optimize: 'uglify2',
        modules: [
            { name: 'config', exclude: ['jquery'] }, 
            { name: 'lib/require', include: ['jquery'] }
        ]
    },
    // see https://github.com/richard-chen-1985/gulp-velocityjs
    velocity: {
        dir: 'src/vm',
        config: {
            // tpl root 
            root: 'src/vm/tpl/',
            encoding: 'utf-8',
            //global macro defined file
            macro: 'src/vm/tpl/global-macro/macro.vm',
            globalMacroPath: 'src/vm/tpl/global-macro',
            // test data root path
            dataPath: 'src/vm/data/'
        },
        // files for watch, path related to config.root
        watchList: [
            { src: 'index.vm', out: 'index.html' }
        ]
    },
    // copy static files to specified path
    deploy: {
        // path to webapp static resource directory
        appPath: './webapp',
        // path to cdn directory, process.argv '-v[version]' must be given
        // for folder named "vyyyyMMdd[version]" for CDN
        cdnPath: './static'
    }
}