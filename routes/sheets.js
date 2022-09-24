const mongoose = require("mongoose"),
    randomUUID = require("crypto").randomUUID,
    CharacterSheet = require("../models/characterSheetModel"),
    CharacterSheetData = require("../models/sheetDataModel"),
    Account = require("../models/accountModel"),
    Portrait = require("../models/portraitModel"),
	multer = require("multer"),
    {validateSession} = require("../utils/accountManager"),
	{debug} = require("../utils/log");

let constructReadQuery = (id, acct) => {
	let query = {
		uuid: id,
	};

	if(!acct || !acct.isAdmin) {
		query.$or = [{public: true}, {publicWritable: true}];

		if(acct) {
			query.$or.push({owner: acct._id});
			query.$or.push({
				sharedWith: {
					owner: acct._id
				}
			});
		}
	}

	return query;
}

let constructWriteQuery = (id, acct) => {
	let query = {
		uuid: id
	};

	if(!acct || !acct.isAdmin) {
		query.$or = [{publicWritable: true}];

		if(acct) {
			query.$or.push({owner: acct._id});
			query.$or.push({
				sharedWith: {
					owner: acct._id,
					permission: {
						$in: ["write", "owner"]
					}
				}
			});
		}
	}

	return query;
}

let constructDeleteQuery = (id, acct) => {
	let query = {
		uuid: id
	};

	if(!acct || !acct.isAdmin) {
		query.$or = [
			{owner: acct._id},
			{
				sharedWith: {
					owner: acct._id,
					permission: "owner"
				}
			}
		];
	}

	return query;
}

