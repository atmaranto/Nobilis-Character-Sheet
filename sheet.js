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
		.children().last();
	
	let characteristics = window.characteristics = {
		aspect: 2,
		domain: 2,
		realm: 2,
		spirit: 1
	};
	let factory = new UI.EditorFactory(characteristics);
	
	factory.startSection("Nobilis Character", "h2");
	factory.attachText("characterName", "Character Name");
	factory.attachText("playerName", "Player Name");
	
	let attributeUpdate = () => {
		let _s = 0;
		
		$(".attribute").each((index, item) => {
			_s += parseInt($(item).val()) * 3;
		});
		$(".smallAttribute").each((index, item) => {
			_s += parseInt($(item).val()) * 1;
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
	
	factory.add().append($("<td><span id='attributeSum'>Loading...</span></td>").ready(attributeUpdate));
	
	// TODO: Attach saving to all via function in EditorFactory
	factory.startSection("Attributes", "h3");
	let aspectSlider = factory.attachSlider("aspect", "<b>Aspect</b> (body and mind)", {min: 0, max: 5}, 0)
		.addClass("attribute").on("input change", attributeUpdate);
	let domainSlider = factory.attachSlider("domain", "<b><i>Primary</i> Domain</b> (control over Estate)", {min: 0, max: 5}, 0)
		.addClass("attribute").on("input change", attributeUpdate);
	let realmSlider = factory.attachSlider("realm", "<b>Realm</b> (power in Chancel)", {min: 0, max: 5}, 0)
		.addClass("attribute").on("input change", attributeUpdate);
	let spiritSlider = factory.attachSlider("spirit", "<b>Spirit</b> (rites and Auctoritas)", {min: 0, max: 5}, 0)
		.addClass("attribute").on("input change", attributeUpdate);
	
	factory.startSection("Domains", "h3");
	
	factory.attachList((i) => {
		let thisDomain = {};
		
		let domainFactory = new UI.EditorFactory(thisDomain);
		let section;
		let slider;
		
		if(i == 0) {
			section = domainFactory.startSection("Primary Domain", "h4");
		}
		else {
			section = domainFactory.startSection("Secondary Domain", "h4");
		}
		
		let sliderSync = function() {
			if($(slider).parents(".editoritem").prev().length == 0) {
				$(slider).removeClass("smallAttribute")
					.val(characteristics.domain).trigger("input");
			}
			else {
				$(slider).addClass("smallAttribute");
			}
		};
		
		section
			.addClass("editorevents")
			.on("checkdisabled", () => {
				if($(section).parents(".editoritem").prev().length == 0) {
					// We're the first item in the list
					$(section).text("Primary Domain");
					$(slider).attr("disabled", true);
					sliderSync();
				}
				else {
					$(section).text("Secondary Domain");
					$(slider).removeAttr("disabled");
				}
			});
		
		domainFactory.attachText("domainDescription", "Domain description");
		
		let domainSliderHandler = () => {
			sliderSync();
		};
		
		domainSlider.on("input", domainSliderHandler);
		
		slider = domainFactory.attachSlider("domain", "Domain Value", {min: 0, max: 5}, 0)
			.addClass("smallAttribute editorevents")
			.on("input change", (evt) => {
				if($(slider).parents(".editoritem").prev().length == 0 && $(slider).val() != characteristics.domain) {
					sliderSync();
					
					return;
				}
				
				attributeUpdate();
			})
			.on("checkdisabled", function() {
				sliderSync();
			})
			.on("removed", () => {
				domainSlider.off(domainSliderHandler);
			});
		
		return domainFactory.create();
	}, {min: 1, max: 5});
	
	factory.startSection("Miracle Points", "h3");
	
	/* Note: Have lockable sliders for permanent miracle points and additional sliders for temporary miracle points */
	
	factory.startSection("Gifts", "h3");
	
	factory.startSection("Handicaps", "h3");
	
	factory.startSection("Bonds and Anchors", "h3");
	factory.attachTextArea("anchors");
	factory.attachTextArea("bondAllocation");
	
	factory.startSection("Wound Levels", "h3");
	
	factory.startSection("Chancel and Imperator Details", "h3");
	factory.attachTextArea("chancelInformation");
	factory.attachTextArea("imperatorInformation");
	
	/* Future Section Ideas
	
	Gift Cost Calculator tab (or window? probably a window.)
	
	*/
	
	sheet.append(factory.create());
	
	console.log("Loaded.");
});