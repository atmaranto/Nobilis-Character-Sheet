/* 

MIT License

Copyright (c) 2021 Anthony Maranto

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

let STRIPPED_PATHNAME = window.location.pathname;
if(STRIPPED_PATHNAME.endsWith("/")) {
	STRIPPED_PATHNAME = STRIPPED_PATHNAME.substr(0, STRIPPED_PATHNAME.length - 1);
}

let createSheetList = (sheets, container, currentPage) => {
	let table = $("<table></table>").appendTo(container.html(""));
	
	table
		.html("<tr><th>Sheet Name</th><th>Owner</th><th>Last Modified</th></tr>")
		.css({"user-select": "none"});
	sheets.forEach((sheet) => {
		table.append($("<tr></tr>")
			.append($("<td></td>").text(sheet.name))
			.append($("<td></td>").text(sheet.owner))
			.append($("<td></td>").text(sheet.lastModified))
			.click(() => {
				window.location = "../?id=" + encodeURIComponent(sheet.uuid);
			})
			.css({
				"cursor": "pointer"
			})
		);
	});
	
	console.log(sheets);
};

let refreshSheet = (container, currentPage) => {
	$(".pageFeature").attr("disabled", true);
	let message = {
		page: currentPage.toString(),
		email: utils.zealousGet("email"),
		sessionKey: utils.zealousGet("sessionKey")
	};
	
	let sheetName = $("#sheetName").val().trim();
	if(sheetName.length > 0) {
		message.sheetName = sheetName;
	}
	
	let sheetOwner = $("#sheetOwner").val().trim();
	if(sheetOwner.length > 0) {
		message.sheetOwner = sheetOwner;
	}
	
	$.ajax({
		"url": "../api/account/listSheets",
		"data": message,
		"method": "POST"
	})
		.done((data, text, xhr) => {
			let sheets = typeof data === "string" ? JSON.parse(data) : data;
			console.log(data);
			createSheetList(sheets, container, currentPage);
		})
		.fail((xhr, text, err) => {
			let errorText = $("<p style='color: red; font-weight: bold;'></p>").text("Error while requesting sheets: " + xhr.statusText);
			errorText.appendTo(container);
			
			setTimeout(() => (errorText.fadeOut()), 5000);
		})
		.always(() => {
			$(".pageButton").removeAttr("disabled");
		});
};

let initializeManager = () => {
	let container = $("#container");
	let currentPage = 0;
	
	let loggedIn = utils.zealousGet("sessionKey");
	if(!loggedIn) {
		let recentSheets = JSON.parse((localStorage || sessionStorage).getItem("recentSheets") || "[]");
		
		createSheetList(
			recentSheets.map((sheet) => {
				return {
					name: "Recent sheet",
					owner: "Unknown",
					lastModified: "Unknown",
					uuid: sheet
				};
			}),
			container,
			currentPage
		);
	}
	else {
		refreshSheet(container, currentPage);
	}
	
	$("#prevPageButton").click(() => {
		currentPage = Math.max(0, currentPage - 1);
		refreshSheet(container, currentPage);
	});
	
	$("#nextPageButton").click(() => {
		currentPage++;
		refreshSheet(container, currentPage);
	});
	
	$(".searchFeature").on("change", () => (refreshSheet(container, currentPage)));
	
	let accountControls = $("#accountControls");
	if(loggedIn) {
		accountControls.append(
			$("<button>Log Out</button>").click(() => {
				let message = {
					"email": utils.zealousGet("email"),
					"sessionKey": utils.zealousGet("sessionKey")
				};
				
				$.ajax({
					"url": STRIPPED_PATHNAME + "/api/account/logout",
					"data": message,
					"method": "POST"
				})
					.done((data, text, xhr) => {
						window.location.reload();
					})
					.fail((xhr, text, err) => {
						let errorText = $("<p style='color: red; font-weight: bold;'></p>").text("Error while logging out: " + xhr.statusText);
						errorText.appendTo(container);
						
						setTimeout(() => (errorText.fadeOut()), 5000);
					})
					.always(() => {
						utils.zealousDelete("sessionKey");
						//$(".pageButton").removeAttr("disabled");
					});
			})
		);
	}
	else {
		accountControls
			.append($("<div><h3>Log In</h3><label for='email'>Email: </label><input type='text' id='email' /><br /><label for='password'>Password: </label><input type='password' id='password' /></div>"))
			.append(
				$("<button>Log In</button>").click(() => {
					let message = {
						"email": $("#email").val(),
						"password": $("#password").val()
					};
					
					$.ajax({
						"url": "../api/account",
						"data": message,
						"method": "POST"
					})
						.done((data, text, xhr) => {
							utils.zealousSet("email", message.email);
							utils.zealousSet("sessionKey", data);
							
							window.location.reload();
						})
						.fail((xhr, text, err) => {
							let errorText = $("<p style='color: red; font-weight: bold;'></p>").text("Error while logging in: " + xhr.statusText);
							errorText.appendTo(container);
							
							setTimeout(() => (errorText.fadeOut()), 5000);
						})
						.always(() => {
							//$(".pageButton").removeAttr("disabled");
						});
				})
			);
		
		$("#email").val(utils.zealousGet("email") || "");
		
		accountControls
			.append($("<div><h3>Create Account</h3><br /><label for='registerEmail'>Email: </label><input type='text' id='registerEmail' /><br /><label for='registerPassword'>Password: </label><input type='password' id='registerPassword' />" +
					  "<br /><label for='registerName'>Name</label><input type='text' id='registerName' /></div>"))
			.append(
				$("<button>Create Account</button>").click(() => {
					let message = {
						"email": $("#registerEmail").val(),
						"password": $("#registerPassword").val(),
						"name": $("#registerName").val()
					};
					
					$.ajax({
						"url": "../api/account",
						"data": message,
						"method": "PUT"
					})
						.done((data, text, xhr) => {
							utils.zealousSet("email", message.email);
							utils.zealousSet("sessionKey", data);
							
							window.location.reload();
						})
						.fail((xhr, text, err) => {
							let errorText = $("<p style='color: red; font-weight: bold;'></p>").text("Error while creating account: " + xhr.statusText);
							errorText.appendTo(container);
							
							setTimeout(() => (errorText.fadeOut()), 5000);
						})
						.always(() => {
							//$(".pageButton").removeAttr("disabled");
						});
				})
			);
		
		$("#email").val(utils.zealousGet("email") || "");
	}
};

$(document).ready(() => {
	initializeManager();
});