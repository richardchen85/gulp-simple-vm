/**
 * requirejs配置文件
 */
requirejs.config({
	waitSeconds: 200,
	paths: {
		requirejs: 'lib/require',
		jquery: 'lib/jquery',
		pin: 'lib/jquery.pin'
	},
	shim: {
		pin:{
			deps: ['jquery'],
			exports:"jQuery.fn.pin"
		}
	}
});

require(["main"]);