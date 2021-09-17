/* (c) 2021 Anthony Maranto */

var express = require("express"),
	app = express(),
	mongoose = require("mongoose"),
	config = require("./config"),
	crypto = require("crypto"),
	CharacterSheet = require("./models/characterSheetModel");

mongoose.connect(config.CONNECT_STRING);

app.set("query parser", "simple");
//app.use(express.urlencoded({"extended": true}));
app.use("/api/sheetData", express.text());

app.route("/api/sheetData")
	.get((req, res) => {
		if(!req.query || (typeof req.query.id !== "string")) {
			return res.status(400).send("No id provided");
		}
		
		CharacterSheet.findOne({"uuid": req.query.id}, (err, sheet) => {
			if(err || !sheet) {
				return res.status(404).send("Invalid id");
			}
			
			if(sheet.sheetData == null) {
				return res.status(200).json({});
			}
			
			return res.status(200).set({
				"Content-Type": "text/json",
				"Content-Length": sheet.sheetData.length.toString()
			}).send(sheet.sheetData);
		});
	})
	.post((req, res) => {
		let sheet = new CharacterSheet();
		
		sheet.save().then((sheet, err) => {
			if(err || !sheet) {
				return res.status(500).send("Unable to create new sheet");
			}
			
			return res.status(200).send(sheet.uuid);
		});
	})
	.put((req, res) => {
		if(!req.query || (typeof req.query.id !== "string")) {
			return res.status(400).send("No id provided");
		}
		
		let updateData = req.body;
		if(updateData.length > config.MAX_READ_SIZE) {
			return res.status(413).send("Content too long");
		}
		
		CharacterSheet.findOneAndUpdate({"uuid": req.query.id}, {"sheetData": updateData, "lastModified": Date.now()}, (err, sheet) => {
			if(err || !sheet) {
				return res.status(400).send("Invalid id");
			}
			
			return res.status(200).send(sheet.uuid);
		});
	});

app.use("/", express.static("webroot"));

app.listen(config.PORT, () => {
	console.log("Serving indefinitely on port", config.PORT);
});