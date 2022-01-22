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

var express = require("express"),
	bodyParser = require("body-parser"),
	cookieParser = require("cookie-parser"),
	multer = require("multer"),
	mongoose = require("mongoose"),
	config = require("./config"),
	crypto = require("crypto"),
	randomUUID = require("crypto").randomUUID,
	path = require("path"),
	CharacterSheet = require("./models/characterSheetModel"),
	Portrait = require("./models/portraitModel"),
	{installAccountManager, validateSession} = require("./utils/accountManager");

function main(app) {
	mongoose.connect(config.CONNECT_STRING);
	
	//app.use(express.urlencoded({"extended": true}));
	//app.use("/api/sheetData", express.text());
	app.use(bodyParser.json());
	app.use(bodyParser.urlencoded({extended: false}));
	app.use(cookieParser());

	app.route("/api/sheetData")
		.get((req, res) => {
			if(!req.query || (typeof req.query.id !== "string")) {
				return res.status(400).send("No id provided");
			}
			
			CharacterSheet.findOne({"uuid": req.query.id}, (err, sheet) => {
				if(err || !sheet) {
					return res.status(404).send("Invalid id");
				}
				
				let resolveSheet = () => {
					let sheetData = sheet.sheetData;
					if(sheetData == null) {
						sheetData = "{}";
					}
					
					return res.status(200).set({
						"Content-Type": "text/json",
						"Content-Length": sheetData.length.toString()
					}).send({sheetData: sheetData, sheetName: sheet.sheetName, sheetOwner: sheet.owner, ownerName: sheet.ownerName});
				};
				
				if(sheet.owner !== null) {
					validateSession(req, res, (acct) => {
						if(!sheet.owner || acct._id.equals(sheet.owner)  || acct.isAdmin) {
							return resolveSheet();
						}
						else {
							return res.status(404).send("Invalid id");
						}
					});
				}
				else {
					return resolveSheet();
				}
			});
		})
		.post((req, res) => {
			let createSheet = (acct) => {
				let sheet = new CharacterSheet();
				
				if(acct !== null && acct !== undefined) {
					sheet.owner = acct._id;
				}
				
				sheet.save().then((sheet, err) => {
					if(err || !sheet) {
						return res.status(500).send("Unable to create new sheet");
					}
					
					return res.status(200).send(sheet.uuid);
				});
			};
			
			return validateSession(req, res, (acct) => {
				return createSheet(acct);
			}, (failureMessage) => {
				if(config.ENABLE_ANONYMOUS_SHEET_CREATION) {
					return createSheet();
				}
				else {
					return res.status(400).send(failureMessage);
				}
			});
		})
		.put((req, res) => {
			if(!req.query || (typeof req.query.id !== "string")) {
				return res.status(400).send("No id provided");
			}
			
			if(typeof req.body.sheetData !== "string") {
				return res.status(400).send("No sheet data provided");
			}
			
			let updateData = req.body.sheetData;
			if(updateData.length > config.MAX_READ_SIZE) {
				return res.status(413).send("Content too long");
			}
			
			let updateSheet = (acct) => {
				let query = {"uuid": req.query.id};
				
				if(!acct || !acct.isAdmin) {
					if(acct) {
						query["$or"] = [{owner: null}, {owner: acct._id}];
					}
					else {
						query["owner"] = null;
					}
				}
				
				let newData = {"sheetData": updateData, "lastModified": Date.now()};
				
				if(typeof req.body.playerName === "string" && req.body.playerName.length < 100) {
					newData.ownerName = req.body.playerName;
				}
				
				if(typeof req.body.characterName === "string" && req.body.characterName.length < 100) {
					newData.sheetName = req.body.characterName;
				}
				
				CharacterSheet.findOneAndUpdate(query, newData, (err, sheet) => {
					if(err || !sheet) {
						return res.status(400).send("Invalid id");
					}
					
					return res.status(200).send(sheet.uuid);
				});
			};
			
			validateSession(req, res, (acct) => {
				updateSheet(acct);
			}, (failureMessage) => {
				updateSheet();
			});
		})
		.delete((req, res) => {
			if(!req.body || (typeof req.body.id !== "string")) {
				return res.status(400).send("No id provided");
			}
			
			validateSession(req, res, (acct) => {
				let query = {"uuid": req.body.id};
				
				if(!acct.isAdmin) {
					query["owner"] = acct._id;
				}
				
				CharacterSheet.findOneAndDelete(query, {lean: true}, (err, sheet) => {
					if(err || !sheet) {
						return res.status(400).send("Invalid id");
					}
					
					return res.status(200).send("Deleted");
				});
			});
		});
	
	let upload = multer({storage: multer.memoryStorage({limits: {fileSize: "1MB", "files": 1}})});
	let legalUploads = ["image/png", "image/jpg", "image/jpeg", "image/bmp"];
	let maxUploadSize = config.MAX_PORTRAIT_UPLOAD_SIZE_MB || 1;
	app.route("/api/sheetImage")
		.get((req, res) => {
			if(!req.query || (typeof req.query.id !== "string")) {
				return res.status(400).send("No id provided");
			}
			
			CharacterSheet.findOne({"uuid": req.query.id}, (err, sheet) => {
				if(err || !sheet) {
					return res.status(404).send("Invalid id");
				}
				
				let resolveSheet = () => {
					Portrait.findOne({"uuid": req.query.id}, (err, portrait) => {
						if(err || !portrait) {
							return res.status(404).send("No portrait");
						}
						
						return res.status(200).set({
							"Content-Type": portrait.mimeType,
							"Content-Length": portrait.data.length.toString()
						}).send(portrait.data);
					});
				};
				
				if(sheet.owner !== null) {
					validateSession(req, res, (acct) => {
						if(!sheet.owner || acct._id.equals(sheet.owner)  || acct.isAdmin) {
							return resolveSheet();
						}
						else {
							return res.status(404).send("Invalid id");
						}
					});
				}
				else {
					return resolveSheet();
				}
			});
		})
		.put(upload.single("portrait"), (req, res) => {
			if(!req.query || (typeof req.query.id !== "string")) {
				return res.status(400).send("No id provided");
			}
			if(!req.file) {
				return res.status(400).send("Missing portrait upload");
			}
			if(!legalUploads.indexOf(req.file.mimetype.toLowerCase()) == -1) {
				return res.stauts(400).send("Invalid file mime type");
			}
			if(req.file.size > maxUploadSize * 1024 * 1024) {
				return res.status(400).send("Portrait too large");
			}
			
			CharacterSheet.findOne({"uuid": req.query.id}, (err, sheet) => {
				if(err || !sheet) {
					return res.status(404).send("Invalid id");
				}
				
				let resolveSheet = () => {
					Portrait.updateOne({"uuid": req.query.id}, {"data": req.file.buffer, "mimeType": req.file.mimetype}, {upsert: true}, (err, result) => {
						if(err || !result) {
							return res.status(404).send("Portrait not found");
						}
						
						return res.status(200).send("");
					});
				};
				
				if(sheet.owner !== null) {
					validateSession(req, res, (acct) => {
						if(!sheet.owner || acct._id.equals(sheet.owner)  || acct.isAdmin) {
							return resolveSheet();
						}
						else {
							return res.status(404).send("Invalid id");
						}
					});
				}
				else {
					return resolveSheet();
				}
			});
		})
		.delete((req, res) => {
			if(!req.query || (typeof req.query.id !== "string")) {
				return res.status(400).send("No id provided");
			}
			
			CharacterSheet.findOne({"uuid": req.query.id}, (err, sheet) => {
				if(err || !sheet) {
					return res.status(404).send("Invalid id");
				}
				
				let resolveSheet = () => {
					Portrait.deleteOne({"uuid": req.query.id}, (err, deleted) => {
						if(err || deleted.deleteCount < 1) {
							return res.status(404).send("No portrait found");
						}
						
						return res.status(200).send("");
					});
				};
				
				if(sheet.owner !== null) {
					validateSession(req, res, (acct) => {
						if(!sheet.owner || acct._id.equals(sheet.owner)  || acct.isAdmin) {
							return resolveSheet();
						}
						else {
							return res.status(404).send("Invalid id");
						}
					});
				}
				else {
					return resolveSheet();
				}
			});
		})
	
	const nMatcher = /^(.*) \[(\d+)\]$/;
	app.post("/api/duplicateSheet", (req, res) => {
		if(!req.body || (typeof req.body.id !== "string")) {
			return res.status(400).send("No id provided");
		}
		
		validateSession(req, res, (acct) => {
			let query = {"uuid": req.body.id};
			
			if(!acct.isAdmin) {
				query["owner"] = acct._id;
			}
			
			CharacterSheet.findOne(query, (err, sheet) => {
				if(err || !sheet) {
					return res.status(400).send("Invalid id");
				}
				
				let newName = "Untitled [2]";
				if(typeof sheet.sheetName === "string") {
					let match = sheet.sheetName.match(nMatcher);
					if(match === null) {
						newName = sheet.sheetName + " [2]";
					}
					else {
						let result = parseInt(match[2]);
						if(result === NaN) {
							newName = sheet.sheetName + " [2?]";
						}
						else {
							newName = match[1] + " [" + (result + 1).toString() + "]";
						}
					}
				}
				
				if(newName.length > 200) {
					newName = newName.substr(newName.length - 200);
				}
				
				sheet.sheetName = newName;
				sheet._id = mongoose.Types.ObjectId();
				sheet.uuid = randomUUID();
				sheet.isNew = true;
				
				sheet.save((err, newSheet) => {
					if(!newSheet || err) {
						console.error(err);
						return res.status(500).send("Internal error");
					}
					
					return res.status(200).send(newSheet._id);
				});
			});
		});
	});
	
	installAccountManager(app);

	app.use("/", express.static(path.join(__dirname, "webroot")));
	return app;
}

if(require.main === module) {
	let app = main(express());
	app.listen(config.PORT, () => {
		console.log("Serving indefinitely on port", config.PORT);
	});
}
else {
	module.exports = main;
}