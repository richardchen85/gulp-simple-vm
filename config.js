/**
 * @main config file
 */

module.exports = {
    // port for express
    appPort: 8090,
    // open livereload or not
    livereload: true,
    // server default page
    homePage: '',
    // project source files directory
    baseDir: 'src',
    // output directory
    buildDir: '.build',
    // if is true, will optimize css, js and images
    optimize: false,
    cssDir: 'css',
    imageDir: 'img',
    jsDir: 'js',
    htmlDir: 'html',
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
        keepBuildDir: true,
        removeCombined: true,
        findNestedDependencies: true,
        optimize: 'uglify2',
        modules: [
            { name: 'config', exclude: ['jquery'] },
            { name: 'lib/require', include: ['jquery'] }
        ]
    },
    // see https://github.com/richard-chen-1985/gulp-velocityjs
    widget: {
        // tpl root
        root: 'src/widget',
        encoding: 'utf-8',
        // concat js and css or not
        combineStatic: true
    },
    // copy static files to specified path
    deploy: {
        // path to webapp static resource directory
        appPath: './webapp',
        // path to cdn directory, process.argv '-v[version]' must be given
        // for folder named "vyyyyMMdd[version]" for CDN
        cdnPath: './static'
    }
};