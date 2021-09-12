$(document).ready(() => {
	console.log("Loading...");
	
	let container = $("#container");
	let sheet = container.html("")
		.append(
			"<button id='openSettings' onclick='UI.createSettingsWindow().show()'>Open Settings</button>" +
			"<br />"
		)
		.append(
			"<div id='sheet'></div>"
		)
		.children()
		.last()
		.append(
			utils.createSmartTextInput("characterName", "")
		);
	
	console.log("Loaded.");
});