// plugin-101
// Sample plug-in skeleton to extend hivepod functionality.
// A set of functions will be called in this order:
/*
	apply : 		plugin registration
	configure
	extendModel
	extendMongoose
	extendBaucis
	extendSwagger2
	extendExpress
	
*/

//Called on registration
function apply(app, configuration, metamodel, models, baucis, authzMiddleware) {
	console.log("  plugin- apply()");	
}


//Current configuration for current enviroment will be passed here
//A chance is provided to read configuration or to extend it
//Options for plugig are passed here as options
function configure(configuration, options) {	
	console.log("  plugin- configure()");	
}

//Hook to extend or change the metamodel of the app
function extendModel(metamodel) {	
	console.log("  plugin- extendModel()");	
}

//Hook to extend or change the Mongoose models
function extendMongoose(models) {	
	console.log("  plugin- extendMongoose()");	
}

//Hook to extend or change baucis rest controllers 
function extendBaucis(baucisInstance) {	
	console.log("  plugin- extendBaucis()");	
}

//Hook to extend or change exposed Swagger API docs 
function extendSwagger2(baucisInstance, sw2Root) {	
	console.log("  plugin- extendSwagger2()");	
}

//Hook to extend or change the expres middleware 
function extendExpress(app) {	
	console.log("  plugin- extendExpress()");	
}

module.exports = {
	//metadata ---
	name: 'plugin-101', 
	contractVersion: 'pod-plugin-1.0',
	author: 'icinetic',

	//interface ---	
	apply : apply,
	configure : configure,
	extendModel : extendModel,
	extendMongoose : extendMongoose,
	extendBaucis : extendBaucis,
	extendSwagger2 : extendSwagger2,
	extendExpress : extendExpress	
};