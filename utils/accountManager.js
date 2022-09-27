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

const Account = require("../models/accountModel"),
	  fs = require("fs"),
	  crypto = require("crypto"),
	  config = require("../config"),
	  CharacterSheet = require("../models/characterSheetModel");
const { constructReadQuery } = require("./commonQueries");

const minPasswordLength = config.MIN_PW_LENGTH || 6;
const maxPasswordLength = config.MAX_PW_LENGTH || 72;
const maxNameLength = config.MAX_NAME_LENGTH || 128;

const pbkdf2Iterations = config.KEYGEN_ITERATIONS || 20000;

const passwordSaltLength = config.PASSWORD_SALT_LENGTH || 16;
const resultantKeyLength = config.RESULTANT_KEY_LENGTH || 128;

const sessionKeyLength = config.SESSION_KEY_LENGTH || 40;

const sessionDuration = config.SESSION_LENGTH || 1000 * 60 * 60 * 24 * 7;

let enableAccountCreation = config.ACCOUNT_CREATION_DISABLED !== true;
const accountCreationRequiresVerification = config.ACCOUNT_CREATION_REQUIRES_VERIFICATION;

const maxActiveSessions = config.MAX_ACTIVE_SESSIONS || 5;

let verifierScript;
if(enableAccountCreation && accountCreationRequiresVerification) {
	try {
		verifierScript = require(config.ACCOUNT_CREATION_VERIFICATION_SCRIPT);
	}
	catch(e) {
		console.error(e);
		console.error("Failed to load account creation verification script. Account creation will be disabled.");
		enableAccountCreation = false;
	}
}

const emailRegex = /^\w+\@([\w\-]+\.)+(\w+)$/;

function newSession() {
	return (Buffer.from(crypto.randomBytes(sessionKeyLength))).toString("hex");
}

function validateSession(req, res, callback, failureCallback, lean, populate) {
	let _fail = (message) => {
		if(typeof failureCallback === "function") {
			return failureCallback(message);
		}
		else {
			return res.status(401).send(message);
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

	let filter = {email: email, session: {key: sessionKey, created: {$gte: Date.now() - sessionDuration}}};
	
	if(accountCreationRequiresVerification) {
		filter.verified = true;
	}

	let query = Account.findOne(filter);

	if(lean) {
		query = query.lean();
	}

	if(populate) {
		query = query.populate(populate);
	}

	return query.exec((err, acct) => {
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

			let query = {email: req.body.email};
			if(accountCreationRequiresVerification) {
				query.verified = true;
			}
			
			Account.findOne(query, (err, account) => {
				if(err || !account) {
					return res.status(400).send("Invalid credentials");
				}
				
				crypto.pbkdf2(req.body.password, account.passwordSalt, pbkdf2Iterations, resultantKeyLength, "sha256", (err, derivedKey) => {
					if(err) {
						console.error(err);
						return res.status(500).send("Error logging in");
					}
					
					if(account.passwordHash === derivedKey.toString("hex")) {
						if(!Array.isArray(account.sessions)) {
							account.session = [];

							if(account.sessionKey && account.sessionDate) {
								account.session.push({key: account.sessionKey, created: account.sessionDate});
							}
						}

						if(account.sessions.length >= maxActiveSessions) {
							account.sessions.shift();
						}

						let session = {
							key: newSession(),
							created: Date.now()
						};

						account.sessions.push(session);
						
						account.save().then((acct, err) => {
							if(err || !acct) {
								return res.status(500).send("Internal error while logging in");
							}
							
							return res.status(200)
								.cookie("email", account.email)
								.cookie("sessionKey", session.key)
								.send(session.key);
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

			if(!enableAccountCreation) {
				return res.status(400).send("Account creation is disabled");
			}
			
			let account = new Account();
			
			account.name = req.body.name;
			account.email = req.body.email;
			account.passwordSalt = Buffer.from(crypto.randomBytes(passwordSaltLength));
			
			crypto.pbkdf2(req.body.password, account.passwordSalt, pbkdf2Iterations, resultantKeyLength, "sha256", (err, derivedKey) => {
				if(err) {
					console.error(err);
					return res.status(500).send("Error creating account");
				}
				
				account.passwordHash = derivedKey.toString("hex");
				if(accountCreationRequiresVerification) {
					account.verified = false;
				}
				else {
					account.verified = true;
				}

				let deleteAndContinue = (code, err) => {
					Account.deleteOne({_id: account._id}).finally(() => {
						return res.status(code).send(err);
					});
				};
				
				account.save().then(() => {
					if(accountCreationRequiresVerification) {
						if(typeof verifierScript !== "function") {
							return deleteAndContinue(500, "Account creation requires verification, but no verification script is set");
						}
	
						verifierScript(account, () => {
							return res.status(200).send("Account created");
						}, (err) => {
							console.error(err);
							return deleteAndContinue(500, "Error sending verification email");
						});
					}
					else {
						return res.status(200).send("Account created");
					}
				}).catch((err) => {
					return res.status(500).send("Error creating account (duplicate email?)");
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
		
		let query = {email: email, session: {key: sessionKey, created: {$gt: Date.now() - sessionDuration}}};
		let update = {$pull: {session: {key: sessionKey}}};

		Account.findOneAndUpdate(query, update, {lean: true}, (err, acct) => {
			if(err || !acct) {
				return res.status(400).send("Invalid or missing credentials");
			}
			
			return res.status(200).send("Logged out");
		});
	});

	// Not an API endpoint

	if(accountCreationRequiresVerification) {
		app.get("/verify", (req, res) => {
			if(typeof req.query.email !== "string" || req.query.email.match(emailRegex) === null) {
				return res.status(400).send("Invalid or missing email");
			}
			if(typeof req.query.code !== "string") {
				return res.status(400).send("Invalid or missing key");
			}

			let sessionKey = newSession();
			let sessionDate = new Date();

			let update = {verified: true, $push: {sessions: {key: sessionKey, created: sessionDate}}};

			// Find the account with the given email and verification code, then set its verified to true
			Account.findOneAndUpdate({email: req.query.email, verificationCode: req.query.code, verified: false}, update, {lean: true}, (err, acct) => {
				if(err || !acct) {
					return res.status(400).send("Invalid or missing credentials");
				}

				res.cookie("email", acct.email, {maxAge: sessionDuration, httpOnly: false});
				res.cookie("sessionKey", sessionKey, {maxAge: sessionDuration, httpOnly: false});
				
				return res.redirect("/?verified");
			});
		});
	}
}

module.exports = {installAccountManager, validateSession};
