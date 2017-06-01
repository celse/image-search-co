var mongoose  = require('mongoose');

var Schema = mongoose.Schema;

searchItemSechema = new Schema(
	{
		searchVal : String,
		searchDate : Date
	},{
		timestamps: true
	});

//Connect  model and collection 
var modelSearch = mongoose.model('searchitem', searchItemSechema); 
module.exports = modelSearch;