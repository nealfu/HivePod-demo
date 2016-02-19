// Services backend for HivePod-demo
//------------------------------------------------------------------------------
// <auto-generated>
//     This code was generated by Hivepod.io (http://hivepod.io) 
//     Code-gen engine version: 4.7.8.23143 
//     MEAN generator version:  1.4.35
//     at:                      2/19/2016 9:26:15 AM UTC
// </auto-generated>
//------------------------------------------------------------------------------

//Set the enviroment variable NODE_ENV = devel | qa | production to select the running enviroment. Default: devel
var environment = (process.env.NODE_ENV || 'devel');
var configuration = require('./conf/configuration').getConfiguration(environment);

var S = require('string');
var express = require('express');
var compression = require('compression');
var bodyParser = require('body-parser');
var multer  = require('multer');
var cookieParser = require('cookie-parser');
var session = require('express-session');
var MongoStore = require("connect-mongo")(session);
var morgan = require('morgan');
var mongoose = require('mongoose');
var baucis = require('baucis');
require('baucis-swagger');
require('baucis-swagger2');
var passport = require("passport");

var metamodel = require('./metamodel');
var models = require('./model');

var uploadMidleware = multer({ dest: './uploads/'});
var cnx = mongoose.connect(configuration.mongodbConnection, {}, connectionCallback);

function connectionCallback(err, db) {
    if (err) {
        console.error('Error: Invalid Database Connection');
        console.error(err);
    }
}

//Extend baucis with new operations via decorators and formatters -------
require('./services/baucis-csv.js').apply(baucis);
var decorators = require('./services/decorators');
decorators.apply(baucis);

// Create the express app 
var app = express();

//Configure app -------------------------------------
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
app.use(morgan('dev'));
app.use(compression({
    threshold: 512
}));  
app.use(bodyParser.urlencoded({
    extended: true,
    limit: '50mb'
}));
app.use(bodyParser.json({
    limit: '50mb'
}));
app.use(cookieParser());
app.use(session({ 
    secret: configuration.security.apiKey,
    resave: true,
    saveUninitialized: true,
    store: new MongoStore({  //db: mongoose.connection.db 
            url: configuration.mongodbConnection
        },
        function(db, err){
            console.log(err || "session on mongodb: setup ok");
        })
}));

app.use(passport.initialize());
app.use(passport.session()); //persistent login sessions

//storage client in mongoDb
var storageClient = require('./services/mongodbStorage.js');
storageClient.apply(cnx);

//cloud storage client in S3 (can replace mongoDb implementation)
//var storageClient = require('./services/cloudStorage.js');
//storageClient.apply(configuration.storage);


// Create the API routes & controllers  ---------------------------
var controllers = [];
Object.keys(models.models).forEach(function(key) { 
    var item = models.models[key];
	if(item.hasController) {
		var controller = baucis.rest(item.name, item.model);
		item.controller = controller;
		controllers.push(controller);
	}
});

//Add domain services -----------------------------------------------
require('./security/passport').apply(passport, models, configuration);

require('./security/authN').apply(app, models, passport, configuration);
var authz = require('./security/authZ').apply(app, models, configuration);
decorators.setAuthZModule(authz);

require('./services/swaggerDoc').apply(controllers);
require('./services/import').apply(app);
require('./services/general').apply(app, models, configuration);
require('./services/webhooks').apply(controllers);
require('./services/fileStorageHooks').apply(app, models, storageClient, uploadMidleware);
require('./services/relationsHooks').apply(models);
require('./services/whoami').apply(app, models, configuration);

require('./db-seed/seedData').apply(app, models, configuration);
//---------------------------------------------------------------------


var baucisInstance = baucis();
var swagger2Options = {
    title: 'HivePod-demo'    
};
require('./services/swagger2Doc').apply(baucisInstance, controllers, swagger2Options);

//Register plugins -----
var pluginManager = require('./services/pluginManager');
pluginManager.apply(app, metamodel, models, configuration, baucisInstance, {});
//Sample plugin. register an array of plugins
/* 
pluginManager.register([{
    name: 'plugin-101', 
    options: { key: 'value' }
}]);
*/

//Launch -------------------------------
app.use('/api', baucisInstance);
app.use('/', express.static(configuration.rootHttpDir, { 
    maxAge: configuration.staticCacheTime 
}));

app.listen(configuration.appPort);

console.log('HivePod-demo Backend - Server listening on: '+ 
            configuration.appHost + ':' + configuration.appPort + 
            ' Environment: '+ configuration.environment);

Object.keys(models.models).forEach(function(key) { 
    var resource = models.models[key];
    console.log('\tResource ' + S(resource.name).padRight(30) +' on   /api/' + resource.plural);
});
console.log('\tSwagger 1.1 API docs                    on   /api/documentation');
console.log('\tSwagger 2.0 API docs                    on   /api/swagger.json');
console.log('\tAngularJS admin web-client              on   /');
console.log('\tServing public files from:                   ' + configuration.rootHttpDir);
console.log('Application up and ready.');