module.exports = function(app, config) {
    app.route("/api/sheetData")
		.get((req, res) => {
			/* Get a character sheet's data */
			if(!req.query || (typeof req.query.id !== "string")) {
				return res.status(400).send("No id provided");
			}

			let sayInvalid = () => (res.status(404).send("Invalid id"));

			let doQuery = (acct) => {
				let query = constructReadQuery(req.query.id, acct);

				CharacterSheet.findOne(query).populate("owner", "name").lean().exec((err, sheet) => {
					if(err || !sheet) {
						console.error(err, sheet, query);
						return sayInvalid();
					}

					let ownerName = sheet.owner ? sheet.owner.name : undefined;
					let sheetData = sheet.sheetData;
					let sharedEntry = (sheet.sharedWith || []).find((share) => (share.owner.equals(acct._id)));
					let permission = sharedEntry && sharedEntry.permission;
					
					return res.status(200).set({
						"Content-Type": "text/json"
					}).send({sheetData: sheetData, sheetOwner: ownerName, lastModified: sheet.lastModified, permission: permission});
				});
			};

			validateSession(req, res, (acct) => {
				doQuery(acct);
			}, (err) => {
				doQuery();
			}, true);
		})
		.post((req, res) => {
			/* Create a new character sheet */
			let createSheet = (acct) => {
				let sheet = new CharacterSheet();
				
				if(acct !== null && acct !== undefined) {
					sheet.owner = acct._id;
				}

				sheet.save().then((results, err) => {
					if(err || !results) {
						debug(err);
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
				let query = constructWriteQuery(req.query.id, acct);
				
				let newData = {"sheetData": updateData, "lastModified": Date.now()};
				
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
				let query = constructDeleteQuery(req.body.id, acct);
				
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

			let resolveImage = (acct) => {
				let query = constructReadQuery(req.query.id, acct);

				CharacterSheet.findOne(query).select("portrait").populate("portrait").lean().exec((err, sheet) => {
					if(err || !sheet || !sheet.portrait) {
						return res.status(404).send("No portrait");
					}

					return res.status(200).set({
						"Content-Type": sheet.portrait.mimeType,
						"Content-Length": sheet.portrait.data.length().toString()
					}).send(sheet.portrait.data.buffer);
				});
			};

			validateSession(req, res, (acct) => {
				resolveImage(acct);
			}, (failureMessage) => {
				resolveImage();
			}, true);
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

			let updatePortrait = (acct) => {
				let query = constructWriteQuery(req.query.id, acct);

				let update = {
					"mimeType": req.file.mimetype,
					"data": req.file.buffer
				};

				CharacterSheet.findOne(query).lean().exec((err, sheet) => {
					if(err || !sheet) {
						return res.status(404).send("Invalid id");
					}

					if(sheet.portrait) {
						Portrait.findOneAndUpdate({"_id": sheet.portrait}, update, (err, portrait) => {
							if(err || !portrait) {
								return res.status(500).send("Error updating portrait");
							}

							return res.status(200).send("");
						});
					}
					else {
						let portrait = new Portrait(update);

						portrait.save((err, portrait) => {
							if(err || !portrait) {
								return res.status(500).send("Error saving portrait");
							}

							// We can simplify the query here
							CharacterSheet.updateOne({uuid: query.uuid}, {"portrait": portrait._id}, (err, sheet) => {
								if(err || !sheet) {
									return res.status(500).send("Error updating sheet");
								}

								return res.status(200).send("");
							});
						});
					}
				});
			};

			validateSession(req, res, (acct) => {
				updatePortrait(acct);
			}, (failureMessage) => {
				updatePortrait();
			}, true);
		})
		.delete((req, res) => {
			if(!req.query || (typeof req.query.id !== "string")) {
				return res.status(400).send("No id provided");
			}

			let deletePortrait = (acct) => {
				let query = constructWriteQuery(req.query.id, acct);

				let update = {
					$set: {
						"portrait": null
					}
				};

				CharacterSheet.findOneAndUpdate(query, update).lean().exec((err, sheet) => {
					if(err || !sheet) {
						return res.status(404).send("Invalid id");
					}

					Portrait.deleteOne({"_id": sheet.portrait}, (err, deleted) => {
						if(err || deleted.deletedCount < 1) {
							return res.status(500).send("Portrait not found");
						}

						return res.status(200).send("");
					});
				});
			};

			validateSession(req, res, (acct) => {
				deletePortrait(acct);
			}, (failureMessage) => {
				deletePortrait();
			}, true);
		})
	
	const nMatcher = /^(.*) \[(\d+)\]$/;

	app.post("/api/duplicateSheet", (req, res) => {
		if(!req.body || (typeof req.body.id !== "string")) {
			return res.status(400).send("No id provided");
		}
		
		validateSession(req, res, (acct) => {
			let query = constructReadQuery(req.body.id, acct);
			
			CharacterSheet.findOne(query).populate("portrait").exec((err, sheet) => {
				if(err || !sheet) {
					return res.status(400).send("Invalid id");
				}
				
				let sheetName = sheet.sheetData.characterName;
				let newName = "Untitled [2]";

				if(typeof sheetName === "string") {
					let match = sheetName.match(nMatcher);
					if(match === null) {
						newName = sheetName + " [2]";
					}
					else {
						let result = parseInt(match[2]);
						if(result === NaN) {
							newName = sheetName + " [2?]";
						}
						else {
							newName = match[1] + " [" + (result + 1).toString() + "]";
						}
					}
				}
				
				if(newName.length > 200) {
					newName = newName.substring(newName.length - 200);
				}

				let newSheet = new CharacterSheet();
				newSheet.sheetData = sheet.sheetData;
				newSheet._owner = sheet._owner;
				
				newSheet.save().then((newSheet, err) => {
					if(!newSheet || err) {
						console.error(err);
						return res.status(500).send("Internal error");
					}
					
					let respond = () => {
						return res.status(200).send(newSheet.uuid);
					}
					
					if(sheet.portrait) {
						let portrait = new Portrait();

						portrait.mimeType = sheet.portrait.mimeType;
						portrait.data = sheet.portrait.data;
						
						portrait.save().then((newPortrait, err) => {
							if(!newPortrait || err) {
								// Welp, it duplicated except for the portrait; good enough
								console.log(newPortrait, err);

								return respond();
							}
							else {
								newSheet.portrait = newPortrait._id;
								newSheet.save().then((newSheet, err) => {
									if(!newSheet || err) {
										console.error(err);
									}

									return respond();
								});
							}
						});
					}
					else {
						return respond();
					}
				});
			});
		});
	});
}
