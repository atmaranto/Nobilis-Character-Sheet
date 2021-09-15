const http = require("http");

console.log("USAGE: node new_sheet.js <host [default localhost]> <port [default 80]>");

let options = {
	"host": process.argv[2] || "localhost",
	"path": "/api/sheetData",
	"port": process.argv[3] || "80",
	"method": "POST"
};

console.log("Making POST request to " + options.host + options.path + " on port " + options.port);

http.request(options, (response) => {
	let data = '';
	
	response.on("data", (chunk) => {
		data += chunk;
	});
	
	response.on("end", () => {
		if(response.statusCode != 200) {
			console.error("Received HTTP Error " + response.statusCode.toString());
			console.error(data);
		}
		else {
			console.log("Received UUID for new sheet:");
			console.log(data);
		}
	});
}).end();