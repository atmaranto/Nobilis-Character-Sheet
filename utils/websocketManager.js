let WebSocket = require('ws'),
	WebSocketJSONStream = require("../webroot/websocket-json-stream"), // require('@teamwork/websocket-json-stream'),
	{validateSession} = require('./accountManager.js'),
	url = require("url");

let installWebsocketManager = (app, config, backend, server) => {
    let wss = new WebSocket.Server({server: server});

	wss.on("connection", (ws, req) => {
		let parsed = url.parse(req.url);
		let queryData = queryParse(parsed.query);
		let urlPath = parsed.pathname;

		if(prefix.length > 0 && path.startsWith("/" + prefix)) {
			urlPath = urlPath.substring(prefix.length + 1);
		}

		let match = urlPath.match(/^\/ws\/editor$/);

		if(match === undefined) {
			ws.close(1008, "Invalid path " + urlPath);
			return;
		}

		validateSession(req, null, (acct) => {
			let stream = new WebSocketJSONStream(ws);
			stream.on("meta", (data) => {
				// Metadata just came in
				
			});
			backend.listen(stream);
		}, (err) => {
			ws.close(1008, "Invalid or missing credentials");
		});
	});

    return wss;
};

module.exports = installWebsocketManager;