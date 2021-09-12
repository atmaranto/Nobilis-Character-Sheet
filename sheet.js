$(document).ready(() => {
	console.log("Loading...");
	
	function saveToCookies(el) {
		
	}
	
	let container = $("#container");
	let sheet = container.html("")
		.append(
			"<button id='openSettings' onclick='UI.createSettingsWindow().show()'>Open Settings</button>" +
			"<br />"
		)
		.append(
			"<div id='sheet'></div>"
		)
		.children().last();
	
	let factory = new UI.EditorFactory(this);
	
	factory.startSection("Nobilis Character");
	factory.attachText("characterName", "Character Name");
	factory.attachText("playerName",	"Player Name");
	
	sheet.append(factory.create());
	
	console.log("Loaded.");
});