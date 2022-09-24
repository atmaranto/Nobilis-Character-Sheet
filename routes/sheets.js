const randomUUID = require("crypto").randomUUID,
    CharacterSheet = require("../models/characterSheetModel"),
    CharacterSheetData = require("../models/sheetDataModel"),
    Portrait = require("../models/portraitModel"),
	multer = require("multer"),
    {validateSession} = require("../utils/accountManager"),
	{debug} = require("../utils/log");

module.exports = function(app, config) {
    app.route("/api/sheetData")
		.get((req, res) => {
			if(!req.query || (typeof req.query.id !== "string")) {
				return res.status(400).send("No id provided");
			}

			let sayInvalid = () => (res.status(404).send("Invalid id"));
			
			CharacterSheet.findOne({"uuid": req.query.id}).lean().exec((err, sheet) => {
				if(err || !sheet) {
					return sayInvalid();
				}

				console.log(sheet.owner, sheet.lastModified);
				
				let resolveSheet = (permission) => {
					let sheetData = sheet.sheetData;
					
					return res.status(200).set({
						"Content-Type": "text/json"
					}).send({sheetData: sheetData, sheetOwner: sheet.owner, lastModified: sheet.lastModified, permission: permission});
				};
				
				if(sheet.owner !== null && sheet.owner !== undefined && sheet.public !== true) {
					validateSession(req, res, (acct) => {
						if(!sheet.owner || acct._id.equals(sheet.owner) || acct.isAdmin) {
							return resolveSheet();
						}
						else {
							let found = acct.sharedSheets && acct.sharedSheets.find((sharedSheet) => sharedSheet.id.equals(sheet._id));

							if(found) {
								return resolveSheet(found.permission);
							}
							else {
								return sayInvalid();
							}
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

				sheet.sheetData = new CharacterSheetData();
				let callback = (sheet, err) => {
					if(err || !sheet) {
						debug(err);
						return res.status(500).send("Unable to create new sheet");
					}
					
					return res.status(200).send(sheet.uuid);
				};
				
				if(acct !== null && acct !== undefined) {
					sheet.owner = acct._id;
					Account.updateOne({_id: acct._id}, {$addToSet: {ownedSheets: sheet}}).exec((err, result) => callback(result, err));
				}
				else {
					sheet.save().then(callback);
				}
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
			}, true);
		})
		.put((req, res) => {
			if(!req.query || (typeof req.query.id !== "string")) {
				return res.status(400).send("No id provided");
			}
			
			if(typeof req.body.sheetData !== "object") {
				return res.status(400).send("No sheet data provided");
			}
			
			let updateData = req.body.sheetData;
			
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
				console.log(newData);
				
				CharacterSheet.findOneAndUpdate(query, newData, (err, sheet) => {
					if(err || !sheet) {
						debug(err);
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
					
					Portrait.findOneAndDelete({"uuid": req.body.id}, {lean: true}, (err, portrait) => {
						if(err || !portrait) {
							// We'll assume the error is just because there's no portrait associated with this sheet
							return res.status(200).send("Deleted sheet");
						}
						
						return res.status(200).send("Deleted sheet and portrait");
					});
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
					
					if(typeof sheet.sheetData.portrait === "string") {
						Portrait.findOne({"uuid": req.body.id}, (err, portrait) => {
							if(!portrait || err) {
								console.error("Unable to find portrait for character sheet id", sheet.uuid);
								
								return res.status(200).send(newSheet._id);
							}
							
							portrait._id = mongoose.Types.ObjectId();
							portrait.uuid = sheet.uuid;
							portrait.isNew = true;
							
							portrait.save((err, newPortrait) => {
								if(!newPortrait || err) {
									// Welp, it duplicated except for the portrait; good enough
									console.log(err);
								}
								
								return res.status(200).send(newSheet._id);
							});
						});
					}
					else {
						return res.status(200).send(newSheet._id);
					}
				});
			});
		});
	});
}
