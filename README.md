gulp-simple-vm
==============

A web front-end develop tool base on gulp, including less, requirejs and velocityjs.

Auto compile less, requirejs, concat and uglify javascript files and parse velocity template files.

documents
===========

Download and unzip to a directory, run `npm install` in command line, after that, run `gulp` in command line to show the help.

<strong>directories</strong>

lib: main code for project<br>
src:<br>
  ----img: image files<br>
  ----js: javascript files<br>
  ----less: less directory<br>
  ----vm: velocity template files<br>

You can modify `config.js` to configuration your own need for requirejs compiler and velocity template parser.

More information for `config`, please move to `config.js`.

requirejs
---------

Use requirejs module to optimize require.js codes, for more r.js' config information, see <https://github.com/jrburke/r.js>.

velocity
---------

Use gulp-velocity to parse and compile *.vm files, see <https://github.com/winnieBear/gulp-velocity> for more information.

*.js files support data for *.vm files, must be exists.
