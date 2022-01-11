/*

MIT License

Copyright (c) 2021 Anthony Maranto

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

const Account = require("../models/accountModel"),
	  fs = require("fs"),
	  crypto = require("crypto"),
	  config = require("../config"),
	  CharacterSheet = require("../models/characterSheetModel");

const minPasswordLength = config.MIN_PW_LENGTH || 6;
const maxPasswordLength = config.MAX_PW_LENGTH || 72;
const maxNameLength = config.MAX_NAME_LENGTH || 128;

const pbkdf2Iterations = config.KEYGEN_ITERATIONS || 20000;

const passwordSaltLength = config.PASSWORD_SALT_LENGTH || 16;
const resultantKeyLength = config.RESULTANT_KEY_LENGTH || 128;

const sessionKeyLength = config.SESSION_KEY_LENGTH || 40;

const sessionDuration = config.SESSION_LENGTH || 1000 * 60 * 60 * 24 * 7;

const enableAccountCreation = config.ACCOUNT_CREATION_DISABLED != true;

const emailRegex = /^\w+\@([\w\-]+\.)+(\w+)$/;

function newSession() {
	return (Buffer.from(crypto.randomBytes(sessionKeyLength))).toString("hex");
}

function validateSession(req, res, callback, failureCallback) {
	let _fail = (message) => {
		if(typeof failureCallback === "function") {
			return failureCallback(message);
		}
		else {
			return res.status(400).send(message);
		}
	};
	
	if((typeof req.body.email !== "string" || req.body.email.match(emailRegex) === null) && (typeof req.cookies.email !== "string" || req.cookies.email.match(emailRegex) === null)) {
		return _fail("Invalid or missing email");
	}
	if(typeof req.body.sessionKey !== "string" && typeof req.cookies.sessionKey !== "string") {
		return _fail("Invalid or missing session");
	}
	
	let email = req.body.email || req.cookies.email;
	let sessionKey = req.body.sessionKey || req.cookies.sessionKey;
	
	return Account.findOne({email: email, sessionKey: sessionKey, sessionDate: {$gte: Date.now() - sessionDuration}}, (err, acct) => {
		if(err || !acct) {
			return _fail("Invalid or missing credentials");
		}
		
		return callback(acct);
	});
}

function installAccountManager(app) {
	app.route("/api/account")
		.post((req, res) => {
			// Login
			if(typeof req.body.email !== "string" || req.body.email.match(emailRegex) === null) {
				return res.status(400).send("Invalid or missing email");
			}
			if(typeof req.body.password !== "string" || req.body.password.length > maxPasswordLength || req.body.password.length < minPasswordLength) {
				return res.status(400).send("Invalid password");
			}
			
			Account.findOne({email: req.body.email}, (err, account) => {
				if(err || !account) {
					return res.status(400).send("Invalid credentials");
				}
				
				crypto.pbkdf2(req.body.password, account.passwordSalt, pbkdf2Iterations, resultantKeyLength, "sha256", (err, derivedKey) => {
					if(err) {
						console.error(err);
						return res.status(500).send("Error logging in");
					}
					
					if(account.passwordHash === derivedKey.toString("hex")) {
						account.sessionKey = newSession();
						account.sessionDate = Date.now();
						
						account.save().then((acct, err) => {
							if(err || !acct) {
								return res.status(500).send("Internal error while logging in");
							}
							
							return res.status(200).send(account.sessionKey);
						});
					}
					else {
						return res.status(400).send("Invalid credentials");
					}
				});
			});
		})
		.put((req, res) => {
			// Create account
			if(typeof req.body.email !== "string" || req.body.email.match(emailRegex) === null) {
				return res.status(400).send("Invalid or missing email");
			}
			if(typeof req.body.password !== "string" || req.body.password.length > maxPasswordLength || req.body.password.length < minPasswordLength) {
				return res.status(400).send("Invalid password");
			}
			if(typeof req.body.name !== "string" || req.body.name.length > maxNameLength || req.body.name.length == 0) {
				return res.status(400).send("Missing or invalid name");
			}
			
			let account = new Account();
			
			account.name = req.body.name;
			account.email = req.body.email;
			account.passwordSalt = Buffer.from(crypto.randomBytes(passwordSaltLength));
			account.sessionKey = newSession();
			
			crypto.pbkdf2(req.body.password, account.passwordSalt, pbkdf2Iterations, resultantKeyLength, "sha256", (err, derivedKey) => {
				if(err) {
					console.error(err);
					return res.status(500).send("Error creating account");
				}
				
				account.passwordHash = derivedKey.toString("hex");
				
				account.save().then((acct, err) => {
					if(err) {
						console.error(err);
						return res.status(500).send("Error creating account");
					}
					
					return res.status(200).send(account.sessionKey);
				});
			});
		});
	
	app.post("/api/account/logout", (req, res) => {
		if((typeof req.body.email !== "string" || req.body.email.match(emailRegex) === null) && (typeof req.cookies.email !== "string" || req.cookies.email.match(emailRegex) === null)) {
			return res.status(400).send("Invalid or missing email");
		}
		if(typeof req.body.sessionKey !== "string" && typeof req.cookies.sessionKey !== "string") {
			return res.status(400).send("Invalid or missing session");
		}
		
		let email = req.body.email || req.cookies.email;
		let sessionKey = req.body.sessionKey || req.cookies.sessionKey;
		
		Account.findOneAndUpdate({email: email, sessionKey: sessionKey, sessionDate: {$gt: Date.now() - sessionDuration}}, {sessionKey: null}, {lean: true}, (err, acct) => {
			if(err || !acct) {
				return res.status(400).send("Invalid or missing credentials");
			}
			
			return res.status(200).send("Logged out");
		});
	});
	
	app.post("/api/account/claimSheet", (req, res) => {
		const sheetErrorString = "Invalid or missing sheet ID";
		
		if(typeof req.body.sheet !== "string") {
			return res.status(400).send(sheetErrorString);
		}
		
		return validateSession(req, res, (account) => {
			CharacterSheet.findOneAndUpdate({"uuid": req.body.sheet, owner: null}, {owner: account._id}, (err, sheet) => {
				if(err || !sheet) {
					return res.status(400).send(sheetErrorString);
				}
				
				return res.status(200).send("Sheet claimed successfully");
			});
		}, (failureMessage) => {
			return res.status(400).send("You aren't logged in");
		});
	});
	
	// From https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Regular_Expressions
	function escapeRegExp(string) {
		return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); // $& means the whole matched string
	}
	
	app.post("/api/account/listSheets", (req, res) => {
		const PAGE_LENGTH = 20;
		
		let page = (typeof req.body.page === "string") ? parseInt(req.body.page) : 0;
		let searchName = (typeof req.body.searchName === "string") ? req.body.searchName : null;
		let searchOwner = (typeof req.body.searchOwner === "string") ? req.body.searchOwner : null;
		
		return validateSession(req, res, (account) => {
			let query = {};
			
			if(!account.isAdmin) {
				query.owner = account._id;
			}
			if(searchName) {
				query.sheetName = new RegExp(escapeRegExp(searchName), "i");
			}
			if(searchOwner) {
				query.ownerName = new RegExp(escapeRegExp(searchOwner), "i");
			}
			
			CharacterSheet.find(
				query,
				"-sheetData",
				{lean: true, sort: "lastModified", skip: page * PAGE_LENGTH, limit: PAGE_LENGTH},
				(err, sheets) => {
					if(err || !sheets) {
						console.error(err);
						return res.status(500).send("Unable to process request");
					}
					
					let sheetData = sheets.map((sheet) => {
						return {lastModified: sheet.lastModified, uuid: sheet.uuid, owner: "Unknown", sheetName: sheet.sheetName, ownerName: sheet.ownerName};
					});
					
					res.status(200).json(sheetData);
				}
			);
		});
	});
}

module.exports = {installAccountManager, validateSession};