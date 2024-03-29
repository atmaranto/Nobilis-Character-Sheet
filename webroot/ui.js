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

(() => {
	if(window.Quill !== undefined) {
		Quill.register('modules/cursors', QuillCursors);
	}

	window.UI = {};
	UI = window.UI;
	
	UI.Settings = function(defaultSettings) {
		if(defaultSettings == undefined)
			defaultSettings = {};
		
		this.settings = defaultSettings;
		this.trackers = {};
		
		this.fields = {}; //A list of valid setting fields
		
		var type, key;
		var keys = Object.keys(this.settings);
		for(var i = 0; i < keys.length; i++) {
			key = keys[i];
			
			type = typeof this.settings[key];
			if(type == "number") {
				this.fields[key] = {value: this.settings[key], min: 0.0, max: 1.0, type: "number"};
			}
			else if(type == "string") {
				this.fields[key] = {value: this.settings[key], type: "string"};
			}
			else if(type == "boolean") {
				this.fields[key] = {value: this.settings[key], type: "boolean"};
			}
		}
		
		this.fetch();
	}
	
	UI.Settings.prototype = {
		get: function(settingName, defaultValue) {
			var value = this.settings[settingName];
			if(value == undefined)
			{
				if(defaultValue !== undefined) {
					return defaultValue;
				}

				if(this.fields[settingName]) {
					return this.fields[settingName].value;
				}
			}
			return value;
		},
		
		set: function(settingName, settingValue) {
			var old = this.settings[settingName];
			
			if(this.fields[settingName]) {
				//Try to convert the value into the correct type, if it isn't already
				var type = this.fields[settingName].type.replace("select", "string");
				var newType = typeof settingValue;
				
				if(type != newType) {
					if(type == "number") {
						settingValue = parseFloat(settingValue);
					}
					else if(type == "boolean") {
						settingValue = settingValue.toLowerCase() == "true";
					}
				}
			}
			this.settings[settingName] = settingValue;
			
			if(this.trackers[settingName] != undefined) {
				var toRemove = [];
				this.trackers[settingName].forEach((tracker) => {
					if(tracker(settingValue, old)) {
						toRemove.push(tracker);
					}
				});
				
				toRemove.forEach((tracker) => {
					this.trackers.remove(tracker);
				});
			}
		},
		
		addTracker: function(settingName, tracker) {
			//Adds a tracker that's called whenever a settings is changed
			
			if(this.trackers[settingName] == undefined)
				this.trackers[settingName] = [];
			
			this.trackers[settingName].push(tracker);
		},
		
		removeTracker: function(settingName, tracker) {
			this.trackers[settingName].remove(tracker);
		},
		
		fetch: function() {
			//Fetches the settings from the cookie store
			let settings = utils.cookie.get("settings");
			
			if(settings) {
				settings = JSON.parse(settings);
				
				let keys = Object.keys(settings);
				for(var i = 0; i < keys.length; i++) { //Trying for-in loops
					this.set(keys[i], settings[keys[i]]); //Activates the trackers
				}
			}
		},
		
		commit: function(callback) {
			utils.cookie.set("settings", JSON.stringify(this.settings));
			
			callback();
		},
		
		setField: function(name, field) {
			if(field.min || field.max) {
				field.type = "number";
			}
			else if(typeof field.value == "string") { //This might become non-standard, so I'm writing it out instead of taking the obvious, easy route.
				field.type = "string";
			}
			else if(typeof field.value == "boolean") {
				field.type = "boolean";
			}
			if(!this.fields[name]) this.fields[name] = {};
			if(!field.value && this.settings[name]) field.value = this.settings[name];
			utils.strongExtend(this.fields[name], field);
		},
		
		getField: function(name) {
			if(this.fields[name]) {
				if(typeof this.fields[name] == "string") {
					return {min: 0.0, max: 1.0}; //Default min/max
				}
				return this.fields[name];
			}
		}
	}
	
	//I got tired of clicking sign in
	
	UI.settings = new UI.Settings({
		canToggleMinimized: false,
		documentWindowSizePixels: 600,
		maxWindowWidth: 600,
		maxWindowHeight: 600
	});
	UI.settings.setField("documentWindowSizePixels", {min: 100, max: 1000});
	UI.settings.setField("maxWindowWidth", {min: 100, max: null});
	UI.settings.setField("maxWindowHeight", {min: 100, max: null});
	
	UI.settings.addTracker("maxWindowWidth", (value) => {
		utils.updateCSSStyle("div.windowcontent", "max-width", value+"px");
	});
	UI.settings.addTracker("maxWindowHeight", (value) => {
		utils.updateCSSStyle("div.windowcontent", "max-height", value+"px");
	});
	
	let _editorIDCounter = 0;
	
	UI.EditorFactory = function(object, containerClass, container) {
		this.object = object;
		
		this.fragments = [];
		this.pushTable();
		
		this.container = container || $("<div></div");
		this.container.className = containerClass || "";
		
		this.sections = [];
		this.sectionAnchors = [];
		this.editorID = _editorIDCounter++;

		this.collaboration = null;
	}
	
	UI.EditorFactory.prototype = {
		pushTable: function() {
			this.fragments.push($("<table class='editortable'></table>"));
		},
		
		add: function(element) {
			if(typeof element == "string") {
				if(element.indexOf("<") != -1) {
					var el = $(element);
				}
				else {
					element = $(document.createElement(element));
				}
			}
			
			var cell = $("<td></td>");
			cell.append(element);
			
			var row = $("<tr></tr>");
			row.append(cell);
			
			this.fragments[this.fragments.length - 1].append(row[0]);
			return row;
		},
		
		startSection: function(heading, headingStyle) {
			headingStyle = headingStyle || "h2";
			let container = $("<center></center>").first();
			
			container.append($("<hr />"));
			
			if(heading) {
				if(typeof heading === "string" && heading.length > 0) {
					heading = $(document.createElement(headingStyle)).text(heading).addClass("sectionheading secretnoselect");
					container.prepend(heading);
				}
				else {
					container.append($(heading).addClass("secretnoselect"));
				}
			}
			
			let anchorID = this.editorID.toString() + "_" + this.sections.length.toString() + $(heading).text().replace(/\W/g, "");
			container.prepend($("<a></a>").attr("name", anchorID));
			
			this.sections.push({"heading": $(heading).text(), "importance": headingStyle});
			this.sectionAnchors.push(anchorID);
			
			this.fragments.push(container);
			this.pushTable();
			
			return $(heading);
		},

		enableCollaboration: function(endpoint, name) {
			if(window.ReconnectingWebSocket) {
				this.collaboration = {
					socket: new ReconnectingWebSocket(endpoint),
					name: name
				};

				this.collaboration.connection = new sharedb.Connection(this.collaboration.socket);
			}
		},
		
		//Creates an attached text input for an attribute in object
		attachText: function(name, text, attrs) {
			var rnd = (Math.random()).toString().substr(2);
			var row = this.add("<label for=\"text"+rnd+"\" class='secretnoselect'>" +
				(text || utils.capitalize(name)) + "</label>"
			);
			
			var input = $("<input />");
			input.attr("id", "text"+rnd);
			utils.applyAttrs(input, attrs);
			
			utils.attachInput(input, undefined, this.object, name);
			
			row.append($("<td></td>").append(input));
			
			return input;
		},
		
		attachTextArea: function(name, label, attrs) {
			let rnd = (Math.random()).toString().substring(2);
			
			let container = $("<div></div>");
			let input = $("<textarea class='editorarea'/>");
			
			input.attr("id", "text"+rnd);
			utils.applyAttrs(input, attrs);
			
			utils.attachInput(input, undefined, this.object, name);
			
			if(label != false) {
				if(typeof label === "string" || !label) {
					container.append($("<p></p>").text(label || utils.capitalize(name)).css("margin-bottom", "2px"));
				}
				else {
					container.append($(label));
				}
			}
			container.append(input);
			this.fragments.push(container)
			this.pushTable();
			
			return input;
		},

		attachRichTextArea: function(name, label, attrs, realPath) {
			if(Quill === undefined) {
				return this.attachTextArea(name, label, attrs);
			}
			
			let docid = realPath || name;
			let rnd = (Math.random()).toString().substring(2);
			let editorid = "richtextarea" + rnd;

			let editor = $("<div id='" + editorid + "'></div>");

			let container = $("<div></div>")
				.css({
					"margin": "2px",
					"border-collapse": "initial",
					"text-indent": "initial",
					"border-spacing": "initial"
				});
			
			if(label != false) {
				if(typeof label === "string" || !label) {
					container.append($("<p></p>").text(label || utils.capitalize(name)).css("margin-bottom", "2px"));
				}
				else {
					container.append($(label));
				}
			}
			
			container.append(editor);
			
			let onAdded = () => {
					let quill = new Quill(
						"#" + editorid,
						{
							modules: {
								toolbar: [
									[{ size: [] }],
									['bold', 'italic', 'underline', 'strike'],
									[ /* 'image', */ 'link', 'blockquote'],

									[{ list: 'ordered' }, { list: 'bullet' }],
									[{ script: 'sub' }, { script: 'super' }],

									[{'color': []}],
									[{'font': []}],
									[{'align': []}],

									['clean']
								],
								cursors: this.collaboration !== undefined && this.collaboration !== null
							},
							theme: "snow"
						});
					
					if(this.collaboration) {
						doc.subscribe(function(err) {
							if(err) {
								console.error(err);
								editor.append(this.attachTextArea(name, label, attrs).parent());
			
								return;
							}
		
							let doc = this.collaboration.connection.get("collaboration", docid);
			
							// ?
			
							let cursors = quill.getModule('cursors');
							
							quill.on("text-change", function(delta, oldDelta, source) {
								if(source !== "user") return;
								doc.submitOp(delta);
							});
			
							doc.on("op", function(op, source) {
								if(source === quill) return;
								quill.updateContents(op);
							});
			
							let presence = doc.connection.get("presence", docid);
			
							presence.subscribe((err) => {
								throw err;
							});
			
							let presenceId = new ObjectID().toString();
			
							let localPresence = presence.create(presenceId);
			
							quill.on("selection-change", (range, oldRange, source) => {
								if(source !== "user") return;
								if(!range) return;
			
								range.name = this.collaboration.name;
								localPresence.submit(range, (err) => {
									if(err) throw err;
								});
							});
			
							presence.on("receive", (id, range) => {
								let name = range.name || "Anonymous";
								cursors.createCursor(docid, name, "#000000");
								cursors.moveCursor(docid, range);
							});
						});
					}
					else {
						let value = this.object[name];
		
						if(typeof value === "string") {
							quill.setText(value);
						}
						else if(typeof value === "object") {
							quill.setContents(value);
						}
						this.object[name] = quill.getContents();
		
						quill.on("text-change", (delta, oldDelta, source) => {
							if(source !== "user") return;
							this.object[name] = quill.getContents();
						});
					}
				};
			
			let checkNodes = (node) => {
				if(node.id === editorid) {
					observer.disconnect();
					setTimeout(onAdded, 1);
					
					return true;
				}

				for(let i = 0; i < node.childNodes.length; i++) {
					let childNode = node.childNodes[i];
					
					if(childNode.nodeType === Node.ELEMENT_NODE) {
						if(checkNodes(childNode)) {
							return true;
						}
					}
				}
			};
			
			// There's probably a more efficient way to do this...
			let observer = new MutationObserver((records) => {
				for(let i = 0; i < records.length; i++) {
					if(checkNodes({childNodes: records[i].addedNodes})) {
						return;
					}
				}
			});
			observer.observe($("body")[0], { childList: true, subtree: true });

			this.fragments.push(container);
			this.pushTable();

			return editor;
		},
		
		attachNumber: function(name, text, bounds, defaultValue, attrs) {
			if(bounds == undefined) {
				bounds = {min: 0};
			}
			
			var rnd = (Math.random()).toString().substring(2);
			var row = this.add("<label for=\"num"+rnd+"\" class='secretnoselect'>" +
				(text || utils.capitalize(name)) + "</label>"
			);
			
			var input = $("<input type='number'/>");
			input.attr("id", "num"+rnd);
			utils.applyAttrs(input, attrs);
			
			utils.attachInput(
				input, "value", this.object, name, undefined, undefined,
				defaultValue, parseInt
			);
			
			if(bounds.min) {
				input.attr("min", bounds.min);
			}
			if(bounds.max) {
				input.attr("max", bounds.max);
			}
			
			row.append($("<td></td>").append(input));
			
			return input;
		},
		
		attachSlider: function(name, text, bounds, defaultValue, scale, attrs) {
			let slider = utils.createSmartSlider(name, bounds.min, bounds.max, defaultValue, scale, text);
			$(slider.children).addClass('secretnoselect');
			let theSlider = slider.children[1];
			
			let row = this.add(slider.children[0]);
			let cell = $("<td></td>");
			
			while(slider.children.length > 0) {
				cell.append(slider.children[0]);
			}
			row.append(cell);
			
			utils.attachInput(
				theSlider, "value", this.object, name, undefined, undefined,
				defaultValue, parseInt
			);
			
			return $(theSlider);
		},
		
		//Creates an attached selection input for an attribute in object
		attachSelection: function(name, text, values, trackSettingsValue, attrs) {
			var rnd = (Math.random()).toString().substr(2);
			var row = this.add("<label for=\"select"+rnd+"\">" +
				(text || utils.capitalize(name)) + "</label>"
			).addClass('secretnoselect');
			
			let defaultSelected = 0;
			if(this.object[name] !== undefined) {
				defaultSelected = this.object[name]
			}
			else {
				this.object[name] = defaultSelected;
			}
			defaultSelected = values[defaultSelected];
			
			var select = $(utils.createSmartSelection(name, values, defaultSelected)).children().last();
			select.attr("id", "select"+rnd);
			utils.applyAttrs(select, attrs);
			
			row.append($("<td></td>").append(select));
			
			select = select[0]; // At this point, it's better to use the HTMLElement than the jQuery object
			
			if(trackSettingsValue) {
				var check = (value, firstTime) => {
					if(!document.getElementById("select"+rnd) && !firstTime) {
						//The select input has been removed; remove the tracker
						return true;
					}
					
					var currentValue = select.options[select.selectedIndex].value;
					var values = value.split(",");
					
					while(select.options.length) {
						select.remove(0);
					}
					
					values.forEach((value) => {
						var opt = document.createElement("option");
						opt.text = utils.capitalize(value);
						opt.value = value;
						
						select.add(opt);
					});
					
					var newIndex = values.indexOf(currentValue);
					if(newIndex != -1) {
						select.selectedIndex = newIndex;
					}
				};
				
				check(UI.settings.get(trackSettingsValue), true);
				
				UI.settings.addTracker(trackSettingsValue, check);
			}
			
			utils.attachInput(select, (select, set) => {
				if(set !== undefined) {
					let i = set;
					
					if(typeof set === "string") {
						for(i = 0; i < select.options.length; i++) {
							if(select.options[i].value == set) {
								break;
							}
						}
						
						if(i >= select.options.length) {
							i = 0;
						}
					}
					
					select.selectedIndex = i;
					return;
				}
				
				return select.selectedIndex;
			}, this.object, name, undefined, "onchange");
			
			return $(select);
		},
		
		attachParagraph: function(text) {
			let p = $("<p></p>").text(text);
			this.add(p);
			
			return p;
		},
		
		attachList: function(property, constructItem, attributes) {
			/* Adds a list to the EditorFactory. Lists use their constructor and event subscription to define their functionality. */
			if(this.object[property] === undefined) {
				this.object[property] = [];
			}
			
			attributes = attributes || {};
			let list = $("<div class='editorlist'></div>");
			let itemHolder = $("<div class='editoritemholder'></div>").appendTo(list);
			let controls = $("<div class='editorcontrols editorevents'></div>")
				.append(
					$("<a class='editorbutton addbutton editorevents'></a>")
						.click(function() {
							if($(this).attr("disabled")) return;
							addItem();
						}).on("checkdisabled", function() {
							if($(itemHolder).children().length >= attributes.max) {
								$(this).attr("disabled", true);
							}
							else {
								$(this).removeAttr("disabled");
							}
						})
				);
			
			let updateButtons = () => {
				list.find(".editorevents").trigger("checkdisabled");
			};
			
			let addItem = (i, object) => {
				i = i || itemHolder.children().length;
				if(attributes.max && i >= attributes.max) return;
				
				let wrapper = $("<table class='editoritem'></table>");
				let returnedItem = constructItem(i, object);
				let returnedObject = null;
				if(returnedItem.object !== undefined) {
					returnedObject = returnedItem.object;
					returnedItem = returnedItem.element;
				}
				
				if(this.object[property].indexOf(returnedObject) == -1) {
					this.object[property].push(returnedObject);
				}
				
				let checkDisabled = function() {
					if($(returnedItem).find(".unremovable").length > 0 || (attributes.min && itemHolder.children().length == attributes.min)) {
						$(this).attr("disabled", true);
					}
					else {
						$(this).removeAttr("disabled");
					}
				};
				let self = this; // Eh
				
				let removeButton = $("<a class='editorbutton removebutton editorevents'></a>")
					.on("checkdisabled", checkDisabled)
					.click(function() {
						if($(this).attr("disabled")) return;
						checkDisabled();

						let after = [];
						
						$(returnedItem).find(".editorevents").trigger("removed", after.push.bind(after));
						wrapper.remove();
						self.object[property].splice(self.object[property].indexOf(returnedObject));
						
						updateButtons();

						after.forEach((callback) => {
							callback();
						});
					});
				
				checkDisabled = checkDisabled.bind(removeButton);
				
				wrapper.append(removeButton);
				wrapper.append(returnedItem);
				
				returnedItem.wrap("<tr><td></td></tr>");
				
				itemHolder.append(wrapper);
				updateButtons();
			};
			
			let i = 0;
			this.object[property].forEach((item) => {
				addItem(i, item);
				i++;
			});
			
			for(; i < (attributes.min || 0); i++) {
				addItem(i);
			}
			
			list.append(controls);
			
			// I'm still not sure if I want this to be part of a table or its own thing, although I'm leaning towards the latter
			//this.add(list);
			this.fragments.push(list);
			this.pushTable();
			
			return itemHolder;
		},
		
		attachCheckbox: function(property, title, current) {
			current = current === undefined ? false : current;
			if(this.object[current] !== undefined) current = this.object[current];
			let holder = utils.createSmartBooleanInput(property, current, title);
			
			let label = $(holder.children[0]);
			let checkbox = $(holder.children[1]);
			let row = this.add(label);
			
			utils.attachInput(
				checkbox, "checked", this.object, property, undefined, undefined,
				current, undefined
			);
			
			row.append(
				$("<td></td>").append(checkbox)
			);
			
			return checkbox;
		},
		
		attachStandalone: function(element) {
			this.fragments.push(element);
			this.pushTable();
		},
		
		removeEmptyTables: function() {
			this.fragments = this.fragments.filter((item) => {
				if($(item).hasClass("editortable") && $(item).children().length == 0) {
					return false;
				}
				
				return true;
			});
		},
		
		create: function() {
			// Creates the final table element from the container. Should only be called once per factory.
			this.removeEmptyTables();
			
			this.container.append(this.fragments);
			return this.container;
		},
		
		createHorizontal: function() {
			// Creates the final table element, but instead adds all elements to the same row.
			
			let oneRow = $("<tr></tr>").appendTo(this.container);
			
			this.fragments.forEach((fragment) => {
				if($(fragment).prop("tagName") == "table") {
					$(fragment).children("tr").children("td").appendTo(oneRow);
				}
				else {
					$(fragment).appendTo(oneRow);
				}
			});
			
			return this.container.css("display", "inline");
		},
		
		createTableOfContents: function() {
			let toc = $("<div class='tableOfContents'></div>");
			toc.append($("<p>Table of Contents</p>").css("font-weight", "bold").css("font-size", "15px"));
			let topList = $("<ul></ul>").appendTo(toc);
			let curList = topList;
			let level = 0;
			
			for(let i = 0; i < this.sections.length; i++) {
				let thisLevel = parseInt(this.sections[i].importance.substring(1)) - 1;
				while(thisLevel < level) {
					curList = curList.parent();
					level--;
				}
				while(thisLevel > level) {
					curList = $("<ul></ul>").appendTo(curList);
					level++;
				}
				
				$("<a class='tocItem'></a>").attr("href", "#" + this.sectionAnchors[i]).text(this.sections[i].heading).appendTo($("<li></li>").appendTo(curList));
			}
			
			return toc.append(topList);
		}
	};
	
	/* Floating element windows */
	UI.ElementWindow = function(elem, title, buttons) {
		if(elem instanceof window.jQuery) {
			elem = elem[0];
		}
		
		this.container = document.createElement("div");
		this.container.className = "jswindow";
		this.container.style.top = "10px";
		this.container.style.left = "10px";
		this.moveable = true;
		this.buttonSettings = buttons || {};
		this.buttons = [];
		this.exitHooks = [];
		this.title = title;
		this.hidden = true;
		this.minimized = false;
		this.installTitlebar();
		this.installElement(elem);
		this.registerListeners();
		this.onReady();
	}
	
	UI.ElementWindow.prototype = {
		show: function() {
			if(this.hidden) {
				this.container.style.top = (window.scrollY + 10).toString() + "px";
				this.container.style.left = (window.scrollX + 10).toString() + "px";
				
				document.body.appendChild(this.container);
				this.hidden = false;
			}
			this.onShown();
			return this;
		},
		
		hide: function() {
			if(!this.hidden) {
				document.body.removeChild(this.container);
				this.hidden = true;
			}
			this.onHidden();
			return this;
		},
		
		close: function() {
			for(var i = 0; i < this.exitHooks.length; i++) {
				if(this.exitHooks[i](this)) //If it's true, cancel the exit
					return;
			}
			this.hide();
			return this;
		},
		
		addExitHook: function(hook) {
			this.exitHooks.push(hook);
			return this;
		},
		
		removeExitHook: function(hook) {
			this.exitHooks.remove(hook);
			return this;
		},
		
		installTitlebar: function() {
			var titlebar = document.createElement("div");
			titlebar.className = "titlebar";
			titlebar.innerHTML = "<p class=\"titlebartitle\"></p>";
			titlebar.firstChild.innerHTML = this.title;
			
			var mouseUpHandler, dragHandler;
			
			//Dragability taken from https://www.w3schools.com/howto/howto_js_draggable.asp
			var offsetX, offsetY;
			$(titlebar).on("dblclick", (evt) => {
				this.toggleMinimized();
			});
			$(titlebar).on("mousedown", (evt) => {
				evt.preventDefault(); //Prevent the default action for a click
				
				if(!this.moveable) return;
				
				offsetX = evt.clientX;
				offsetY = evt.clientY;
				
				//Register the handlers with the document so even if the element loses tracking, it'll still deregister the events
				$(document).on("mouseup", mouseUpHandler);
				$(document).on("mousemove", dragHandler);
			});
			
			mouseUpHandler = (evt) => {
				$(document).off("mouseup", mouseUpHandler);
				$(document).off("mousemove", dragHandler);
			}
			
			dragHandler = (evt) => {
				evt.preventDefault();
				
				var x = offsetX - evt.clientX;
				var y = offsetY - evt.clientY;
				
				//Reset the "origin" for future movement calculations
				offsetX = evt.clientX;
				offsetY = evt.clientY;
				
				this.container.style.left = (this.container.offsetLeft - x) + "px";
				this.container.style.top = (this.container.offsetTop - y) + "px";
			}
			
			this.titlebar = titlebar;
			this.installButtons();
			this.container.appendChild(this.titlebar);
		},
		
		installButtons: function() {
			if(this.buttonSettings["x"] != false) {
				//If x isn't disabled
				var x = document.createElement("a");
				//x.innerHTML = "X";
				x.className = "button xbutton";
				// x.href = "#";
				
				$(x).on("click", (e) => {
					utils.disableEvent(e);
					this.close();
				});
				
				x.onmousedown = utils.disableEvent
				x.onmouseup = utils.disableEvent
				
				this.buttons.push(x);
				
				this.titlebar.appendChild(x);
			}
		},
		
		installElement: function(elem) {
			if(!elem) {
				//The elem is going to be installed later
				return;
			}
			
			var div = document.createElement("div");
			div.className = "windowcontent";
			div.appendChild(elem);
			
			this.container.appendChild(div);
			
			this._windowcontent = div
			this.innerElement = elem;
		},
		
		getContainer: function() {
			return this.container;
		},
		
		onReady: function() {
			//Called when the window has been constructed
		},
		
		onShown: function() {
			//Called when the window has been shown
		},
		
		onHidden: function() {
			//Called when the window has been hidden
		},
		
		registerListeners: function() {
			$(this.container).on("mousedown", (evt) => {
				var windows = document.getElementsByClassName("jswindow");
				var highestIndex = 0;
				var zI;
				for(var i = 0; i < windows.length; i++) {
					//I have to use jQuery here because for some reason, in .style, the zIndex property
					//hasn't been set correctly, even though it's been calculated.
					//It could be that .style only contains styles that affect that immediate element
					zI = parseInt($(windows[i]).css("z-index"));
					if(zI > highestIndex && windows[i] != this.container) {
						highestIndex = zI;
					}
				}
				if(highestIndex > 0) {
					this.container.style.zIndex = highestIndex + 1;
				}
			});
		},
		
		minimize: function() {
			if(!this.minimized) {
				this.minimized = true;
				
				this.container.removeChild(this.container.lastChild); // The windowcontent should be the last child
			}
			return this;
		},
		
		maximize: function() {
			if(this.minimized) {
				this.minimized = false;
				
				this.container.appendChild(this._windowcontent);
			}
			return this;
		},
		
		toggleMinimized: function() {
			if(!UI.settings.get("canToggleMinimized")) return this;
			(this.minimized ? this.maximize : this.minimize).apply(this);
			return this;
		}
	}

	let UIgreyOut = () => {
		if($('#greyout').length == 0) {
			$("<div id='greyout'></div>")
				.css({
					"position": "fixed",
					"top": "0",
					"left": "0",
					"width": "100%",
					"height": "100%",
					"background-color": "black",
					"opacity": "0.5",
					"z-index": "9999"
				})
				.appendTo($("body"));
		}
	};

	let UIunGreyOut = () => {
		$('#greyout').remove();
	};
	
	UI.AlertWindow = function(elem, title, buttons) {
		UI.ElementWindow.call(this, elem, title, buttons);
	}
	
	UI.AlertWindow.prototype = {
		onReady: function() {
			this.moveable = false;
			
			//Center the element using magic
			this.container.style.left = "50%";
			this.container.style.top = "50%";
			this.container.style.transform = "translate(-50%, -50%)";
		},
		
		show: function() {
			if(this.hidden) {
				document.body.appendChild(this.container);
				this.hidden = false;
			}
			this.onShown();
			return this;
		},
		
		onShown: function() {
			UIgreyOut();
		},
		
		onHidden: function() {
			UIunGreyOut();
		}
	};
	
	utils.extend(UI.AlertWindow, UI.ElementWindow);
	
	UI.IFrameWindow = function(url, size, title, buttons) {
		var elem = document.createElement("iframe");
		elem.src = url;
		elem.className = "windowiframe"
		elem.setAttribute("frameborder", "0");
		if(size) {
			elem.style.width = size+"px";
			elem.style.height = size+"px";
		}
		
		this.iframe = elem;
		UI.ElementWindow.call(this, elem, title, buttons);
		
		this.addExitHook(this._close);
	}
	
	UI.IFrameWindow.prototype = {
		_close: function(win) {
			if(win.iframe.contentWindow) win.iframe.contentWindow.close();
		}
	};
	
	utils.extend(UI.IFrameWindow, UI.ElementWindow);
	
	UI.iFrameWindow = UI.IFrameWindow;
	UI.IframeWindow = UI.IFrameWindow;
	
	UI.DocumentWindow = function(documentId, documentName, owner, addDeleteBtn) {
		this.documentId = documentId;
		this.documentName = documentName;
		this.owner = owner;
		
		UI.IFrameWindow.call(this, "https://docs.google.com/document/d/"+documentId+"/edit?rm=minimal", UI.settings.get("documentWindowSizePixels"), "Editing "+documentName);
		
		if(addDeleteBtn || addDeleteBtn == undefined) this.addDeleteButton();
	}
	
	UI.DocumentWindow.prototype = {
		addDeleteButton: function() {
			var d = document.createElement("img");
			d.src = "images/delete-forever.svg"; //NOTE: USED MATERIAL.IO ICON; NEED TO DISTRIBUTE LICENSE WITH FINAL VERSION
			d.className = "button";
			
			$(d).on("click", (e) => {
				e.stopPropagation();
				
				var type = "locale";
				if(this.owner instanceof UI.NPC) type = "npc";
				if(this.owner instanceof UI.Building) type = "building";
				
				UI.api.deleteFile({id: this.documentId, type: type}, (err, doc) => {
					if(!err && doc) {
						delete this.owner.documents[this.documentId]; //Shouldn't need to save this, since the web server does it for us on its end
						this.close();
					}
				});
			});
			
			d.onmousedown = utils.disableEvent
			d.onmouseup = utils.disableEvent
			
			this.buttons.push(d);
			
			this.titlebar.appendChild(d);
		}
	};
	
	utils.extend(UI.DocumentWindow, UI.IFrameWindow);
	
	UI.createSettingsWindow = () => {
		var fragment = document.createDocumentFragment();
		
		var settings = [];
		var name;
		var keys = Object.keys(UI.settings.fields);
		var tr;
		for(var i = 0; i < keys.length; i++) {
			name = keys[i];
			var field = UI.settings.fields[name];
			var value = UI.settings.get(name);
			if(value === null || value === undefined) {
				value = field.value;
			}
			
			var element;
			if(field.type == "number") {
				var min = field.min;
				var max = field.max;
				if(field.scale != undefined) {
					min *= field.scale;
					max *= field.scale;
					value *= field.scale;
				}
				element = utils.createSmartSlider(name, min, max, value, field.scale);
			}
			else if(field.type == "string") {
				element = utils.createSmartTextInput(name, value);
			}
			else if(field.type == "boolean") {
				element = utils.createSmartBooleanInput(name, value);
			}
			else if(field.type == "select") {
				element = utils.createSmartSelection(name, field.values, value);
			}
			else {
				console.log("WARNING: Unsupported field type "+field.type);
				continue;
			}
			
			tr = document.createElement("tr");
			tr.innerHTML = "<td></td><td></td>";
			tr.firstChild.appendChild(element.firstChild);
			
			while(element.children.length) {
				tr.lastChild.appendChild(element.firstChild);
			}
			
			settings.push(element);
			fragment.appendChild(tr);
			//fragment.appendChild(document.createElement("br"));
		}
		
		var win;
		
		var statusText = document.createElement("p");
		statusText.style.fontWeight = "bold";
		statusText.style.fontStyle = "italic";
		
		var save = document.createElement("input");
		save.type = "button";
		save.value = "Save Settings";
		save.style.margin = "auto";
		save.onclick = function(evt) {
			var val, input;
			var elements = win.container.getElementsByClassName("settingsinput");
			for(var i = 0; i < elements.length; i++) {
				input = elements[i];
				val = input.value;
				
				if(input.type == "checkbox" || input.type == "radio")
					val = input.checked;
				if(input.tagName.toLowerCase() == "select")
					val = input.options[input.selectedIndex].name;
				
				var scale = input.getAttribute("scale");
				if(scale) {
					val = parseFloat(val) / parseFloat(scale);
				}
				
				UI.settings.set(input.getAttribute("name"), val);
			}
			
			UI.settings.commit(function(err, s) {
				if(err) {
					statusText.style.color = "red";
					statusText.innerHTML = "Failed to save: "+err;
				}
				else {
					statusText.style.color = "green";
					statusText.innerHTML = "Successfully saved";
				}
				
				utils.clearIn(4000, statusText);
			});
		}
		fragment.appendChild(save);
		
		fragment.appendChild(statusText);
		
		var table = document.createElement("table");
		table.appendChild(fragment);
		
		win = new UI.ElementWindow(table, "Settings");
		return win;
	};
	
	// TODO: Hover-over
	UI.addHoverInfo = (anchor, hoverElement) => {
		if(typeof hoverElement === "string") {
			hoverElement = $("<p></p>").text(hoverElement);
		}
		
		hoverElement = $("<div class='hoverinfo secretnoselect'></div>").append(hoverElement);
		
		$(anchor).hover(() => {
			$(anchor).append(hoverElement);
		}, () => {
			$(hoverElement).remove()
		}).find("*").css("cursor", "help");
		
		// A hack to prevent the hover from staying if they somehow get the mouse ONTO it
		$(hoverElement).hover(() => {
			$(hoverElement).remove();
		}, () => (undefined));
		
		return anchor;
	};
})()