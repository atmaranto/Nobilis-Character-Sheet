const mongoose = require("mongoose"),
    randomUUID = require("crypto").randomUUID,
    CharacterSheet = require("../models/characterSheetModel"),
    CharacterSheetData = require("../models/sheetDataModel"),
    Account = require("../models/accountModel"),
    Portrait = require("../models/portraitModel"),
	multer = require("multer"),
    {validateSession} = require("../utils/accountManager"),
	{debug} = require("../utils/log"),
	{constructReadQuery, constructWriteQuery, constructDeleteQuery} = require("../utils/commonQueries"),
	validQueryPaths = require("../webroot/valid-query-paths.js");

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
					let sharedEntry = acct && (sheet.sharedWith || []).find((share) => (share.user.equals(acct._id)));
					let permission = {
						shared: sharedEntry,
						public: sheet.public,
						publicWritable: sheet.publicWritable
					};

					permission.ownerNoAdmin = (acct && sheet.owner && sheet.owner._id.equals(acct._id)) || (sharedEntry && sharedEntry.permission === "owner");
					permission.writeNoAdmin = permission.ownerNoAdmin || (sharedEntry && sharedEntry.permission === "write") || (permission.public && permission.publicWritable);
					permission.readNoAdmin = permission.writeNoAdmin || (sharedEntry && sharedEntry.permission === "read") || permission.public;

					permission.owner = permission.ownerNoAdmin || (acct && acct.isAdmin);
					permission.write = permission.writeNoAdmin || (acct && acct.isAdmin);
					permission.read = permission.readNoAdmin || (acct && acct.isAdmin);
					
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
						console.log(err);
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
	
	app.post("/api/claimSheet", (req, res) => {
		const sheetErrorString = "Invalid or missing sheet ID";
		
		if(typeof req.body.id !== "string") {
			return res.status(400).send(sheetErrorString);
		}
		
		return validateSession(req, res, (account) => {
			// NOTE: Consider setting publicWritable to false here
			CharacterSheet.findOneAndUpdate({"uuid": req.body.id, owner: null}, {owner: account._id}).lean().exec((err, sheet) => {
				if(err || !sheet) {
					return res.status(400).send(sheetErrorString);
				}
				
				return res.status(200).send("Sheet claimed successfully");
			});
		}, (failureMessage) => {
			return res.status(400).send("You aren't logged in");
		});
	});
	
	app.post("/api/unclaimSheet", (req, res) => {
		const sheetErrorString = "Invalid or missing sheet ID";
		
		if(typeof req.body.id !== "string") {
			return res.status(400).send(sheetErrorString);
		}
		
		return validateSession(req, res, (account) => {
			let query = constructDeleteQuery(req.body.id, account); // Not technically a delete query, but it requires the same permissions

			CharacterSheet.findOneAndUpdate(query, {owner: null, public: true, publicWritable: true}).lean().exec((err, sheet) => {
				if(err || !sheet) {
					return res.status(400).send(sheetErrorString);
				}
				
				return res.status(200).send("Sheet unclaimed successfully");
			});
		}, (failureMessage) => {
			return res.status(400).send("You aren't logged in");
		});
	});

	app.post("/api/permissions", (req, res) => {
		const sheetErrorString = "Invalid or missing sheet ID";
		
		if(typeof req.body.id !== "string") {
			return res.status(400).send(sheetErrorString);
		}
		if(typeof req.body.public !== "boolean") {
			return res.status(400).send("Invalid or missing public flag");
		}
		if(typeof req.body.publicWritable !== "boolean") {
			return res.status(400).send("Invalid or missing publicWritable flag");
		}
		
		return validateSession(req, res, (account) => {
			let query = constructDeleteQuery(req.body.id, account); // Not technically a delete query, but it requires the same permissions
			let update = {public: req.body.public, publicWritable: req.body.publicWritable};

			CharacterSheet.findOneAndUpdate(query, update).lean().exec((err, sheet) => {
				if(err || !sheet) {
					return res.status(400).send(sheetErrorString);
				}
				
				return res.status(200).send("Sheet unclaimed successfully");
			});
		}, (failureMessage) => {
			return res.status(400).send("You aren't logged in");
		});
	});

	/* app.post("/api/updateSheetVersion", (req, res) => {
		const sheetErrorString = "Invalid or missing sheet ID";
		
		if(typeof req.body.id !== "string") {
			return res.status(400).send(sheetErrorString);
		}
		
		return validateSession(req, res, (account) => {
			if(!account.isAdmin) {
				return res.status(403).send("You don't have permission to do that");
			}

			CharacterSheet.findOne({"uuid": req.body.id}).exec((err, sheet) => {
				if(err || !sheet) {
					return res.status(400).send(sheetErrorString);
				}

				let updateMessage;
				if(sheet.sheetData === undefined || sheet.sheetData === null) {
					sheet.sheetData = {};
					updateMessage = "Sheet data initialized";
				}
				else {
					if(typeof sheet.sheetData !== "string") {
						return res.status(500).send("Sheet data already up-to-date");
					}

					try {
						let sheetData = JSON.parse(sheet.sheetData);
						sheet.sheetData = sheetData;
					}
					catch(e) {
						return res.status(500).send("Error parsing sheet data");
					}

					updateMessage = "Sheet updated successfully";
				}

				sheet.save().then((sheet, err) => {
					if(err) {
						console.error(err);
						return res.status(500).send("Error updating sheet");
					}
					
					console.log(updateMessage);
					return res.status(200).send(updateMessage);
				});
			});
		}, (failureMessage) => {
			return res.status(400).send("You aren't logged in");
		});
	}); */
	
	// From https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Regular_Expressions
	function escapeRegExp(string) {
		return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); // $& means the whole matched string
	}
	
	app.post("/api/listSheets", (req, res) => {
		const PAGE_LENGTH = 20;
		
		let page = (typeof req.body.page === "string") ? parseInt(req.body.page) : (typeof req.body.page === "number") ? req.body.page : 0;
		
		return validateSession(req, res, (account) => {
			let query = constructReadQuery(undefined, account);
			delete query["uuid"]; // We don't actually want to get a specific sheet

			if(req.body.criteria !== null && req.body.criteria !== undefined) {
				if(typeof req.body.criteria !== "object") {
					return res.status(400).send("If specified, criteria must be an object");
				}
				
				for(let path in req.body.criteria) {
					if(typeof path !== "string" || !validQueryPaths.hasOwnProperty(path)) {
						return res.status(400).send("Invalid query path: " + path);
					}

					let type = validQueryPaths[path];
					let value = req.body.criteria[path];

					if(typeof value !== type) {
						if(typeof value === "object" && type === "number" && typeof value.value === "number" && ["gt", "lt", "gte", "lte"].indexOf(value.comparison) != -1) {
							// >,<,>=,<=

							value = {
								["$" + value.comparison]: value.value
							};
						}
						else {
							return res.status(400).send("Invalid query value for path " + path + ": " + value);
						}
					}

					let alteredPath = "sheetData." + path;

					if(type === "string") {
						// Enforce fuzzy matching
						value = new RegExp(escapeRegExp(value), "i");
					}
					
					query[alteredPath] = value;
				}
			}
			
			CharacterSheet.find(query).lean().sort("lastModified").skip(page * PAGE_LENGTH).populate("owner", ["name", "email"]).exec((err, sheets) => {
					if(err || !sheets) {
						console.error(err);
						return res.status(500).send("Unable to process request");
					}
					
					let sheetData = sheets.map((sheet) => {
						return {
							lastModified: sheet.lastModified,
							uuid: sheet.uuid,
							owner: (sheet.owner && sheet.owner.email) ? sheet.owner.email : null,
							sheetName: sheet.sheetData.characterName || sheet.sheetName,
							ownerName: sheet.sheetData.playerName,
							public: sheet.public,
							publicWritable: sheet.publicWritable
						};
					});
					
					res.status(200).json(sheetData);
				}
			);
		});
	});
}
