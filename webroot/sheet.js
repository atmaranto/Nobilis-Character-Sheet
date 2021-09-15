let initializeSheet = (window, sheetID) => {
	console.log("Loading...");
	
	let container = $("#container");
	let sheet = container.html("")
		.append(
			"<button id='openSettings' onclick='UI.createSettingsWindow().show()'>Open Settings</button>" +
			"<button id='saveSheet' onclick='window.saveSheet()'>Save Sheet</button>" +
			"<p id='saveStatus'></p>" +
			"<br />"
		)
		.append(
			"<div id='sheet'></div>"
		)
		.children().last();
	
	let characteristics = window.characteristics;
	
	window.saveSheet = () => {
		$("#saveSheet").attr("disabled", true);
		
		$.ajax({
			"url": "/api/sheetData?id=" + encodeURIComponent(sheetID),
			"data": JSON.stringify(characteristics),
			"method": "PUT",
			//"dataType": "text"
			"headers": {
				"Content-Type": "text/plain"
			}
		})
			.done((data, text, xhr) => {
				$("#saveStatus").text("Successfully saved sheet.");
				
				setTimeout(() => ($("#saveStatus").text("")), 5000);
			})
			.fail((xhr, text, err) => {
				console.error(err);
				$("#saveStatus").text("Error saving sheet: " + text);
			})
			.always(() => {
				$("#saveSheet").removeAttr("disabled");
			});
	};
	
	let factory = new UI.EditorFactory(characteristics);
	
	factory.startSection("Nobilis Character", "h2");
	factory.attachText("characterName", "Character Name");
	factory.attachText("playerName", "Player Name");
	
	let attributeUpdate = () => {
		let _s = 0;
		let max = 25;
		
		$(".attribute").each((index, item) => {
			_s += parseInt($(item).val()) * 3;
		});
		$(".smallAttribute").each((index, item) => {
			_s += parseInt($(item).val()) * 1;
		});
		$(".attributePermanentPoint").each((index, item) => {
			_s += parseInt($(item).val()) - 5;
		});
		$(".giftcost").each((index, item) => {
			let result = parseInt($(item).text());
			if(result !== NaN) {
				_s += result;
			}
		});
		$(".limitCPs").each((index, item) => {
			max += parseInt($(item).val());
		});
		
		let attributeSum = $("#attributeSum")
			.html("").text(_s.toString() + " character points");
		
		if(_s > max) {
			attributeSum.append(
				$("<span></span>")
					.css("color", "red")
					.css("text-style", "italic")
					.text(" (above maximum of " + max.toString() + " points by " + (_s - max).toString() + ", only possible by adding more Limits)")
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
				.append($("<label for='tempPermSync' class='noselect'>Enable synchronization with Permanent Miracle Points: </label>"))
				.append(
					$("<input id='tempPermSync' type='checkbox' />")
						.click(() => {
							installTempPermSync($("#tempPermSync").prop("checked"));
						})
				),
				$("<p>This option makes sure the maximum temporary MPs you have is no greater than your permanent MPs.<br />" +
				  "Disabling this option may be helpful, as there are ways of acquiring additional temporary MPs during play.</p>")
		)
	);
	
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
						row.append($("<td><span class='uhoh'>You cannot perform this miracle type</span></td>"));
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
	
	let estatePropertiesInfoWindow = new UI.ElementWindow(
		$("<p>Your Estate (the concept you rule over) should be relatively well-defined. You have <b>seven \"points\"</b> with which to define your estate. Create" +
		  " three to seven statements about your Estate and allocate those points amongst them. You may do this for your primary Domain and incorporate" +
		  " your secondary or tertiary Domains, <b>or</b> you may do this on a per-domain basis. Please note that there could be <i>many, many ways</i> to describe" +
		  " the same Estate. Define it how you see it; subsequent Powers may define it differently, but that's okay; you aren't them.<br />Technically, this" +
		  " is from Nobilis 3e, but we're going with it.<br />Some examples follow:</p>")
			.append(
				$("<ul></ul>").append(
					nobilisData.estatePropertiesExamples.map((item) => (
						$("<li class='estatePropertyExample'><span>" + item.estate + "</span><i> (7 points)</i></li>")
							.append(
								$("<ul></ul>").append(item.bonds.map((example) => ($("<li></li>").html(example))))
							)
					))
				),
			),
		"Estate Properties Info"
	);
	
	let createDomainSection = (i, thisObject) => {
		thisObject = thisObject || {};
		
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
		attributeFactory.attachTextArea(
			"estateProperties", 
			$("<p class='lookslikelink'>Estate Properties (click for info)</p>")
				.click(() => (estatePropertiesInfoWindow.show()))
		);
		
		slider.on("input change", updateTable);
		
		updateTable();
		
		return {"element": attributeFactory.create().addClass("domaintable"), "object": thisObject};
	};
	
	factory.attachList("domains", createDomainSection, {min: 1, max: 5});
	
	factory.startSection("Wound Levels and Aspect Miracles", "h3");
	
	// factory.attachParagraph("You have the following wound levels:");
	let woundLevelTable = $("<table class='woundleveltable'></table>");
	
	let surfaceWoundExplanation = $("<p>Surface wound levels are the lowest level of wound, and the last one lost. It doesn't take much to damage a character with only" +
									" these left: unless they have a gift that protects them, even a knife or a claw could cause a surface wound.</p>").css("font-weight", "normal");
	let seriousWoundExplanation = $("<p>Serious wound levels are the second wound level to be lost. You'd need a gun or the equivalent of a large claw to seriously injure" +
									" a player enough to give them a serious wound.</p>").css("font-weight", "normal");
	let deadlyWoundExplanation = $("<p>Deadly wound levels are the highest level of wound and the first to be lost. This means that, until you've taken at least one \"deadly\"" +
								   " blow, you <b>cannot</b> be damaged by anything less serious. That is, until you lose your deadly wound levels, you can't lose any other wound" +
								   " levels, so your threshold for damage is \"deadly\".</p>").css("font-weight", "normal");
	
	// Note: The UI.addHoverInfo doesn't seem to work with the headers, for some reason.
	let woundLevelHeader = $("<tr><th></th></tr>")
		.append(
			UI.addHoverInfo(
				$("<th>Surface Wound Levels</th>"),
				surfaceWoundExplanation
			)
		).append(
			UI.addHoverInfo(
				$("<th>Serious Wound Levels</th>"),
				seriousWoundExplanation
			)
		).append(
			UI.addHoverInfo(
				$("<th>Deadly Wound Levels</th>"),
				deadlyWoundExplanation
			)
		)
		.appendTo(woundLevelTable);
	let woundLevelRow = $("<tr><th>Maximum</th><td></td><td></td><td></td></tr>").appendTo(woundLevelTable);
	//let remainingWoundsRow = $("<tr><th>Current</th><td></td><td></td><td></td></tr>").appendTo(woundLevelTable);
	
	factory.attachStandalone(
		$("<p>Wound levels are calculated by dividing (Aspect + 4) amongst Surface, Serious, and Deadly levels,<br />" +
		  "prioritizing less major wounds when allocating extra points. The system should automatically use<br />" +
		  "your Aspect to calculate your wound levels for you.</p>").css("font-style", "italic"));
	
	let surfaceWoundSlider = factory.attachSlider("surfaceWounds", "Surface Wounds Remaining", {min: 0, max: 5}, 0)
			.addClass("surfaceWounds wounds");
	UI.addHoverInfo(surfaceWoundSlider.parent(), surfaceWoundExplanation);
	let seriousWoundSlider = factory.attachSlider("seriousWounds", "Serious Wounds Remaining", {min: 0, max: 5}, 0)
			.addClass("seriousWounds wounds");
	UI.addHoverInfo(seriousWoundSlider.parent(), seriousWoundExplanation);
	let deadlyWoundSlider = factory.attachSlider("deadlyWounds", "Deadly Wounds Remaining", {min: 0, max: 5}, 0)
			.addClass("deadlyWounds wounds");
	UI.addHoverInfo(deadlyWoundSlider.parent(), deadlyWoundExplanation);
	
	let recalculateWoundLevels = () => {
		let woundValue = parseInt(aspectSlider.val()) + 4;
		
		let deadlyLevels = 0;
		let seriousLevels = 0;
		let surfaceLevels = 0;
		
		while(true) {
			surfaceLevels++;
			woundValue--;
			
			if(woundValue <= 0) break;
			
			seriousLevels++;
			woundValue--;
			
			if(woundValue <= 0) break;
			
			deadlyLevels++;
			woundValue--;
			
			if(woundValue <= 0) break;
		}
		
		woundLevelRow.children().first().next()
			.text(surfaceLevels.toString()).next()
			.text(seriousLevels.toString()).next()
			.text(deadlyLevels.toString());
		
		surfaceWoundSlider.prop("max", surfaceLevels.toString());
		seriousWoundSlider.prop("max", seriousLevels.toString());
		deadlyWoundSlider.prop("max", deadlyLevels.toString());
		
		surfaceWoundSlider.val(Math.min(parseInt(surfaceWoundSlider.val()), surfaceLevels)).trigger("input");
		seriousWoundSlider.val(Math.min(parseInt(seriousWoundSlider.val()), seriousLevels)).trigger("input");
		deadlyWoundSlider.val(Math.min(parseInt(deadlyWoundSlider.val()), deadlyLevels)).trigger("input");
	};
	
	factory.attachStandalone(woundLevelTable);
	
	aspectSlider.on("input", recalculateWoundLevels);
	recalculateWoundLevels();
	
	factory.attachParagraph("Aspect miracle table:");
	
	let aspectMiracleTable = $("<table></table>");
	let updateAspectTable = createAttributeMiracleTable("aspect", aspectSlider, aspectMiracleTable);
	factory.attachStandalone(aspectMiracleTable);
	
	aspectSlider.on("input change", updateAspectTable);
	
	updateAspectTable();
	
	factory.startSection("Realm Miracles", "h3");
	
	factory.attachParagraph("Realm miracle table:");
	
	let realmMiracleTable = $("<table></table>");
	let updateRealmTable = createAttributeMiracleTable("realm", realmSlider, realmMiracleTable);
	factory.attachStandalone(realmMiracleTable);
	
	realmSlider.on("input change", updateRealmTable);
	
	updateRealmTable();
	
	factory.startSection("Gifts", "h3");
	let giftMiracleExampleWindow = new UI.ElementWindow(
		$("<p>Gift miracles could include:</p>")
			.append(
				$("<ul></ul>")
					.append(
						nobilisData.giftMiracleExamples.map((example) => ($("<li></li>").html(example)))
					)
			),
		"Gift Miracle Examples"
	);
	
	let createGiftSection = (i, gift) => {
		gift = gift || {};
		let giftFactory = new UI.EditorFactory(gift);
		
		giftFactory.attachText("giftName", "Gift Name");
		let miracleLevel = $(giftFactory.attachSlider("miracleLevel", "Miracle Level", {min: 0, max: 9}, 0));
		miracleLevel.parent().prev().find("label").css("cursor", "pointer").click(() => {
			giftMiracleExampleWindow.show();
		}).attr("title", "Click for examples").addClass("giftmiraclelabel");
		
		 UI.addHoverInfo(
			miracleLevel.parent(),
			$("<p>This is the cost of the miracle your gift requires. Click the label for some examples.</p>")
		);
		
		let giftEstate = UI.addHoverInfo(
			giftFactory.attachText("giftEstate", "Gift Estates"),
			$("<p>List whatever Estate or Estates this gift directly affects. Alternatively, if this is a Gift of Realm, Aspect, or Spirit, you may" +
			  " enter one of those values.</p>")
		);
		
		const giftModifiers = [1, -1, -2, -3];
		let giftInvocationType = giftFactory.attachSelection("giftInvocationType", "How does the Gift Activate", [
			"Automatically/Passively (+1)",
			"Simple Miracle (-1)",
			"Normal Miracle (-2)",
			"Hard Miracle (-3)"
		]);
		UI.addHoverInfo(
			giftInvocationType.parent(),
			$("<p>How the gift is activated. If it activates automatically or provides a passive benefit, it costs +1 point. If it requires a<br />" +
			  " miracle to activate, it costs less depending on that miracle's difficulty for you.</p>")
		);
		
		let giftAOEType = giftFactory.attachSelection("giftAOEType", "Area of Effect", [
			"Almost anywhere (+1)",
			"Local things only (-1)",
			"One person - you or a nearby moratal (-2)",
			"Only oneself (-3)"
		]);
		UI.addHoverInfo(
			giftAOEType.parent(),
			$("<p>What the gift can \"target\" when it affects something. Note that gifts that can affect almost anything hundreds of miles away<br />" +
			  "may cost additional points beyond those described here.</p>")
		);
		
		let giftFlexibility = giftFactory.attachSelection("giftFlexibility", "Gift Flexibility", [
			"All imaginable uses (+1)",
			"A wide variety of situations (-1)",
			"A limited selection of applications (-2)",
			"One single \"trick\" (-3)"
		]);
		UI.addHoverInfo(
			giftFlexibility.parent(),
			$("<p>This defines how flexible the gift is. This is a very subjective category, but in general, the more widely usable the gift can<br />" +
			  "be and the more directly the character can dictate what they want out of it, the more costly the flexibility of the gift.</p>")
		);
		
		let giftRarity = giftFactory.attachCheckbox("isGiftRare", "Is Gift Rare", false);
		UI.addHoverInfo(
			giftRarity.parent(),
			$("<p>Rare gifts cost an extra 1 character point. Imagination has its price.</p>")
		);
		
		let giftEstateType = giftFactory.attachSelection("giftEstateType", "Number of Distinct Estates Affected", [
				"One Estate (Cost x1)",
				"Family of Estates (Cost x2)",
				"Almost Anything and Everything (Cost x3)"
			]);
		UI.addHoverInfo(
			giftEstateType.parent(),
			$("<p>The number of distinct Estates affected by a gift is a multiplier to its cost. If the miracle <i>directly</i> affects<br />" +
			  " a family of distinct domains (such as \"any living thing\" or \"any physical thing\") then its cost is multiplied by 2. If<br />" +
			  " it could directly affect almost anything <i>conceivable</i>, then its cost is multiplied by 3.</p>")
		);
		
		let giftCostCalculation = $("<p><span class='giftcost'>Loading...</span><span class='giftcostaddendum'></span></p>");
		giftFactory.add($("<p class='secretnoselect'>Gift cost</p>")).append($("<td></td>").append(giftCostCalculation));
		
		let recalculateCost = () => {
			let cost = parseInt(miracleLevel.val());
			cost += giftModifiers[parseInt(giftInvocationType.prop("selectedIndex"))];
			cost += giftModifiers[parseInt(giftAOEType.prop("selectedIndex"))];
			cost += giftModifiers[parseInt(giftFlexibility.prop("selectedIndex"))];
			if(giftRarity.is(":checked")) {
				cost += 1;
			}
			
			cost *= (parseInt(giftEstateType.prop("selectedIndex")) + 1);
			
			if(cost < 1) {
				giftCostCalculation.find(".giftcostaddendum").text(" (minimum of 1)");
			}
			else {
				giftCostCalculation.find(".giftcostaddendum").text("");
			}
			
			cost = Math.max(cost, 1);
			
			giftCostCalculation.find(".giftcost").text(cost.toString());
			
			attributeUpdate();
		};
		
		miracleLevel.on("input", recalculateCost);
		giftEstateType.on("input", recalculateCost);
		giftInvocationType.on("input", recalculateCost);
		giftAOEType.on("input", recalculateCost);
		giftFlexibility.on("input", recalculateCost);
		giftRarity.on("input", recalculateCost);
		
		giftCostCalculation.addClass("editorevents").on("removed", () => {
			giftCostCalculation.find(".giftcost").text("0");
			attributeUpdate();
		});
		
		recalculateCost();
		
		return {"element": giftFactory.create().css("padding-left", "30px").css("border", "1px dotted grey"), "object": gift};
	};
	
	factory.attachList("gifts", createGiftSection, {min: 0, max: 5});
	
	factory.startSection("Character Traits", "h3");
	
	let createRestriction = (i, object) => {
		object = object || {};
		
		let localFactory = new UI.EditorFactory(object);
		
		localFactory.attachText("restrictionName");
		
		UI.addHoverInfo(
			localFactory.attachSlider("mps", "Miracle Points Granted", {min: 1, max: 3}),
			$("<p>This is the number of miracle points your Restriction grants you when it is invoked.</p>")
		);
		
		localFactory.attachTextArea("description");
		
		return {"element": localFactory.create().css("padding", "10px").css("padding-left", "30px").css("border", "1px dotted grey"), "object": object};
	};
	
	let restrictionExamples = new UI.ElementWindow(
		$("<div></div>").html(nobilisData.restrictionDescriptionText)
			.append($("<p>Some examples include:</p>"))
			.append($("<ul></ul>")
				.append(nobilisData.restrictionExamples.map((restriction) => {
					return $("<li></li>").html(restriction);
				}))
			),
		"Restriction Examples"
	);
	
	let restrictionSection = factory.startSection("Restrictions", "h4").addClass("lookslikelink")
		.click(() => (restrictionExamples.show()));
	
	UI.addHoverInfo(
		restrictionSection,
		$(nobilisData.restrictionDescriptionText).css("font-weight", "initial")
	);
	
	factory.attachList("restrictions", createRestriction, {min: 0, max:10});
	
	let createLimit = (i, object) => {
		object = object || {};
		
		let localFactory = new UI.EditorFactory(object);
		
		localFactory.attachText("limitName");
		
		UI.addHoverInfo(
			localFactory.attachSlider("cps", "Character Points Granted", {min: 1, max: 5}),
			$("<p>This is the number of miracle points granted by your Limit when you took it.</p>")
		).addClass("limitCPs").on("input change", attributeUpdate);
		
		
		localFactory.attachTextArea("description");
		
		return {"element": localFactory.create().css("padding", "10px").css("padding-left", "30px").css("border", "1px dotted grey"), "object": object};
	};
	
	let limitExamples = new UI.ElementWindow(
		$("<div></div>").html(nobilisData.limitDescriptionText)
			.append($("<p>Some examples include:</p>"))
			.append($("<ul></ul>")
				.append(nobilisData.limitExamples.map((limit) => {
					return $("<li></li>").html(limit);
				}))
			),
		"Limit Examples"
	);
	
	let limitSection = factory.startSection("Limits", "h4").addClass("lookslikelink")
		.click(() => (limitExamples.show()));
	
	UI.addHoverInfo(
		limitSection,
		$(nobilisData.limitDescriptionText).css("font-weight", "initial")
	);
	
	factory.attachList("limits", createLimit, {min: 0, max:10});
	
	let createVirtue = (i, object) => {
		object = object || {};
		
		let localFactory = new UI.EditorFactory(object);
		
		localFactory.attachText("virtueName");
		localFactory.attachTextArea("description");
		
		return {"element": localFactory.create().css("padding", "10px").css("padding-left", "30px").css("border", "1px dotted grey"), "object": object};
	};
	
	let virtueExamples = new UI.ElementWindow(
		$("<div></div>").html(nobilisData.virtueDescriptionTextExtended)
			.append($("<p>Four benefits of Virtues:</p>"))
			.append($("<ul></ul>")
				.append(nobilisData.virtueBenefits.map((virtue) => {
					return $("<li></li>").html(virtue);
				}))
			),
		"Virtue Examples"
	);
	
	let virtueSection = factory.startSection("Virtues", "h4").addClass("lookslikelink")
		.click(() => (virtueExamples.show()));
	
	UI.addHoverInfo(
		virtueSection,
		$(nobilisData.virtueDescriptionText).css("font-weight", "initial")
	);
	
	factory.attachList("virtues", createVirtue, {min: 0, max:10});
	
	UI.addHoverInfo(
		factory.startSection("Affiliation", "h4"),
		$("<p><b>Affiliations</b> are a character's code of ethics. Think of them like alignments.</p>").css("font-weight", "initial")
	)
	
	let affiliationPicker = factory.attachSelection(
		"affiliation",
		"Your Affiliation:",
		["Not Selected", ...nobilisData.affiliations.map((affiliation) => (affiliation.name))]
	);
	let affiliationNotSelected = "Affiliation not selected";
	let affiliationDescription = $("<p></p>").html(affiliationNotSelected);
	
	let updateAffiliation = () => {
		let index = $(affiliationPicker).prop("selectedIndex");
		if(index == 0) {
			$(affiliationDescription).html(affiliationNotSelected);
		}
		else {
			let affiliation = nobilisData.affiliations[index - 1];
			$(affiliationDescription).html(affiliation.name)
				.append(
					$("<ul></ul>").append(
						affiliation.principles.map((principle) => ($("<li>" + principle + "</li>")))
					)
				);
		}
	};
	
	affiliationPicker.on("input change", updateAffiliation);
	updateAffiliation();
	
	factory.attachStandalone(affiliationDescription);
	
	factory.startSection("Bonds and Anchors", "h3");
	
	let anchors = factory.attachTextArea("anchors");
	let anchorsMax = $("<i> (Loading...)</i>").appendTo(anchors.prev());
	
	UI.addHoverInfo(
		anchors.prev(),
		$("<p><b>Anchors</b> are mortals (typically humans) who Nobles have made into their allies by the Rite of Servitude. They will loyally serve" +
		  " their Soverign's cause, even if they work against the Noble they serve. Anchors can only be created through bonds of Love or Hate." +
		  " You can have a number of them equal to your Spirit + 1.</p>")
	);
	
	let updateAnchorMax = () => {
		anchorsMax.text(" (up to " + (parseInt(spiritSlider.val()) + 1).toString() + ")");
	};
	
	spiritSlider.on("input", updateAnchorMax);
	updateAnchorMax();
	
	let bondAllocation = factory.attachTextArea("bondAllocation");
	
	UI.addHoverInfo(
		bondAllocation.prev(),
		$("<p>You have <b>twenty points</b> that you must split up amongst those things that are important to you. This determines how much it hurts when those" +
		  " things are stolen, altered, or destroyed. Some examples might include loved ones (spouses, children, parents), the sanctity of your Estate (how well or" +
		  " poorly-regarded it is, or how well it is kept), an important friendship or rivalry, or any objects that are important to you. Many of your Bonds will" +
		  " probably be allocated more than one point; just make sure the allocation is proportional to the importance.</p>")
	);
	
	factory.startSection("Chancel and Imperator Details", "h3");
	factory.attachTextArea("chancelInformation");
	factory.attachTextArea("imperatorInformation");
	
	factory.startSection("Other Character Details");
	factory.attachTextArea("genericCharacterDetails", "Anything else you want to add");
	
	sheet.append(factory.create());
	
	console.log("Loaded.");
};

((window) => {
	let parameters = utils.getParameters();
	
	if(parameters.id === undefined) {
		$(document).ready(() => {
			$("#container").addClass("uhoh").text("No id parameter found (ask Tony what this means)");
		});
	}
	else {
		$.ajax("/api/sheetData?id=" + encodeURIComponent(parameters.id))
			.done((data, text, xhr) => {
				window.characteristics = data;
				initializeSheet(window, parameters.id);
			})
			.fail((xhr, text, err) => {
				console.error(err);
				$("#container").addClass("uhoh").text("Failed to request sheet data: " + text);
			});
	}
})(this);