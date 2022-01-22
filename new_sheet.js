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

const http = require("https");

console.log("USAGE: node new_sheet.js <host [default localhost]> <port [default 80]>");

let options = {
	"host": process.argv[2] || "localhost",
	"path": "/nobilis/api/sheetData",
	//"port": process.argv[3] || "80",
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