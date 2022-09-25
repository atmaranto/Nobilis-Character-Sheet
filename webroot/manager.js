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

let STRIPPED_PATHNAME = window.location.pathname;
if(STRIPPED_PATHNAME.endsWith("/")) {
	STRIPPED_PATHNAME = STRIPPED_PATHNAME.substr(0, STRIPPED_PATHNAME.length - 1);
}

let showError = (text, color) => {
	let errorText = $("<p style='color: " + (color || "red") + "; font-weight: bold;'></p>").text(text);
	errorText.appendTo($("#container"));
	
	setTimeout(() => (errorText.fadeOut()), 5000);
};

let openSheet = (uuid) => {
	window.open("./?id=" + encodeURIComponent(uuid));
};

let deleteSheet = (uuid, after) => {
	$.ajax({
		"url": "./api/sheetData",
		"data": {"id": uuid},
		"method": "DELETE"
	})
		.done((data, text, xhr) => {
			if(after) {
				after(true);
			}
		})
		.fail((xhr, text, err) => {
			showError("Error while deleting sheet: " + xhr.responseText);
		})
		.always(() => {
			
		});
};

let duplicateSheet = (uuid, after) => {
	$.ajax({
		"url": "./api/duplicateSheet",
		"data": {"id": uuid},
		"method": "POST"
	})
		.done((data, text, xhr) => {
			if(after) {
				after(true);
			}
		})
		.fail((xhr, text, err) => {
			showError("Error while duplicating sheet: " + xhr.responseText);
		})
		.always(() => {
			
		});
};

let updateSheet = (uuid, after) => {
	$.ajax({
		"url": "./api/updateSheetVersion",
		"data": {"id": uuid},
		"method": "POST"
	})
		.done((data, text, xhr) => {
			if(after) {
				after(true);
			}
		})
		.fail((xhr, text, err) => {
			showError("Error while updating sheet: " + xhr.responseText);
		})
		.always(() => {
			
		});
};

let createSheetList = (sheets, container, currentPage) => {
	let table = $("<table></table>").appendTo(container.html(""));
	
	table
		.html("<tr><th>Sheet Name</th><th>Owner</th><th>Last Modified</th></tr>")
		.css({"user-select": "none"});
	sheets.forEach((sheet) => {
		let rowEntry = $("<tr></tr>")
			.append($("<td></td>").text(sheet.name || sheet.sheetName))
			.append($("<td></td>").text(sheet.ownerName || sheet.owner))
			.append($("<td></td>").text(sheet.lastModified))
			.click((e) => {
				openSheet(sheet.uuid);
			})
			.contextmenu((e) => {
				e.preventDefault();
				
				$("#cmenu").remove(); // Remove any remaining context menus
				
				let menu = $("<div id='cmenu' class='context-menu'></div>")
					.append(
						$("<ul></ul>")
							.append(
								$("<li><a href='#'>Open Sheet</a></li>").click(
									() => {
										openSheet(sheet.uuid);
									}
								)
							)
							.append(
								$("<li><a href='#'>Duplicate Sheet</a></li>").click(
									() => {
										duplicateSheet(sheet.uuid, () => refreshSheet(container, currentPage));
									}
								)
							)
							/* .append(
								$("<li><a href='#'>Update Sheet Version</a></li>").click(
									() => {
										updateSheet(sheet.uuid, () => refreshSheet(container, currentPage));
									}
								)
							) */
							.append(
								$("<li><a href='#' class='context-menu-delete'>Delete Sheet</a></li>").click(
									() => {
										if(window.confirm("Really delete this sheet?")) {
											deleteSheet(sheet.uuid, () => rowEntry.remove());
										}
									}
								)
							)
					);
				
				menu.appendTo($("#container")).css({
					left: e.pageX + "px",
					top: e.pageY + "px"
				});
				
				$(document).on("click", () => menu.remove());
			})
			.css({
				"cursor": "pointer"
			});
		table.append(rowEntry);
	});
	
	// console.log(sheets);
};

let _REQUESTING_REFRESH = false;
let _RFID = 0;

let refreshSheet = (container, currentPage) => {
	let _this_rfid = ++_RFID;
	if(_REQUESTING_REFRESH) {
		setTimeout(() => {
			if(_REQUESTING_REFRESH == false && _RFID <= _this_rfid) {
				refreshSheet(container, currentPage);
			}
		}, 800);
	}
	_REQUESTING_REFRESH = true;
	
	$(".pageFeature").attr("disabled", true);
	let message = {
		page: currentPage.toString(),
		email: utils.zealousGet("email"),
		sessionKey: utils.zealousGet("sessionKey")
	};
	
	let searchName = $("#sheetName").val().trim();
	if(searchName.length > 0) {
		message.searchName = searchName;
	}
	
	let searchOwner = $("#sheetOwner").val().trim();
	if(searchOwner.length > 0) {
		message.searchOwner = searchOwner;
	}
	
	let loggedIn = utils.zealousGet("sessionKey");
	
	if(loggedIn) {
		$.ajax({
			"url": "./api/listSheets",
			"data": message,
			"method": "POST"
		})
			.done((data, text, xhr) => {
				let sheets = typeof data === "string" ? JSON.parse(data) : data;
				console.log(data);
				
				sheets.forEach((sheet) => {
					// Convert lastModified dates into the local timezone
					sheet.lastModified = new Date(sheet.lastModified).toString();
				});
				createSheetList(sheets, container, currentPage);
			})
			.fail((xhr, text, err) => {
				console.log(xhr);
				if(xhr.status === 401) {
					utils.zealousDelete("sessionKey");
					sessionStorage.setItem("justLoggedOut", true);
					window.location.reload();
					return;
				}
				
				showError("Error while requesting sheets: " + xhr.responseText);
			})
			.always(() => {
				$(".pageButton").removeAttr("disabled");
				_REQUESTING_REFRESH = false;
			});
	} else {
		let recentSheets = getRecentSheets();
		let filteredRecentSheets = recentSheets.filter((sheet) => {
			if(searchName.length > 0 && sheet.name && sheet.name.toLowerCase().indexOf(searchName.toLowerCase()) === -1) {
				return false;
			}
			
			if(searchOwner.length > 0 && sheet.owner && sheet.owner.toLowerCase().indexOf(searchOwner.toLowerCase()) === -1) {
				return false;
			}
			
			return true;
		});

		createSheetList(filteredRecentSheets, container, currentPage);
	}
};

