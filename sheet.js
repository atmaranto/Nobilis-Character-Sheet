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
	
	let characteristics = {};
	let factory = new UI.EditorFactory(characteristics);
	
	factory.startSection("Nobilis Character", "h2");
	factory.attachText("characterName", "Character Name");
	factory.attachText("playerName", "Player Name");
	
	let attributeUpdate = () => {
		let _s = 0;
		
		$(".attribute").each((index, item) => {
			_s += parseInt($(item).val()) * 3;
		});
		
		let attributeSum = $("#attributeSum")
			.html("").text(_s.toString() + " character points");
		
		if(_s > 25) {
			attributeSum.append(
				$("<span></span>")
					.css("color", "red")
					.css("text-style", "italic")
					.text(" (above maximum of 25 points by " + (_s - 25).toString() + ", only possible with Limits)")
			);
		}
	};
	
	// TODO: Attach saving to all via function in EditorFactory
	factory.startSection("Attributes", "h2");
	factory.attachSlider("aspect", "Aspect (body and mind)", {min: 0, max: 5}, 0)
		.addClass("attribute").on("input change", attributeUpdate);
	factory.attachSlider("domain", "Domain (control over Estate)", {min: 0, max: 5}, 0)
		.addClass("attribute").on("input change", attributeUpdate);
	factory.attachSlider("realm", "Realm (power in Chancel)", {min: 0, max: 5}, 0)
		.addClass("attribute").on("input change", attributeUpdate);
	factory.attachSlider("spirit", "Spirit (rites and Auctoritas)", {min: 0, max: 5}, 0)
		.addClass("attribute").on("input change", attributeUpdate);
	factory.add().append($("<td><span id='attributeSum'>Loading...</span></td>").ready(attributeUpdate));
	
	factory.startSection("Domains", "h2");
	
	
	
	factory.startSection("Miracle Points", "h2");
	
	/* Note: Have lockable sliders for permanent miracle points and additional sliders for temporary miracle points */
	
	factory.startSection("Gifts", "h2");
	
	factory.startSection("Handicaps", "h2");
	
	factory.startSection("Bonds and Anchors", "h2");
	factory.attachTextArea("anchors");
	factory.attachTextArea("bondAllocation");
	
	factory.startSection("Wound Levels", "h2");
	
	factory.startSection("Chancel and Imperator Details", "h2");
	factory.attachTextArea("chancelInformation");
	factory.attachTextArea("imperatorInformation");
	
	/* Future Section Ideas
	
	Gift Cost Calculator tab (or window? probably a window.)
	
	*/
	
	sheet.append(factory.create());
	
	console.log("Loaded.");
});