gulp-simple-vm
==============

基于gulp的前端自动化构建工具，内置LESS、requirejs和velocity。

自动监听并编译LESS文件、利用r.js对requirejs进行合并和压缩、合并和压缩js文件、解析velocity模板。

documents
===========

下载并解压后, 在命令行进入当前目录运行 `npm install` 安装必要的node.js模块，然后运行 `gulp` 可以看到帮助界面，按照帮助界面运行命令即可进行前端开发。

<strong>目录结构</strong>

lib: 本工具核心代码目录<br>
src:<br>
  ----img: 图片文件夹<br>
  ----js: javascript文件夹<br>
  ----less: LESS文件夹<br>
  ----vm: velocity模板文件夹<br>
  ----config.js: 工具配置文件<br>
  ----gulpfile.js: gulp主文件

可以通过修改 `config.js` 文件来配置自己需要的项目，默认开启LESS, requirejs和velocity模块。

关于 `config.js` 的详细设置进直接打开 `config.js` 文件查看。

requirejs
---------

用 `r.js` 来对requirejs进行合并和压缩，需要在 `config.js` 进行配置，默认已经开启，详细的r.js配置请查看：<https://github.com/jrburke/r.js>。

velocity
---------

默认开启velocity模板引擎，每个.vm文件必需有对应的.js文件对其提供数据支持，js文件可以为空内容文件侧不提供任何数据。本工具使用 `gulp-velocity` 模块解析 velocity 模板，详情请查看：<https://github.com/winnieBear/gulp-velocity>。
