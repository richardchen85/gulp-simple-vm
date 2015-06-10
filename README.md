停止更新说明
============

好吧，其实我本人已经转向[京东的jdf](https://github.com/putaoshu/jdf)和[百度的fis](https://github.com/fex-team/fis)了，这个项目停止更新了，当然作为对gulp感兴趣的同学，还是可以拿来学习学习，也是可以直接拿来用的。

gulp-simple-vm
==============

基于gulp的前端自动化构建工具，内置LESS、SASS、requirejs和velocity。

自动监听并编译LESS、SASS文件、利用r.js对requirejs进行合并和压缩、合并和压缩js文件、解析velocity模板。

documents
===========

下载并解压后, 在命令行进入当前目录运行 `npm install` 安装必要的node.js模块，然后运行 `gulp` 可以看到帮助界面，按照帮助界面运行命令即可进行前端开发。

<strong>目录结构</strong>

lib: 本工具核心代码目录<br>
src:<br>
  ----img: 图片文件夹<br>
  ----js: javascript文件夹<br>
  ----less: LESS文件夹<br>
  ----sass: SASS文件夹<br>
  ----vm: velocity模板文件夹<br>
config.js: 工具配置文件<br>
gulpfile.js: gulp主文件

可以通过修改 `config.js` 文件来配置自己需要的项目，默认开启LESS, SASS, requirejs和velocity模块。

关于 `config.js` 的详细设置进直接打开 `config.js` 文件查看。

requirejs
---------

用 `r.js` 来对requirejs进行合并和压缩，需要在 `config.js` 进行配置，默认已经开启，详细的r.js配置请查看：<https://github.com/jrburke/r.js>。

velocity
---------

默认开启velocity模板引擎，每个.vm文件有对应的.json文件对其提供数据支持，如果json文件不存在或内容为空则不提供任何数据。本工具使用 `gulp-velocityjs` 模块解析 velocity 模板，详情请查看：<https://github.com/richard-chen-1985/gulp-velocityjs>。
