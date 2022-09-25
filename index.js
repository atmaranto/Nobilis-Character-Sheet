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
	mongoose = require("mongoose"),
	config = require("./config"),
	path = require("path"),
	{installAccountManager} = require("./utils/accountManager"),
	installSheetsRouter = require("./routes/sheets");

function main(app) {
	mongoose.connect(config.CONNECT_STRING);
	
	//app.use(express.urlencoded({"extended": true}));
	//app.use("/api/sheetData", express.text());
	app.use(bodyParser.json());
	app.use(bodyParser.urlencoded({extended: false}));
	app.use(cookieParser());
	
	installAccountManager(app, config);
	installSheetsRouter(app, config);

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