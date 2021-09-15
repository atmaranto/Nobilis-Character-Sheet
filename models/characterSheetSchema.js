const Schema = require("mongoose").Schema,
	  randomUUID = require("crypto").randomUUID;

module.exports = new Schema({
	uuid: {
		type: String,
		default: () => (randomUUID()),
		index: true
	},
	
	created: {
		type: Date,
		default: Date.now
	},
	
	lastModified: {
		type: Date,
		default: Date.now
	},
	
	sheetData: {
		type: String,
		default: null
	}
});