let getRecentSheets = () => {
	let recentSheets = JSON.parse((localStorage || sessionStorage).getItem("recentSheets") || "[]");
	
	return recentSheets.map((sheet) => {
		let owner;
		if(sheet.owner === undefined) {
			owner = "Unclaimed";
		}
		else {
			owner = sheet.ownerName || "Unknown";
		}
		
		return {
			name: sheet.name || "Recent sheet",
			owner: owner,
			lastModified: sheet.lastModified || "Unknown",
			uuid: sheet.id
		};
	});
};

let initializeManager = () => {
	let container = $("#container");
	let currentPage = 0;
	
	if(sessionStorage.getItem("justLoggedOut")) {
		sessionStorage.removeItem("justLoggedOut");
		showError("Warning: Your session expired, so you were logged out", "yellow");
	}
	
	let loggedIn = utils.zealousGet("sessionKey");
	if(!loggedIn) {
		let recentSheets = getRecentSheets();
		
		createSheetList(
			recentSheets,
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

	$("#clearRecentButton").click(() => {
		currentPage = 0;
		(localStorage || sessionStorage).setItem("recentSheets", "[]");
		refreshSheet(container, currentPage);
	});
	
	$(".searchFeature").on("input", () => (refreshSheet(container, currentPage)));
	
	let accountControls = $("#accountControls");
	if(loggedIn) {
		accountControls.append(
			$("<button>Log Out</button>").click(() => {
				let message = {
					"email": utils.zealousGet("email"),
					"sessionKey": utils.zealousGet("sessionKey")
				};
				
				$.ajax({
					"url": "./api/account/logout",
					"data": message,
					"method": "POST"
				})
					.done((data, text, xhr) => {
						window.location.reload();
					})
					.fail((xhr, text, err) => {
						showError("Error while logging out: " + xhr.responseText);
					})
					.always(() => {
						utils.zealousDelete("sessionKey");
						//$(".pageButton").removeAttr("disabled");
					});
			})
		);
		
		$("#sheetCreation").append(
			$("<button>Create New Sheet</button>")
				.click(() => {
					$.ajax({
						"url": "./api/sheetData",
						"method": "POST"
					})
						.done((data, text, xhr) => {
							openSheet(data);
							refreshSheet(container, currentPage);
						})
						.fail((xhr, text, err) => {
							showError("Error while creating sheet: " + xhr.responseText);
						})
						.always(() => {
							//$(".pageButton").removeAttr("disabled");
						});
				})
		);
	}
	else {
		accountControls
			.append($("<div><h3>Log In</h3><label for='email'>Email: </label><input type='text' id='email' /><br /><label for='password'>Password: </label><input type='password' id='password' /></div>"))
			.append(
				$("<button id='loginbutton'>Log In</button>").click(() => {
					let message = {
						"email": $("#email").val(),
						"password": $("#password").val()
					};
					
					$.ajax({
						"url": "./api/account",
						"data": message,
						"method": "POST"
					})
						.done((data, text, xhr) => {
							utils.zealousSet("email", message.email);
							utils.zealousSet("sessionKey", data);
							
							window.location.reload();
						})
						.fail((xhr, text, err) => {
							showError("Error while logging in: " + xhr.responseText);
						})
						.always(() => {
							//$(".pageButton").removeAttr("disabled");
						});
				})
			)
			.find("#email,#password").keydown((evt) => {
				if(evt.keyCode === 13) {
					$("#loginbutton").click();
				}
			});
		
		$("#email").val(utils.zealousGet("email") || "");
		
		accountControls
			.append($("<div><h3>Create Account</h3><br /><label for='registerEmail'>Email: </label><input type='text' id='registerEmail' /><br /><label for='registerPassword'>Password: </label><input type='password' id='registerPassword' />" +
					  "<br /><label for='registerName'>Name</label><input type='text' id='registerName' /></div>"))
			.append(
				$("<button id='registerbutton'>Create Account</button>").click(() => {
					let message = {
						"email": $("#registerEmail").val(),
						"password": $("#registerPassword").val(),
						"name": $("#registerName").val()
					};
					
					$.ajax({
						"url": "./api/account",
						"data": message,
						"method": "PUT"
					})
						.done((data, text, xhr) => {
							utils.zealousSet("email", message.email);
							utils.zealousSet("sessionKey", data);
							
							window.location.reload();
						})
						.fail((xhr, text, err) => {
							showError("Error while creating account: " + xhr.responseText);
						})
						.always(() => {
							//$(".pageButton").removeAttr("disabled");
						});
				})
			).find("#registerEmail,#registerPassword").keydown((evt) => {
				if(evt.keyCode === 13) {
					$("#registerbutton").click();
				}
			});;
		
		$("#email").val(utils.zealousGet("email") || "");
	}
};

$(document).ready(() => {
	initializeManager();
});