//plugin mananger -- Dinamically loads Pod plugins
/*eslint no-unused-vars: 0*/

var plugins = [];
var _app, _metamodel, _models, _configuration, _baucisInstance, _options;

function apply(app, metamodel, models, configuration, baucisInstance, options) {
	_app = app;	
	_metamodel = metamodel;
	_models = models;	
	_configuration = configuration;	
	_baucisInstance = baucisInstance;	
	_options = options;
}

function register(pluginsConf) {
	if (!pluginsConf) {
		return;
	}	
	pluginsConf.forEach(function(item) {
		registerPlugin(item.name, item.options);	
	});
}
function registerPlugin(pluginName, options) {
	try {	
		var plugin = require('../plugins/' + pluginName); //dynamically load the plugin code
		
		if (plugin && plugin.name && plugin.contractVersion) {
			console.log('Loading plugin: ' + plugin.name + ' ' + plugin.contractVersion + ' by ' + plugin.author);
		}
		else {
			console.log('Skiping ' + pluginName + '. Do not satisfy the plugin contract.');
			return;
		}
		if (plugin.configure) {
			plugin.configure(_configuration, options);
		}
		if (plugin.extendModel) {
			plugin.extendModel(_metamodel);
		}
		if (plugin.extendMongoose) {
			plugin.extendMongoose(_models);
		}
		if (plugin.extendBaucis) {
			plugin.extendBaucis(_baucisInstance);
		}
		if (plugin.extendSwagger2) {
			plugin.extendSwagger2(_baucisInstance, _baucisInstance.swagger2Document);
		}
		if (plugin.extendExpress) {
			plugin.extendExpress(_app);
		}
		console.log('Plugin: ' + plugin.name + ' loaded.');

		plugins.push(plugin);
	}
	catch (err) {
		console.error(err);
		throw err;
	}
}

module.exports = {
	apply : apply,
	register : register,
	plugins : plugins
};