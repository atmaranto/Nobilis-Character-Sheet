let WebSocket = require('ws'),
	WebSocketJSONStream = require('@teamwork/websocket-json-stream')
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
	});

    return wss;
};

module.exports = installWebsocketManager;