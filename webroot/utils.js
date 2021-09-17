/*

MIT License

Copyright (c) 2020 Anthony Maranto

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

((window) => {
	window.utils = {};
	var utils = window.utils;
	
	// General utilities
	
	if(Object.values == undefined) {
		Object.values = function(obj) {
			var vals = [];
			var keys = Object.keys(obj);
			for(var i = 0; i < keys.length; i++) {
				vals.push(obj[keys[i]]);
			}
			return vals;
		}
	}
	
	//Install a random choice function in the Array prototype
	Array.prototype.random = function() {
		return this[Math.floor(this.length * Math.random())];
	}
	
	//Add a convenience remove function to arrays
	Array.prototype.remove = function(value) {
		for(var i = 0; i < this.length; i++) {
			if(this[i] == value)
			{
				this.splice(i, 1);
				return;
			}
		}
	}
	
	utils.weakExtend = (a, b) => {
		var keys = Object.keys(b);
		for(var i = 0; i < keys.length; i++) {
			if(a[keys[i]] == undefined) {
				a[keys[i]] = b[keys[i]];
			}
		}
		return a;
	}
	
	utils.extend = (childProto, parentProto) => {
		if(childProto.prototype)
			childProto = childProto.prototype
		if(parentProto.prototype)
			parentProto = parentProto.prototype
		childProto.super = parentProto;
		utils.weakExtend(childProto, parentProto);
		return childProto;
	}
	
	utils.strongExtend = (a, b) => {
		var keys = Object.keys(b);
		for(var i = 0; i < keys.length; i++) {
			a[keys[i]] = b[keys[i]];
		}
		return a;
	}
	
	//A way of getting around the fact that Boolean([]) is true
	utils.isNotEmpty = (obj) => {
		return ((typeof obj == "object" && obj != null) ? obj.length : false);
	}
	
	//Wraps an element inside another element and returns the container
	utils.wrapElementIn = (container, elem) => {
		if(container != undefined && elem == undefined) {
			elem = container;
			container = "div";
		}
		
		container = document.createElement(container);
		container.appendChild(elem);
		
		return container;
	}
	
	//Helpful color functions
	utils.colorShift = (color1, color2, percent) => {
		return [color1[0] + (color2[0]-color1[0]) * percent,
			    color1[1] + (color2[1]-color1[1]) * percent,
				color1[2] + (color2[2]-color1[2]) * percent];
	}
	
	//Clears an element's innerHTML in X ms
	utils.clearIn = (time, element) => {
		return setTimeout(() => {
			element.innerHTML = "";
		}, time);
	}
	
	//Capitalizes and formats text in a human-readable manner
	let capitalSplitter = /^.+(?=[A-Z]|\s)/;
	utils.capitalize = (s) => {
		let words = [];
		
		let match, word;
		while(true) {
			match = s.match(capitalSplitter);
			if(match == null) break;
			match = match[0];
			
			word = s.substring(match.length);
			s = match;
			
			if(word.replace(" ", "").length > 0) words.push(word);
		}
		
		if(s.replace(" ", "").length > 0) words.push(s);
		
		words = words.reverse();
		
		for(let i = 0; i < words.length; i++) {
			words[i] = words[i].charAt(0).toUpperCase() + words[i].substring(1);
		}
		
		return words.join(" ");
	}
	
	utils.listToText = (l) => {
		let start = l.slice(0, l.length-1).join(", ");
		
		if(start) {
			start += ", and ";
		}
		
		start += l[l.length-1];
		return start;
	}
	
	utils.identity = (a) => { return a; }
	
	//A helper function that makes a text-based element editable by double clicking it
	utils.makeEditable = (element, callback, fixInput, autoSelect, make, addTitleInstructions) => {
		if(fixInput == undefined) fixInput = identity;
		if(autoSelect == undefined) autoSelect = true;
		
		if(addTitleInstructions != false) {
			if(!element.hasAttribute("title") || addTitleInstructions) {
				element.setAttribute("title", "Double click to edit");
			}
		}
		
		var input, originalInput;
		var handleRestore = (evt) => {
			if(evt && evt.target == input) {
				return;
			}
			
			$(document).off("click", handleRestore);
			disableEvent(evt); //Optional; makes it easier to click out of a thing without activating something else
			
			element.textContent = input.value;
			$(input).replaceWith(element);
			
			if(callback.apply(element, [input.value]) == false) {
				//If it specifically returns false, the setting failed
				element.textContent = originalInput;
			}
		}
		
		//We can't use jQuery here because its system would remove our handler when the element leaves the page
		element.addEventListener("dblclick", (evt) => {
			if(input == undefined) {
				input = document.createElement("input");
				input.type = "text";
				input.style.width = "100%";
				//Set class name, etc...
				
				input.addEventListener("keyup", (kevt) => {
					if(kevt.keyCode == 13) { //If enter is pressed
						handleRestore(null);
					}
				});
				
				input.value = element.textContent;
				originalInput = element.textContent; //Used in case the setting fails
				
				input = fixInput(input);
			}
			
			$(document).on("click", handleRestore);
			
			$(element).replaceWith(input);
			
			if(autoSelect) {
				input.setSelectionRange(0, input.value.length);
				input.focus();
			}
		});
		
		return element;
	}
	
	//Attaches an input element to a javascript value, with an optional callback
	utils.attachInput = (inputElement, value, object, key, callback, event, defaultValue, cast) =>{
		if(value == undefined) value = "value";
		if(event == undefined) event = "oninput";
		if(object[key] != undefined) defaultValue = object[key]; //Now, defaultValue is only used if object[key] is undefined
		if(cast == undefined) cast = utils.identity;
		
		//Try to set the initial value for the input to the current object value
		if(defaultValue !== undefined) {
			if(typeof value == "function") value(inputElement, defaultValue);
			else $(inputElement).prop(value, defaultValue).trigger("input");
			if(object[key] === undefined) object[key] = defaultValue;
		}
		
		if(event.startsWith("on")) event = event.substring(2);
		
		$(inputElement).on(event, (evt) => {
			var newValue;
			if(typeof value == "function") newValue = value(inputElement);
			else newValue = $(inputElement).prop(value);
			
			newValue = cast(newValue); //Cast to the correct type
			
			if(newValue != object[key]) {
				var oldValue = object[key];
				object[key] = newValue;
				if(callback) callback(newValue, oldValue);
			}
		});
	}
	
	//Arithmetic helpers
	utils.sumArray = (array, get) => {
		if(get == undefined) {
			get = identity;
		}
		
		var _s = 0;
		array.forEach((a) => {
			_s += get(a);
		});
		
		return _s;
	}
	
	//Applies a list of attributes to an element
	utils.applyAttrs = (element, attrs) => {
		if(!element || !attrs) {
			return;
		}
		
		Object.keys(attrs).forEach((key) => {
			if(element instanceof jQuery) {
				element.attr(key, attrs[key]);
			}
			else {
				element.setAttribute(key, attrs[key]);
			}
		});
	}
	
	utils.greyOut = () => {
		document.getElementById("container").classList.add("greyout");
	}
	utils.unGreyOut = () => {
		document.getElementById("container").classList.remove("greyout");
	}
	
	var cookie = {};
	utils.cookie = cookie;
	
	cookie.set = function(key, value, maxAge) {
		//console.log(key + " = " + value);
		
		key = encodeURIComponent(key);
		var expiryString = "";
		if(maxAge == undefined) {
			maxAge = 10 * 365 * 24 * 60 * 60 * 1000; //10 years in the future should be far enough
		}
		if(maxAge != null) {
			var expiryDate = new Date();
			expiryDate.setTime(expiryDate.getTime() + maxAge);
			expiryString = "; expires=" + expiryDate.toUTCString();
		}
		
		document.cookie = key + "=" + encodeURIComponent(value || "") + expiryString + "; path=/";
	}
	
	cookie.get = function(key) {
		key = encodeURIComponent(key);
		key = key + "=";
		var cookies = document.cookie.split(";");
		for(var i = 0; i < cookies.length; i++) {
			var cur = cookies[i].trim();
			while(cur.charAt(0) == " ") {
				cur = cur.substring(1);
			}
			if(cur.indexOf(key) == 0) {
				return decodeURIComponent(cur.substring(key.length, cur.length));
			}
		}
		
		return undefined;
	}
	
	cookie.has = function(key) {
		return cookie.get(key) != undefined;
	}
	
	cookie.delete = function(key) { //MAY NOT WORK
		document.cookie = key + "=; Max-Age=-99999999";
	}
	
	utils.updateCSSStyle = (selector, property, newValue, doAll) => {
		var done = 0;
		for(var sheet of document.styleSheets) {
			try {
				for(var rule of sheet.rules) {
					if(rule.type == 1) {
						if(rule.selectorText == selector) {
							rule.style.setProperty(property, newValue);
							if(!doAll) {
								return true;
							}
							done++;
						}
					}
				}
			}
			catch(e) {
				if(e.code != e.SECURITY_ERR) {
					throw e;
				}
			}
		}
		return done;
	}
	
	utils.createSmartSlider = (name, min, max, current, scale, labelText) => {
		var holder = document.createDocumentFragment();
		
		var label = document.createElement("label");
		label.className = "settingslabel";
		var sliderId = name;
		label.for = sliderId;
		label.innerHTML = labelText || utils.capitalize(name);
		
		if(min == null || max == null) {
			//Just create a normal number text input
			var input = document.createElement("input");
			input.type = "number";
			input.name = name;
			input.id = sliderId;
			if(min != null) input.min = min;
			if(max != null) input.max = max;
			input.value = current || min || 0;
			input.hint = labelText || utils.capitalize(name);
			input.className = "settingsinput";
			
			if(scale != undefined) input.setAttribute("scale", scale);
			
			holder.appendChild(label);
			holder.appendChild(input);
			
			return holder;
		}
		var value = document.createElement("span");
		var slider = document.createElement("input");
		slider.type = "range";
		slider.name = name;
		slider.id = sliderId;
		slider.min = min;
		slider.max = max;
		slider.value = current || min;
		slider.className = "settingsinput";
		$(slider).on("input", function(evt) {
			value.innerHTML = slider.value;
		});
		
		if(scale != undefined) slider.setAttribute("scale", scale);
		
		value.innerHTML = slider.value;
		
		holder.appendChild(label);
		holder.appendChild(slider);
		holder.appendChild(value);
		
		return holder;
	}
	
	utils.createSmartTextInput = (name, current, labelText) => {
		var holder = document.createDocumentFragment();
		
		var label = document.createElement("label");
		label.className = "settingslabel";
		var textId = name;
		label.for = textId;
		label.innerText = labelText || utils.capitalize(name);
		var input = document.createElement("input");
		input.type = "text";
		input.name = name;
		input.id = textId;
		input.value = current || "";
		input.hint = labelText || utils.capitalize(name);
		input.className = "settingsinput";
		
		holder.appendChild(label);
		holder.appendChild(input);
		
		return holder;
	}
	
	utils.createSmartBooleanInput = (name, current, labelText) => {
		var holder = document.createDocumentFragment();
		
		var label = document.createElement("label");
		label.className = "settingslabel";
		var boolId = name;
		label.for = boolId;
		label.innerText = labelText || utils.capitalize(name);
		var input = document.createElement("input");
		input.type = "checkbox";
		input.name = name;
		input.id = boolId;
		input.checked = current || false;
		input.className = "settingsinput";
		
		holder.appendChild(label);
		holder.appendChild(input);
		
		return holder;
	}
	
	utils.createSmartSelection = (name, options, value, labelText) => {
		var holder = document.createDocumentFragment();
		
		var label = document.createElement("label");
		label.className = "settingslabel";
		var selectId = name;
		label.for = selectId;
		label.innerText = labelText || utils.capitalize(name);
		var input = document.createElement("select");
		input.name = name;
		input.id = selectId;
		input.className = "settingsinput";
		
		var element;
		for(var i = 0; i < options.length; i++) {
			var option = options[i];
			element = document.createElement("option");
			
			element.name = option;
			element.innerText = utils.capitalize(option);
			
			if(option == value) {
				element.setAttribute("selected", "true");
			}
			
			input.appendChild(element);
		}
		
		holder.appendChild(label);
		holder.appendChild(input);
		
		return holder;
	}
	
	utils.attachSaving = (elem, delay) => {
		let e = elem;
		if(e instanceof DocumentFragment) {
			e = e.querySelector("input,select");
		}
		e = $(e);
		delay = delay || 1000;
		
		// Load saved value, if any
		let lastValue = utils.cookie.get(e.attr("name"));
		if(lastValue != undefined) {
			e.val(JSON.load(lastValue));
		}
		
		let lastTimeout = null;
		
		let saveElementData = () => {
			lastTimeout = null;
			
			utils.cookie.set(e.attr("name"), JSON.stringify(e.val()));
		};
		
		e.on("input change", () => {
			if(lastTimeout != null) {
				clearTimeout(lastTimeout);
			}
			
			lastTimeout = setTimeout(saveElementData, delay);
		});
		
		window.addEventListener("beforeunload", saveElementData);
		
		return elem;
	}
	
	utils.disableEvent = (evt) => {
		evt.stopPropagation();
	}
	
	utils.getParameters = () => {
		let params = {};
		
		window.location.search
			.substring(1)
			.split("&")
			.forEach((parameter) => {
				let eq = parameter.indexOf("=");
				if(eq == -1) return;
				params[parameter.substring(0, eq)] = parameter.substring(eq + 1);
			});
		
		return params;
	};
	
	if(this.exports) {
		this.exports = utils;
	}
})(this)