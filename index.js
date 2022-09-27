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
//	ShareDB = require("sharedb"),
//	sharedbMongo = require("sharedb-mongo"),
	richText = require("rich-text"),
	config = require("./config"),
	path = require("path"),
	{installAccountManager} = require("./utils/accountManager"),
	installSheetsRouter = require("./routes/sheets"),
	installWebsocketManager = require("./utils/websocketManager");

let queryParse = (query) => {
	if(query === null) return {};

	let result = {};
	for(let [key, value] in new URLSearchParams(query)) {
		result[key] = value;
	}

	return result;
};
	
function main(app, prefix, server) {
	mongoose.connect(config.CONNECT_STRING, {useNewUrlParser: true, useUnifiedTopology: true});

	/* ShareDB.types.register(richText.type);

	let db = sharedbMongo({
		mongo: function(callback) {
			mongoose.connect(config.CONNECT_STRING, callback);
		}
	});
	const backend = new ShareDB({db: db, presence: true, doNotForwardSendPresenceErrorsToClient: true}); */

	mongoose.Schema.Types.String.checkRequired(v => typeof v === 'string');
	
	//app.use(express.urlencoded({"extended": true}));
	//app.use("/api/sheetData", express.text());
	app.use(bodyParser.json());
	app.use(bodyParser.urlencoded({extended: false}));
	app.use(cookieParser());
	
	installAccountManager(app, config);
	installSheetsRouter(app, config);
	// installWebsocketManager(app, config, backend, server);

	app.use("/", express.static(path.join(__dirname, "webroot")));

	return app;
}

if(require.main === module) {
	let http = require("http");
	let app = express();
	let server = http.createServer(app);
	app.set("query parser", "simple");

	app = main(app, "", server);

	server.listen(config.PORT, () => {
		console.log("Serving indefinitely on port", config.PORT);
	});
}
else {
	module.exports = main;
}