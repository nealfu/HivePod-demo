//Hivepod Metamodel
var meta = require('./meta');

var metamodel = new meta.Metamodel({
	classes : [
		new meta.Class({
			name: 'User',
			attributes: [
				new meta.Attribute({ name: 'Name', type: 'string', required: true }),
				new meta.Attribute({ name: 'Lastname', type: 'string', required: true }),
				new meta.Attribute({ name: 'Age', type: 'int' }),
				new meta.Attribute({ name: 'IsActive', type: 'bool', required: true })	
			],
			operations: [
				new meta.Operation({ name: 'query',  isQuery: true }),
				new meta.Operation({ name: 'create', isCreation: true }),
				new meta.Operation({ name: 'update', isUpdate: true }),
				new meta.Operation({ name: 'delete', isDeletion: true })
			]			
		}),
		new meta.Class({
			name: 'Place',
			attributes: [
				new meta.Attribute({ name: 'Name', type: 'string', required: true }),
				new meta.Attribute({ name: 'Description', type: 'string' }),
				new meta.Attribute({ name: 'Location', type: 'geopoint' }),
				new meta.Attribute({ name: 'Picture', type: 'image' })	
			],
			operations: [
				new meta.Operation({ name: 'query',  isQuery: true }),
				new meta.Operation({ name: 'create', isCreation: true }),
				new meta.Operation({ name: 'update', isUpdate: true }),
				new meta.Operation({ name: 'delete', isDeletion: true })
			]			
		})	
	],
	associations : [
		new meta.Association({
			name: 'UserVisitedPlaces',
			composition: false,
			aClass: 'user',
			aRole: 'visitedPlaces',
			aMinCardinality: 0,
			aMaxCardinality: Number.MAX_VALUE,
			bClass: 'place',
			bRole: 'user',
			bMinCardinality: 0,
			bMaxCardinality: 1
		})	
	]
});
		
module.exports = metamodel;
