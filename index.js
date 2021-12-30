/*

MIT License

Copyright (c) 2020 Anthony Maranto

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
	mongoose = require("mongoose"),
	config = require("./config"),
	crypto = require("crypto"),
	CharacterSheet = require("./models/characterSheetModel");

function main(app) {
	mongoose.connect(config.CONNECT_STRING);
	
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