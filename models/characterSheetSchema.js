/*

MIT License

Copyright (c) 2022 Anthony Maranto

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.

*/

const mongoose = require("mongoose"),
	  randomUUID = require("crypto").randomUUID,
	  sheetData = require("./sheetData");

module.exports = new mongoose.Schema({
	uuid: {
		type: String,
		default: () => (randomUUID()),
		index: true,
		required: true
	},
	
	portrait: {
		type: mongoose.ObjectId,
		default: null,
		ref: 'portrait'
	},
	
	created: {
		type: Date,
		default: Date.now,
		required: true
	},
	
	lastModified: {
		type: Date,
		default: Date.now,
		required: true
	},
	
	sheetData: sheetData,
	
	owner: {
		type: mongoose.ObjectId,
		default: null,
		required: false,
		ref: 'account'
	},

	sharedWith: [{
		user: {
			type: mongoose.ObjectId,
			ref: 'account'
		},

		permission: {
			type: String,
			enum: ['read', 'write', 'owner'],
			default: 'read'
		}
	}],

	public: {
		type: Boolean,
		default: false
	},

	publicWritable: {
		type: Boolean,
		default: false
	}
});