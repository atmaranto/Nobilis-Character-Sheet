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
		$(".attributePermanentPoint").each((index, item) => {
			_s += parseInt($(item).val()) - 5;
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
	
	factory.add().append($("<td><span id='attributeSum' class='secretnoselect'>Loading...</span></td>").ready(attributeUpdate));
	
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
	
	let createAttributeMiracleTable = (attribute, slider, onComplete) => {
		/* 
			Creates a miracle cost table that updates live depending on the results of a slider.
		*/
		let miracleData = window.nobilisData[attribute + "Miracles"];
		let MPName = attribute.charAt(0).toUpperCase() + "MP";
		
		let updateTable = () => {
			let table = $("<table class='miracletable secretnoselect'></table>");
			
			$("<tr><th>Level</th><th>Miracle Name</th><th>Difficulty for You</th><th>" + MPName + " Cost for You</th></tr>").appendTo(table);
			let currentDomainLevel = parseInt(slider.prop("value"));
			
			miracleData.data.forEach((miracle) => {
				let infoElement = $("<p></p>").html(miracle.text);
				
				if(miracle.examples) {
					infoElement.append(
						$("<div>Examples:<br /></div>").append(
							$("<ul class='exampleslist'></ul>").append(
								miracle.examples.map((text) => $("<li class='miracleExample'>" + text + "</li>"))
							)
						)
					);
				}
				
				let infoWindow = new UI.ElementWindow(infoElement, miracle.label);
				
				let row = $("<tr></tr>");
				
				if(miracle.level >= 0) {
					row.append($("<td><span class='miracleLevel'>" + miracle.level.toString() + "</span></td>"));
				}
				else {
					row.append($("<td></td>"));
				}
				
				row.append(
					$("<td></td>")
						.append(
							$("<span class='miracleName' title='Click for info'>" + miracle.label + "</span>")
								.click(() => {
									infoWindow.show();
								})
						)
				);
				
				if(miracle.level >= 0) {
					let miracleType = undefined;
					Object.keys(miracleData.attributeMargins).forEach((type) => {
						if(miracle.level <= currentDomainLevel + miracleData.attributeMargins[type]) {
							if(miracleType === undefined || (miracleData.attributeMargins[type] < miracleData.attributeMargins[miracleType])) {
								miracleType = type;
							}
						}
					});
					
					if(miracleType !== undefined) {
						miracleType = nobilisData.miracleDifficulties[miracleType];
						
						row.append(
							UI.addHoverInfo(
								$("<td><span class='miracleType'>" + miracleType.name + "</span></td>"),
								miracleType.description.replace("(C)", miracleType.cost.toString()).replace("(A)", attribute.charAt(0).toUpperCase())
							)
						);
						row.append(
							$("<td><span class='miracleCost'>" + miracleType.cost.toString() + " " + MPName + "</span></td>")
								.attr("title", miracleType.cost.toString() + " " + utils.capitalize(attribute) + " Miracle Points")
						);
					}
					else {
						row.append($("<td>You <span class='uhoh'>cannot perform this miracle type</span></td>"));
						row.append($("<td></td>"));
					}
				}
				else {
					row.append($("<td></td>"));
					row.append($("<td></td>"));
				}
				
				table.append(row);
			});
			
			if(typeof onComplete === "function") {
				onComplete(table);
			}
			else {
				$(onComplete).html("").append(table);
			}
		};
		
		return updateTable;
	};
	
	let createDomainSection = (i) => {
		let thisObject = {};
		
		let attributeFactory = new UI.EditorFactory(thisObject);
		let section;
		let slider;
		let secondaryDomain = false;
		
		if(i == 0) {
			section = attributeFactory.startSection("Primary Domain", "h4");
		}
		else {
			section = attributeFactory.startSection("Secondary Domain", "h4");
			secondaryDomain = true;
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
		
		attributeFactory.attachText("domainDescription", "Domain description");
		
		let domainSliderHandler = () => {
			sliderSync();
		};
		
		let checkWarnPrimary = () => {
			if(secondaryDomain && parseInt(slider.val()) > parseInt(domainSlider.val())) {
				let errorElement = $("<span class='uhoh'>Warning: You can't have a secondary domain with more points than your primary domain!</span>");
				let changeHandler = () => {
					if(parseInt(slider.val()) <= parseInt(domainSlider.val()) || !document.contains(errorElement[0])) {
						errorElement.remove();
						$(domainSlider).off("input", changeHandler);
					}
				};
				
				$(infoTable).append(errorElement);
				$(domainSlider).on("input", changeHandler);
			}
		};
		
		domainSlider.on("input", domainSliderHandler);
		domainSlider.on("input", checkWarnPrimary);
		
		slider = attributeFactory.attachSlider("domain", "Domain Value", {min: 0, max: 5}, 0)
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
				domainSlider.off("input", domainSliderHandler);
				domainSlider.off("input", checkWarnPrimary);
			});
		
		let infoTable = $("<div></div>");
		
		let updateTable = createAttributeMiracleTable("domain", slider, (table) => {
			$(infoTable).html("").append(table);
			
			checkWarnPrimary();
		});
		
		attributeFactory.attachStandalone(infoTable);
		
		slider.on("input change", updateTable);
		
		updateTable();
		
		return {"element": attributeFactory.create().addClass("domaintable"), "object": thisObject};
	};
	
	factory.attachList("domains", createDomainSection, {min: 1, max: 5});
	
	factory.startSection("Miracle Points", "h3");
	
	factory.startSection("Permanent Miracle Points", "h4");
	
	let lockUnlockButton = $("<div id='lockunlockbutton' title='Lock or Unlock Permanent Miracle Points' class='unlockbutton lockunlockbutton'></div>");
	
	factory.add($("<label for='lockunlockbutton' class='noselect'>Lock/Unlock Permanent Miracle Points:  </label>"))
		.append($("<td></td>").append(lockUnlockButton));
	
	let permanentAMPSlider = factory.attachSlider("permanentAMP", "<b>Aspect</b> Permanent Miracle Points", {min: 5, max: 20}, 5)
		.addClass("attributePermanentPoint").on("input change", attributeUpdate).attr("disabled", true);
	let permanentDMPSlider = factory.attachSlider("permanentDPP", "<b>Domain</b> Permanent Miracle Points", {min: 5, max: 20}, 5)
		.addClass("attributePermanentPoint").on("input change", attributeUpdate).attr("disabled", true);
	let permanentRMPSlider = factory.attachSlider("permanentRMP", "<b>Realm</b> Permanent Miracle Points", {min: 5, max: 20}, 5)
		.addClass("attributePermanentPoint").on("input change", attributeUpdate).attr("disabled", true);
	let permanentSMPSlider = factory.attachSlider("permanentSMP", "<b>Spirit</b> Permanent Miracle Points", {min: 5, max: 20}, 5)
		.addClass("attributePermanentPoint").on("input change", attributeUpdate).attr("disabled", true);
	
	let lockUnlockHandler = () => {
		if($(".lockunlockbutton").hasClass("unlockbutton")) {
			$(".attributePermanentPoint").removeAttr("disabled");
			$(".lockunlockbutton").removeClass("unlockbutton").addClass("lockbutton");
		}
		else {
			$(".attributePermanentPoint").attr("disabled", true);
			$(".lockunlockbutton").removeClass("lockbutton").addClass("unlockbutton");
		}
	};
	
	lockUnlockButton.click(lockUnlockHandler);
	
	factory.startSection("Temporary Miracle Points", "h4");
	
	let maxTemporaryMPs = 25;
	
	let temporaryAMPSlider = factory.attachSlider("temporaryAMP", "<b>Aspect</b> Miracle Points", {min: 0, max: maxTemporaryMPs}, 5)
		.addClass("attributeTemporaryPoint").on("input change", attributeUpdate)
	let temporaryDMPSlider = factory.attachSlider("temporaryDPP", "<b>Domain</b> Miracle Points", {min: 0, max: maxTemporaryMPs}, 5)
		.addClass("attributeTemporaryPoint").on("input change", attributeUpdate);
	let temporaryRMPSlider = factory.attachSlider("temporaryRMP", "<b>Realm</b> Miracle Points", {min: 0, max: maxTemporaryMPs}, 5)
		.addClass("attributeTemporaryPoint").on("input change", attributeUpdate);
	let temporarySMPSlider = factory.attachSlider("temporarySMP", "<b>Spirit</b> Miracle Points", {min: 0, max: maxTemporaryMPs}, 5)
		.addClass("attributeTemporaryPoint").on("input change", attributeUpdate);
	
	let syncTempPerm = (permanentSlider, temporarySlider) => {
		$(temporarySlider).prop("max", $(permanentSlider).val());
		$(temporarySlider).val(Math.min(parseInt($(temporarySlider).val()), parseInt($(permanentSlider).val())).toString());
		$(temporarySlider).trigger("input");
	};
	
	let tempPermSyncs = [
		{"temp": temporaryAMPSlider, "perm": permanentAMPSlider},
		{"temp": temporaryDMPSlider, "perm": permanentDMPSlider},
		{"temp": temporaryRMPSlider, "perm": permanentRMPSlider},
		{"temp": temporarySMPSlider, "perm": permanentSMPSlider}
	];
	
	let installTempPermSync = (enableSliderSync) => {
		if(enableSliderSync) {
			tempPermSyncs.forEach((obj) => {
				obj._func = () => (syncTempPerm(obj.perm, obj.temp));
				obj._func();
				
				obj.perm.on("input", obj._func);
			});
		}
		else {
			tempPermSyncs.forEach((obj) => {
				obj.perm.off("input", obj._func);
				obj._func = undefined;
				obj.temp.prop("max", maxTemporaryMPs);
			});
		}
	};
	
	factory.attachStandalone(
		UI.addHoverInfo(
			$("<div></div>")
				.append($("<label for='tempPermSync' style='cursor: help' class='noselect'>Enable synchronization with Permanent Miracle Points: </label>"))
				.append(
					$("<input id='tempPermSync' type='checkbox' />")
						.click(() => {
							installTempPermSync($("#tempPermSync").prop("checked"));
						})
				),
				$("<p class='noselect'>This option makes sure the maximum temporary MPs you have is no greater than your permanent MPs.<br />" +
				  "Disabling this option may be helpful, as there are ways of acquiring additional temporary MPs during play.</p>")
		)
	);
	
	factory.startSection("Gifts", "h3");
	
	let createGiftSection = (i) => {
		let gift = {};
		let giftFactory = new UI.EditorFactory(gift);
		
		giftFactory.attachText("giftName", "Name");
		
		return {"element": giftFactory.createHorizontal().css("padding-left", "30px"), "object": gift};
	};
	
	factory.attachList("gifts", createGiftSection, {min: 0, max: 5});
	
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