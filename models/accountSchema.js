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

const mongoose = require("mongoose");

module.exports = new mongoose.Schema({
	email: {
		type: String,
		required: "Each account must have an email",
		index: true,
		unique: true
	},
	
	created: {
		type: Date,
		default: Date.now
	},
	
	passwordHash: {
		type: String,
		required: "Each account must have a password"
	},
	
	passwordSalt: {
		type: Buffer,
		required: "Each account must have a randomly-generated password salt"
	},
	
	name: {
		type: String,
		required: "Each account must have a common name"
	},

	verified: {
		type: Boolean,
		default: false,
		required: "Each account must have a verification status"
	},

	verificationCode: {
		type: String,
		required: false
	},
	
	isAdmin: {
		type: Boolean,
		default: false
	},

	sessions: [{
		key: {
			type: String,
			required: "Each session must have a key"
		},

		created: {
			type: Date,
			default: Date.now,
			required: "Each session must have a creation date"
		}
	}]
});