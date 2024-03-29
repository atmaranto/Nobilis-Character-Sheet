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
	STRIPPED_PATHNAME = STRIPPED_PATHNAME.substring(0, STRIPPED_PATHNAME.length - 1);
}
STRIPPED_PATHNAME = STRIPPED_PATHNAME + "/..";

let initializeSheet = (window, sheetID) => {
	console.log("Loading...");

	let menuHTML = "<button id='openSettings' onclick='UI.createSettingsWindow().show()'>Open Settings</button>";
	let saveStatusHTML = "";
	
	if(!window.SPECTATING && window.sheetPermissions.write) {
		menuHTML += "<button id='saveSheet' onclick='window.saveSheet(\"user\")'>Save Sheet</button>" +
					"<button id='discardChanges' onclick='window.discardChanges()'>Discard Changes Since Last Save</button>";
		saveStatusHTML = "<p id='saveStatus' class='noselect saveStatus'>Placeholder</p>";
	}
	else if(window.SPECTATING) {
		saveStatusHTML = "<p id='saveStatus' class='noselect' saveStatus' style='visibility: visible; color: green;'>Spectating sheet; saving disabled</p>";
	}

	menuHTML += "<button id='gotoManager' onclick='window.gotoManager()'>Go To Sheet Manager</button>" +
				saveStatusHTML +
				"<br />";
	
	let container = $("#container");
	let sheet = container.html("")
		.append(
			menuHTML
		)
		.append(
			"<div id='sheet'></div>"
		)
		.children().last().wrap($("<div class='sheetContainer'></div>"));
	
	window.gotoManager = () => {
		window.location = "../";
	};

	window.lastSavedCharacteristics = JSON.parse(JSON.stringify(characteristics));

	// For now, we'll just index the window's attribute directly.
	// let characteristics = window.characteristics;
	
	window.saveSheet = (cause) => {
		if(window.SPECTATING) {
			return;
		}
		if(!window.sheetPermissions.write) {
			return;
		}
		if(window._saveLock) {
			return;
		}

		// Check if the sheet even needs to be saved (ignoring _id fields)
		if(utils.deepObjectEquals(characteristics, window.lastSavedCharacteristics, (key) => (key === "_id"))) {
			if(cause === "user") {
				$("#saveStatus").css('visibility', 'visible').text("No changes to save.");
				setTimeout(() => ($("#saveStatus").css('visibility', 'hidden')), 5000);
			}

			return;
		}

		$("#saveSheet").attr("disabled", true);

		let characteristicsCopy = JSON.parse(JSON.stringify(characteristics));
		
		let message = {
			sheetData: characteristicsCopy,
			email: utils.zealousGet("email"),
			sessionKey: utils.zealousGet("sessionKey")
		};

		let failedToSave = (err) => {
			console.error(err);
			$("#saveStatus").css('visibility', 'visible').text("Error saving sheet: " + err);
		};
		
		window._saveLock = true;
		fetch(STRIPPED_PATHNAME + "/api/sheetData?id=" + encodeURIComponent(sheetID), {
			"body": JSON.stringify(message),
			"method": "PUT",
			"headers": [
				["Content-Type", "application/json"]
			],
			"keepalive": true
		})
			.then((response) => {
				if(!response.ok) {
					return failedToSave(response.text());
				}

				window.lastSavedCharacteristics = characteristicsCopy;
				if(cause === "user") {
					$("#saveStatus").css('visibility', 'visible').text("Successfully saved sheet.");
					setTimeout(() => ($("#saveStatus").css('visibility', 'hidden')), 5000);
				}
			})
			.catch((err) => {
				failedToSave(err.toString());
			})
			.finally(() => {
				window._saveLock = false;
				$("#saveSheet").removeAttr("disabled");
			});
	};

	let beforeUnloadSaveHandler = () => {
		if(window.SPECTATING) {
			return;
		}

		if(!UI.settings.get("saveBeforeUnload")) {
			if(!UI.settings.get("dontWarnBeforeUnload")) {
				return "Are you sure you want to leave this page? Your changes will be lost if you do not save.";
			}
		}
		else {
			window.saveSheet("unload");
		}
	};

	UI.settings.setField("saveBeforeUnload", {value: true});
	UI.settings.setField("dontWarnBeforeUnload", {value: false});
	
	$(window).on("beforeunload", beforeUnloadSaveHandler);

	UI.settings.setField("autosaveEnabled", {value: true});
	UI.settings.setField("autosaveTimeoutInSeconds", {max: 3600, min: 30, value: 120});

	let autosaveIntervalId;

	let onAutosaveChange = () => {
		if(!window.SPECTATING) {
			return;
		}

		if(autosaveIntervalId) {
			clearInterval(autosaveIntervalId);
			autosaveIntervalId = undefined;
		}

		if(UI.settings.get("autosaveEnabled")) {
			autosaveIntervalId = setInterval(() => {
				window.saveSheet("autosave");
			}, UI.settings.get("autosaveTimeoutInSeconds") * 1000);
		}
	};

	UI.settings.addTracker("autosaveEnabled", onAutosaveChange);
	UI.settings.addTracker("autosaveTimeoutInSeconds", onAutosaveChange);

	UI.settings.fetch();

	window.discardChanges = () => {
		if(window.confirm("Are you sure you want to discard all changes since the last time you saved?")) {
			$(window).off("beforeunload", beforeUnloadSaveHandler);

			window.location.reload();
		}
	}
	
	let factory = new UI.EditorFactory(characteristics);
	
	let permissionArea = $("<div id='permissionArea'></div>");
	let owningMessage = $("<p id='ownershipMessageLocation'></p>");
	
	let considerOwner = () => {
		if(window.sheetOwner) {
			owningMessage.html("This sheet is owned by ").append($("<span style='color: green; font-style: italic'></span>").text(window.sheetOwner));

			if(window.sheetPermissions.write) {
				owningMessage.append(" (you) ");

				if(!window.SPECTATING) {	
					owningMessage.append($("<button id='unclaimSheetButton'>Unclaim sheet?</button>").click(() => {
						$("#unclaimSheetButton").attr("disabled", true);

						let message = {
							id: sheetID,
							email: utils.zealousGet("email"),
							sessionKey: utils.zealousGet("sessionKey")
						};

						$.ajax({
							"url": STRIPPED_PATHNAME + "/api/unclaimSheet",
							"data": JSON.stringify(message),
							"method": "POST",
							"contentType": "application/json"
						})
							.done((data, text, xhr) => {
								window.sheetOwner = null;
								considerOwner();
							})
							.fail((xhr, text, err) => {
								console.error(err);
								$("#unclaimSheetButton").removeAttr("disabled");
							});
					}));
				}
			}
		}
		else {
			owningMessage.html("This sheet is owned by <span style='color: red; font-style: italic'>nobody</span>. ");
			if(!window.SPECTATING) {
				owningMessage.append($("<button id='claimSheetButton'>Claim sheet?</button>")
					.click(() => {
						$("#claimSheetButton").attr("disabled", true);
						
						let message = {
							id: sheetID,
							email: utils.zealousGet("email"),
							sessionKey: utils.zealousGet("sessionKey")
						};
						
						$.ajax({
							"url": STRIPPED_PATHNAME + "/api/claimSheet",
							"data": JSON.stringify(message),
							"method": "POST",
							"contentType": "application/json"
						})
							.done((data, text, xhr) => {
								window.sheetOwner = utils.zealousGet("email");
								
								considerOwner();
							})
							.fail((xhr, text, err) => {
								console.log(err);
								window._xhr = xhr;
								$("#claimSheetButton").removeAttr("disabled").text("Failed: " + xhr.responseText + ". Click to try again.");
							});
					})
				);
			}
		}

		permissionArea.empty();

		const noDesc = {
			"read": "cannot read (??)",
			"write": "cannot write to",
			"owner": "do not own"
		};

		const yesDesc = {
			"read": "can read",
			"write": "can write to",
			"owner": "own"
		};
		
		// Fill the permissions area with "read", "write", and "owner" colored green if the user has that permission
		// and red if they don't.
		["read", "write", "owner"].forEach((permission) => {
			let color;
			let description;

			if(window.sheetPermissions[permission]) {
				if(!window.sheetPermissions[permission + "NoAdmin"]) {
					color = "orange";
					description = "You " + yesDesc[permission] + " this sheet (because you're an admin).";
				}
				else {
					color = "green";
					description = "You " + yesDesc[permission] + " this sheet.";
				}
			}
			else {
				color = "red";
				description = "You " + noDesc[permission] + " this sheet.";
			}

			permissionArea.append(
				$("<span style='color: " + color + "; font-style: italic'></span>")
					.text(permission + " ")
					.attr("title", description)
			);
		});

		permissionArea.append($("<br>"));
		
		// If the user can write to the sheet, show them a checkbox to mark it as public.
		if(window.sheetPermissions.owner) {
			let publicCheckbox = $("<input type='checkbox' id='publicCheckbox'>").prop("checked", window.sheetPermissions.public);
			let publicWritableCheckbox = $("<input type='checkbox' id='publicWritableCheckbox'>").prop("checked", window.sheetPermissions.publicWritable);

			let updatePermissions = () => {
				let checked1 = publicCheckbox.prop("checked");
				let checked2 = publicWritableCheckbox.prop("checked");

				let message = {
					id: sheetID,
					email: utils.zealousGet("email"),
					sessionKey: utils.zealousGet("sessionKey"),
					permissions: {
						public: checked1,
						publicWritable: checked2
					}
				};
				
				$.ajax({
					"url": STRIPPED_PATHNAME + "/api/permissions",
					"data": JSON.stringify(message),
					"method": "POST",
					"contentType": "application/json"
				})
					.done((data, text, xhr) => {
						window.sheetPermissions.public = checked1;
						window.sheetPermissions.publicWritable = checked2;
					})
					.fail((xhr, text, err) => {
						console.error(err);

						publicCheckbox.prop("checked", window.sheetPermissions.public);
						publicWritableCheckbox.prop("checked", window.sheetPermissions.publicWritable);

						let errorText = $("<span><br /></span>")
							.append(
								$("<span style='color: red'></span>")
									.text("Error updating permissions: " + xhr.responseText)
							);
						
						permissionArea.append(errorText);
						
						setTimeout(() => (errorText.fadeOut()), 5000);
					});
			};

			if(!window.SPECTATING) {
				publicCheckbox.change(updatePermissions);
				publicWritableCheckbox.change(updatePermissions);
			}
			else {
				publicCheckbox.prop("disabled", true);
				publicWritableCheckbox.prop("disabled", true);
			}
			
			permissionArea.append(publicCheckbox).append(" Public");
			permissionArea.append(publicWritableCheckbox).append(" Public Writable");
		}
	}

	const nobilisDefaultName = "Nobilis Character";
	let nobilisCharacterTitle = factory.startSection(characteristics.characterName || nobilisDefaultName, "h1")
		.after(owningMessage)
		.after($("<div id='permissionAreaContainer'></div>").append(permissionArea));
	
	considerOwner();
	
	factory.attachText("characterName", "Character Name").addClass("characterName")
		.on("input change", () => {
			let name = $(".characterName").val();
			
			if(name.length == 0) {
				name = nobilisDefaultName;
			}
			
			$(nobilisCharacterTitle).text(name);
		});
	factory.attachText("playerName", "Player Name");
	
	let attributeHoverInfo = $("<p>Loading...</p>");

	let attributeUpdate = () => {
		let _s = 0;
		let max = 25;

		let explanations = ["Character point cost assessment:"];

		let getSourceExplanation = (source) => {
			let explanation = $(source).prop("cpExplanation");
			let realSource = $(source).prop("cpExplanationSource");

			if(explanation) {
				if(realSource) {
					return explanation + " \"" + $("." + realSource).val() + "\"";
				}
				else {
					return explanation;
				}
			}
			else {
				return "Unknown Sources";
			}
		}

		let getRollingSum = (source) => {
			return "[+=" + _s + "] ";
		}
		
		$(".attribute").each((index, item) => {
			let total = parseInt($(item).val()) * 3;
			_s += total;
			
			if(total > 0) {
				explanations.push(getRollingSum() + $(item).val() + " x 3 = " + total + " from " + getSourceExplanation(item));
			}
		});
		$(".smallAttribute").each((index, item) => {
			let total = parseInt($(item).val()) * 1;
			_s += total;

			if(total > 0) {
				explanations.push(getRollingSum() + total + " from " + getSourceExplanation(item));
			}
		});
		$(".attributePermanentPoint").each((index, item) => {
			let total = parseInt($(item).val()) - 5;
			_s += total;

			if(total > 0) {
				explanations.push(getRollingSum() + total + " from extra " + getSourceExplanation(item));
			}
		});
		$(".giftcost").each((index, item) => {
			let total = parseInt($(item).text());
			if(!isNaN(total)) {
				_s += total;
				explanations.push(getRollingSum() + total + " from " + getSourceExplanation(item));
			}
		});
		$(".limitCPs").each((index, item) => {
			let total = parseInt($(item).val());
			max += total;
			explanations.push(total + " extra maximum CP from " + getSourceExplanation(item));
		});
		let fromRaw = 0;
		$(".rawCPs").each((index, item) => {
			let raw = parseInt($(item).val());
			if(!isNaN(raw)) {
				max += raw;
				fromRaw += raw;
			}
		});

		if(fromRaw > 0) {
			explanations.push(fromRaw + " extra maximum CP granted from extraneous sources");
		}

		explanations.push("");
		let totalTag = $("<span></span>").text("Total: " + _s + " / " + max);
		if(_s > max) {
			totalTag.css("color", "red");
			totalTag.append(" (Over by " + (_s - max) + ")");
		}
		explanations.push(totalTag);

		attributeHoverInfo.html("").append(
			explanations.map((item) => ((typeof item === "string") ? $("<span></span>").text(item) : item).append("<br />"))
		);
		
		let attributeSum = $("#attributeSum")
			.html("").text(_s.toString() + " character points");
		
		if(_s > max) {
			attributeSum.append(
				$("<span></span>")
					.css("color", "red")
					.css("font-style", "italic")
					.text(" (above maximum of " + max.toString() + " points by " + (_s - max).toString() + ", only possible by adding more Limits)")
			);
		}
		else {
			attributeSum.append(
				$("<span></span>")
					.css("font-style", "italic")
					.text(" (maximum of " + max.toString() + ")")
			);
		}
	};
	
	factory.add().append(
		UI.addHoverInfo(
			$("<td><span id='attributeSum' class='secretnoselect'>Loading...</span></td>").ready(attributeUpdate),
			attributeHoverInfo
		)
	);
	
	factory.startSection("Attributes", "h2");
	let aspectSlider = factory.attachSlider("aspect", "<b>Aspect</b> (body and mind)", {min: 0, max: 5}, 0)
		.addClass("attribute").prop("cpExplanation", "Aspect Levels").on("input change", attributeUpdate);
	let domainSlider = factory.attachSlider("domain", "<b><i>Primary</i> Domain</b> (control over Estate)", {min: 0, max: 5}, 0)
		.addClass("attribute").prop("cpExplanation", "Primary Domain Levels").on("input change", attributeUpdate);
	let realmSlider = factory.attachSlider("realm", "<b>Realm</b> (power in Chancel)", {min: 0, max: 5}, 0)
		.addClass("attribute").prop("cpExplanation", "Realm Levels").on("input change", attributeUpdate);
	let spiritSlider = factory.attachSlider("spirit", "<b>Spirit</b> (rites and Auctoritas)", {min: 0, max: 5}, 0)
		.addClass("attribute").prop("cpExplanation", "Spirit Levels").on("input change", attributeUpdate);
	
	let setupAttributeSliderDescription = (slider, data) => {
		let title = $("<p class='attributeTitle noselect'></p>").appendTo(slider.parent().parent());
		let description = $("<p class='attributeDescription'></p>");
		let updateDescription = () => {
			let level = data[parseInt(slider.val())];
			title.html(level.name);
			description.html(level.description);
		};
		updateDescription();
		slider.on("input change", updateDescription);
		UI.addHoverInfo(title, description);
	};
	
	setupAttributeSliderDescription(aspectSlider, window.nobilisData.aspectLevels);
	setupAttributeSliderDescription(domainSlider, window.nobilisData.domainLevels);
	setupAttributeSliderDescription(realmSlider, window.nobilisData.realmLevels);
	setupAttributeSliderDescription(spiritSlider, window.nobilisData.spiritLevels);
	
	let aspectInfoWindow = new UI.ElementWindow(
		$("<p></p>").addClass("attributeInfoWindow").html(window.nobilisData.attributeDescriptions.aspect),
		"Aspect Info"
	);
	aspectSlider.parent().prev().children().first().addClass("lookslikelink").click(() => (aspectInfoWindow.show()));
	
	let domainInfoWindow = new UI.ElementWindow(
		$("<p></p>").addClass("attributeInfoWindow").html(window.nobilisData.attributeDescriptions.domain),
		"Domain Info"
	);
	domainSlider.parent().prev().children().first().addClass("lookslikelink").click(() => (domainInfoWindow.show()));
	
	let realmInfoWindow = new UI.ElementWindow(
		$("<p></p>").addClass("attributeInfoWindow").html(window.nobilisData.attributeDescriptions.realm),
		"Realm Info"
	);
	realmSlider.parent().prev().children().first().addClass("lookslikelink").click(() => (realmInfoWindow.show()));
	
	let spiritInfoWindow = new UI.ElementWindow(
		$("<p></p>").addClass("attributeInfoWindow").html(window.nobilisData.attributeDescriptions.spirit),
		"Spirit Info"
	);
	spiritSlider.parent().prev().children().first().addClass("lookslikelink").click(() => (spiritInfoWindow.show()));
	
	factory.startSection("Miracle Points", "h2");
	
	factory.startSection("Permanent Miracle Points", "h3");
	
	let lockUnlockButton = $("<div id='lockunlockbutton' title='Lock or Unlock Permanent Miracle Points' class='unlockbutton lockunlockbutton'></div>");
	
	factory.add($("<label for='lockunlockbutton' class='noselect'>Lock/Unlock Permanent Miracle Points:  </label>"))
		.append($("<td></td>").append(lockUnlockButton));
	
	// Preload lock/unlock images
	let imgLock = $("<img src='../images/lock.svg' />");
	let imgUnlock = $("<img src='../images/unlock.svg' />");
	
	let permanentAMPSlider = factory.attachSlider("permanentAMP", "<b>Aspect</b> Permanent Miracle Points", {min: 5, max: 20}, 5)
		.addClass("attributePermanentPoint").prop("cpExplanation", "Aspect Miracle Points").on("input change", attributeUpdate).attr("disabled", true);
	let permanentDMPSlider = factory.attachSlider("permanentDMP", "<b>Domain</b> Permanent Miracle Points", {min: 5, max: 20}, 5)
		.addClass("attributePermanentPoint").prop("cpExplanation", "Domain Miracle Points").on("input change", attributeUpdate).attr("disabled", true);
	let permanentRMPSlider = factory.attachSlider("permanentRMP", "<b>Realm</b> Permanent Miracle Points", {min: 5, max: 20}, 5)
		.addClass("attributePermanentPoint").prop("cpExplanation", "Realm Miracle Points").on("input change", attributeUpdate).attr("disabled", true);
	let permanentSMPSlider = factory.attachSlider("permanentSMP", "<b>Spirit</b> Permanent Miracle Points", {min: 5, max: 20}, 5)
		.addClass("attributePermanentPoint").prop("cpExplanation", "Spirit Miracle Points").on("input change", attributeUpdate).attr("disabled", true);
	
	UI.addHoverInfo(
		permanentSMPSlider,
		$("<p></p>").html(window.nobilisData.SMPExplanation)
	);
	
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
	
	factory.startSection("Temporary Miracle Points", "h3");
	
	let maxTemporaryMPs = 25; // Theoretically configurable, but needing more than this seems unlikely, so I've hardcoded it for now
	
	let temporaryAMPSlider = factory.attachSlider("temporaryAMP", "<b>Aspect</b> Miracle Points", {min: 0, max: maxTemporaryMPs}, 5)
		.addClass("attributeTemporaryPoint").on("input change", attributeUpdate)
	let temporaryDMPSlider = factory.attachSlider("temporaryDMP", "<b>Domain</b> Miracle Points", {min: 0, max: maxTemporaryMPs}, 5)
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
		
		characteristics.tempPermSync = enableSliderSync;
	};
	
	factory.attachStandalone(
		UI.addHoverInfo(
			$("<div></div>")
				.append($("<label for='tempPermSync' class='noselect'>Enable synchronization with Permanent Miracle Points: </label>"))
				.append(
					$("<input id='tempPermSync' type='checkbox' />")
						.prop("checked", characteristics.tempPermSync == true)
						.change(() => {
							installTempPermSync($("#tempPermSync").prop("checked"));
						})
				),
				$("<p>This option makes sure the maximum temporary MPs you have is no greater than your permanent MPs.<br />" +
				  "Disabling this option may be helpful, as there are ways of acquiring additional temporary MPs during play.</p>")
		)
	);
	
	if(characteristics.tempPermSync == true) {
		installTempPermSync(characteristics.tempPermSync);
	}
	
	factory.startSection("Domains", "h2");
	
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
			section = attributeFactory.startSection("Primary Domain", "h3");
		}
		else {
			section = attributeFactory.startSection("Secondary Domain", "h3");
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
		
		let indicatorClass = "cpsource" + Math.random().toString(36).substr(2, 9);
		attributeFactory.attachText("domainDescription", "Domain description").addClass(indicatorClass);
		
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
			.prop("cpExplanation", "Secondary Domain")
			.prop("cpExplanationSource", indicatorClass)
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
		attributeFactory.attachRichTextArea(
			"estateProperties", 
			$("<p class='lookslikelink'>Estate Properties (click for info)</p>")
				.click(() => (estatePropertiesInfoWindow.show()))
		);
		
		slider.on("input change", updateTable);
		
		updateTable();
		
		return {"element": attributeFactory.create().addClass("domaintable"), "object": thisObject};
	};
	
	factory.attachList("domains", createDomainSection, {min: 1, max: 5});
	
	factory.startSection("Aspect and Wound Levels", "h2");
	
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
		  "your Aspect to calculate your maximum wound levels for you.</p>").css("font-style", "italic"));
	
	let surfaceWoundSlider = factory.attachSlider("surfaceWounds", "Surface Wounds Sustained", {min: 0, max: 5}, 0)
			.addClass("surfaceWounds wounds");
	UI.addHoverInfo(surfaceWoundSlider.parent(), surfaceWoundExplanation);
	let seriousWoundSlider = factory.attachSlider("seriousWounds", "Serious Wounds Sustained", {min: 0, max: 5}, 0)
			.addClass("seriousWounds wounds");
	UI.addHoverInfo(seriousWoundSlider.parent(), seriousWoundExplanation);
	let deadlyWoundSlider = factory.attachSlider("deadlyWounds", "Deadly Wounds Sustained", {min: 0, max: 5}, 0)
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
	
	let riteOfHolyFireWindow = new UI.ElementWindow(
		$("<p></p>").html(window.nobilisData.riteOfHolyFireExplanation),
		"Rite of Holy Fire Info"
	);
	
	factory.attachCheckbox("riteOfHolyFire", "")
		.parent().prev().children()
		.html("Protected by <b>Rite of Holy Fire</b>")
		.addClass("lookslikelink noselect")
		.click(() => (riteOfHolyFireWindow.show()));
	
	factory.attachStandalone($("<p>Maximum wound levels:</p>"));
	factory.attachStandalone(woundLevelTable);
	
	aspectSlider.on("input", recalculateWoundLevels);
	recalculateWoundLevels();
	
	factory.attachParagraph("Aspect miracle table:");
	
	let aspectMiracleTable = $("<table></table>");
	let updateAspectTable = createAttributeMiracleTable("aspect", aspectSlider, aspectMiracleTable);
	factory.attachStandalone(aspectMiracleTable);
	
	aspectSlider.on("input change", updateAspectTable);
	
	updateAspectTable();
	
	factory.startSection("Realm Miracles", "h2");
	
	factory.attachParagraph("Realm miracle table:");
	
	let realmMiracleTable = $("<table></table>");
	let updateRealmTable = createAttributeMiracleTable("realm", realmSlider, realmMiracleTable);
	factory.attachStandalone(realmMiracleTable);
	
	realmSlider.on("input change", updateRealmTable);
	
	updateRealmTable();
	
	let giftInfoWindow = new UI.ElementWindow(
		$("<p></p>").html(window.nobilisData.giftInfo),
		"Gift Information"
	);
	factory.startSection("Gifts", "h2")
		.addClass("lookslikelink noselect")
		.click(() => (giftInfoWindow.show()));;
	
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

		let giftNameClass = "cpexplanation" + Math.random().toString(36).substring(2, 15);

		giftFactory.attachText("giftName", "Gift Name").addClass(giftNameClass);
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
			"One person - you or a nearby mortal (-2)",
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
		
		let giftDescription = giftFactory.attachRichTextArea("giftDescription", "Gift Description");
		
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
			
			giftCostCalculation.find(".giftcost")
				.prop("cpExplanation", "Gift")
				.prop("cpExplanationSource", giftNameClass)
				.text(cost.toString());
			
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
	
	factory.startSection("Character Traits", "h2");
	
	let createRestriction = (i, object) => {
		object = object || {};
		
		let localFactory = new UI.EditorFactory(object);
		
		localFactory.attachText("restrictionName");
		
		UI.addHoverInfo(
			localFactory.attachSlider("mps", "Miracle Points Granted", {min: 1, max: 3}),
			$("<p>This is the number of miracle points your Restriction grants you when it is invoked.</p>")
		);
		
		localFactory.attachRichTextArea("description");
		
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
	
	let restrictionSection = factory.startSection("Restrictions", "h3").addClass("lookslikelink")
		.click(() => (restrictionExamples.show()));
	
	UI.addHoverInfo(
		restrictionSection,
		$(nobilisData.restrictionDescriptionText).css("font-weight", "initial")
	);
	
	factory.attachList("restrictions", createRestriction, {min: 0, max:10});
	
	let createLimit = (i, object) => {
		object = object || {};
		
		let localFactory = new UI.EditorFactory(object);
		
		let limitNameClass = "limitname" + Math.random().toString(36).substring(2, 15);
		localFactory.attachText("limitName").addClass(limitNameClass);
		
		UI.addHoverInfo(
			localFactory.attachSlider("cps", "Character Points Granted", {min: 1, max: 5})
				.prop("cpExplanation", "Limit")
				.prop("cpExplanationSource", limitNameClass),
			$("<p>This is the number of miracle points granted by your Limit when you took it.</p>")
		).addClass("limitCPs").on("input change", attributeUpdate);
		
		
		localFactory.attachRichTextArea("description");
		
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
	
	let limitSection = factory.startSection("Limits", "h3").addClass("lookslikelink")
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
		localFactory.attachRichTextArea("description");
		
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
	
	let virtueSection = factory.startSection("Virtues", "h3").addClass("lookslikelink")
		.click(() => (virtueExamples.show()));
	
	UI.addHoverInfo(
		virtueSection,
		$(nobilisData.virtueDescriptionText).css("font-weight", "initial")
	);
	
	factory.attachList("virtues", createVirtue, {min: 0, max:10});
	
	UI.addHoverInfo(
		factory.startSection("Affiliation", "h3"),
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
	
	factory.startSection("Additional Character Points", "h2");
	factory.attachParagraph("Here, you can document any additional character points you receive, alongwith their sources (ex. start of game bonus, story reward, etc.).");
	
	let addAdditionalCPSection = (i, sectionData) => {
		sectionData = sectionData || {};
		let sectionFactory = new UI.EditorFactory(sectionData);
		
		sectionFactory.attachText("rawCPs", "Raw Character Points Granted")
			.addClass("rawCPs editorevents")
			.attr("type", "number")
			.on("input change", attributeUpdate).on("removed", function() {
				// Hack to manually remove the provided CPs when this is deleted
				$(this).val("0");
				attributeUpdate();
			});
		sectionFactory.attachRichTextArea("cpSource", "Source of Character Points");
		
		return {"element": sectionFactory.create().css("padding-left", "30px").css("border", "1px dotted grey"), "object": sectionData};
	};
	
	factory.attachList("additionalCPs", addAdditionalCPSection, {min: 0});
	
	factory.startSection("Bonds and Anchors", "h2");
	
	let anchors = factory.attachRichTextArea("anchors");
	let anchorsMax = $("<i> (Loading...)</i>").appendTo(anchors.prev());
	
	UI.addHoverInfo(
		anchors.prev(),
		$("<p><b>Anchors</b> are mortals (typically humans) who Nobles have made into their allies by the Rite of Servitude. They will loyally serve" +
		  " their Soverign's cause, even if they work against the Noble they serve. Anchors can only be created through bonds of Love or Hate." +
		  " You can have a number of them equal to your Spirit + 1. Click for rules on Anchors.</p>")
	);
	
	let anchorsInfoWindow = new UI.ElementWindow(
		$("<p></p>").html(window.nobilisData.anchorInfo.text)
			.append(
				$("<ul></ul>").append(
					window.nobilisData.anchorInfo.rules.map((text) => ($("<li></li>").html(text)))
				)
			),
		"Anchor Info"
	);
	anchors.prev().addClass("noselect lookslikelink").css("cursor", "pointer").click(() => (anchorsInfoWindow.show()));
	
	let updateAnchorMax = () => {
		anchorsMax.text(" (up to " + (parseInt(spiritSlider.val()) + 1).toString() + ")");
	};
	
	spiritSlider.on("input", updateAnchorMax);
	updateAnchorMax();
	
	let bondAllocation = factory.attachRichTextArea("bondAllocation");
	
	UI.addHoverInfo(
		bondAllocation.prev(),
		$("<p>You have <b>twenty points</b> that you must split up amongst those things that are important to you. This determines how much it hurts when those" +
		  " things are stolen, altered, or destroyed. Some examples might include loved ones (spouses, children, parents), the sanctity of your Estate (how well or" +
		  " poorly-regarded it is, or how well it is kept), an important friendship or rivalry, or any objects that are important to you. Many of your Bonds will" +
		  " probably be allocated more than one point; just make sure the allocation is proportional to the importance.</p>")
	);
	
	factory.startSection("Chancel and Imperator Details", "h2");
	factory.attachRichTextArea("chancelInformation");
	factory.attachRichTextArea("imperatorInformation");
	
	factory.startSection("Other Character Details", "h2");
	factory.attachRichTextArea("genericCharacterDetails", "Anything else you want to add");
	
	let toc = $(factory.createTableOfContents());
	
	let portraitWidth = 250;
	let portraitHeight = 250;
	
	let reloadPortrait = (file, portrait) => {
		portrait = (portrait || $("#portrait")).html("");
		portrait.css({
			"width": portraitWidth.toString() + "px",
			"height": portraitHeight.toString() + "px",
		});
		if(characteristics.hasPortrait) {
			let image = $("<img />");
			
			image.prop("src", file ? URL.createObjectURL(file) : STRIPPED_PATHNAME + "/api/sheetImage?id=" + encodeURIComponent(sheetID));
			let borderSize = 5;
			image.css({"max-width": portraitWidth, "max-height": portraitHeight, "border": borderSize.toString() + "px solid black"});
			
			portrait.css({
				"border": ""
			});
			
			portrait.append(image);
			let _disabled = false;
			portrait.append(
				$("<a title='Remove image' class='removeButton' href='#'>Delete</a>")
					.click((e) => {
						e.preventDefault();
						if(_disabled) return;
						_disabled = true;
						
						$.ajax({
							url: STRIPPED_PATHNAME + "/api/sheetImage?id=" + encodeURIComponent(sheetID),
							method: "DELETE",
						})
						.done((data, text, xhr) => {
							characteristics.hasPortrait = false;
							window.saveSheet("portrait");
							reloadPortrait();
						})
						.fail((xhr, text, err) => {
							let errorText = $("<span style='color: red'><br /></span>").text("Error deleting file: " + xhr.responseText);
							portrait.append(errorText);

							if(xhr.responseText.indexOf("not found") != -1) {
								characteristics.hasPortrait = false;
								window.saveSheet("portrait");
								reloadPortrait();
							}
							
							setTimeout(() => {
								errorText.fadeOut();
							}, 5000);
							_disabled = false;
						});
					})
					.css({"top": ((borderSize).toString() + "px"), "left": ((borderSize).toString() + "px")})
			);
		}
		else {
			let _disabled = false;
			let fileDialog = $("<input type='file' style='display: none' accept='image/*' />")
				.on("change", () => {
					if(_disabled) return;
					let files = fileDialog.prop("files");
					if(files.length > 0 && files[0].type.toLowerCase().startsWith("image/")) {
						// Upload first file
						let formData = new FormData();
						formData.append("portrait", files[0]);
						_disabled = true;
						
						$.ajax({
							url: STRIPPED_PATHNAME + "/api/sheetImage?id=" + encodeURIComponent(sheetID),
							method: "PUT",
							data: formData,
							processData: false,
							contentType: false
						})
						.done((data, text, xhr) => {
							characteristics.hasPortrait = true;
							window.saveSheet("portrait");
							reloadPortrait(files[0]);
						})
						.fail((xhr, text, err) => {
							let errorText = $("<span style='color: red'><br /></span>").text("Error uploading file: " + xhr.responseText);
							portrait.append(errorText);
							
							setTimeout(() => (errorText.fadeOut()), 5000);
							_disabled = false;
						});
					}
				});
			portrait.append(
				$("<p>No portrait. </p>")
					.append(
						$("<a href='#'>Upload one?</a>")
							.click((e) => {
								e.preventDefault();
								fileDialog.click();
							})
					)
					.append(fileDialog)
			);
		}
	};
	
	let portrait = $("<div id='portrait'></div>");
	reloadPortrait(undefined, portrait);
	
	let sidebar = $("<div class='sidebar'></div>");
	sidebar.append(toc);
	sidebar.append(portrait);
	
	sheet.parent().append(sidebar);
	sheet.append(factory.create());
	
	console.log("Loaded.");
};

((window) => {
	let parameters = utils.getParameters();
	let id = parameters.id;
	window.SPECTATING = parameters.spectate === "true";
	
	if(parameters.id === undefined) {
		let lastSheetId = utils.cookie.get("last-sheet-id");
		if(lastSheetId != undefined) {
			let url = new URL(location.href);
			url.searchParams.set("id", lastSheetId);
			window.location.assign(url);
		}
		
		$(document).ready(() => {
			//$("#container").addClass("uhoh").text("No id parameter found. Redirecting you to the sheet manager...");
			window.location.assign("./manager.html");
		});
	}
	else {
		$.ajax({
			url: STRIPPED_PATHNAME + "/api/sheetData?id=" + encodeURIComponent(parameters.id),
			data: {
				"email": utils.zealousGet("email"),
				"sessionKey": utils.zealousGet("sessionKey")
			},
			method: "GET"
		}).done((data, text, xhr) => {
				window.characteristics = data.sheetData;
				window.sheetOwner = data.sheetOwner;
				window.sheetPermissions = data.permission;
				utils.cookie.set("last-sheet-id", parameters.id);
				
				try {
					// Add sheet to recent sheets
					let recentSheets = JSON.parse((localStorage || sessionStorage).getItem("recentSheets") || "[]");

					recentSheets = recentSheets.map((item) => {
						if(typeof item === "string") {
							return {id: item, lastModified: null, owner: null};
						}

						return item;
					})

					let found = recentSheets.find((item) => (item.id === parameters.id));
					if(found !== undefined) {
						recentSheets.splice(recentSheets.indexOf(found), 1);
					}

					let sheet = {
						id: parameters.id,
						lastModified: data.lastModified,
						owner: data.sheetOwner
					};

					recentSheets.splice(0, 0, sheet);
					(localStorage || sessionStorage).setItem("recentSheets", JSON.stringify(recentSheets))
				}
				catch(e) {
					console.log("Non-fatal error while trying to add sheet to recent sheets: " + e);
				}

				initializeSheet(window, parameters.id);
			})
			.fail((xhr, text, err) => {
				console.error(err);
				$("#container").addClass("uhoh").text("Failed to request sheet data: " + xhr.responseText);
			});
	}
})(this);