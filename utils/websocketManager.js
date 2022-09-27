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