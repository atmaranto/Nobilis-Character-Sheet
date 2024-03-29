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

const mongoose = require("mongoose"),
      Boolean = mongoose.Schema.Types.Boolean,
	  documentSchema = require("./documentSchema.js");

module.exports = {
	playerName: {
		type: String,
		default: ""
	},

	hasPortrait: {
		type: Boolean,
		default: false
	},
	
	characterName: {
		type: String,
		default: ""
	},
	
	aspect: {
		type: Number,
		default: 0
	},
	
	domain: {
		type: Number,
		default: 0
	},
	
	realm: {
		type: Number,
		default: 0
	},
	
	spirit: {
		type: Number,
		default: 0
	},
	
	permanentAMP: {
		type: Number,
		default: 5
	},
	
	permanentDMP: {
		type: Number,
		default: 5
	},
	
	permanentRMP: {
		type: Number,
		default: 5
	},
	
	permanentSMP: {
		type: Number,
		default: 5
	},
	
	temporaryAMP: {
		type: Number,
		default: 5
	},
	
	temporaryDMP: {
		type: Number,
		default: 5
	},
	
	temporaryRMP: {
		type: Number,
		default: 5
	},
	
	temporarySMP: {
		type: Number,
		default: 5
	},
	
	domains: [{
		domain: {
			type: Number,
			default: 0,
			required: true
		},
		
		domainDescription: {
			type: String,
			default: ""
		},
		
		estateProperties: {
			type: documentSchema,
			default: () => {},
			required: true
		}
	}],
	
	surfaceWounds: {
		type: Number,
		default: 0
	},
	
	seriousWounds: {
		type: Number,
		default: 0
	},
	
	deadlyWounds: {
		type: Number,
		default: 0
	},
	
	gifts: [{
		miracleLevel: {
			type: Number,
			default: 0,
			required: true
		},
		
		isGiftRare: {
			type: Boolean,
			default: false,
			required: true
		},
		
		giftName: {
			type: String,
			default: ""
		},
		
		giftEstate: {
			type: String,
			default: ""
		},
		
		giftAOEType: {
			type: Number,
			default: 0,
			required: true
		},
		
		giftInvocationType: {
			type: Number,
			default: 0,
			required: true
		},
		
		giftFlexibility: {
			type: Number,
			default: 0,
			required: true
		},
		
		giftEstateType: {
			type: Number,
			default: 0,
			required: true
		},

		giftDescription: {
			type: documentSchema,
			default: () => {}
		}
	}],
	
	restrictions: [{
		restrictionName: {
			type: String,
			default: ""
		},
		
		description: {
			type: documentSchema,
			default: () => {},
			required: true
		},
		
		mps: {
			type: Number,
			default: 1,
			required: true
		}
	}],
	
	limits: [{
		limitName: {
			type: String,
			default: "",
			required: true
		},
		
		description: {
			type: documentSchema,
			default: () => {},
			required: true
		},
		
		cps: {
			type: Number,
			default: 1,
			required: true
		}
	}],
	
	virtues: [{
		virtueName: {
			type: String,
			default: ""
		},
		
		description: {
			type: documentSchema,
			default: () => {},
			required: true
		}
	}],
	
	affiliation: {
		type: Number,
		default: 0,
		min: 0
	},
	
	bondAllocation: {
		type: documentSchema,
		default: () => {}
	},
	
	anchors: {
		type: documentSchema,
		default: () => {}
	},
	
	riteOfHolyFire: {
		type: Boolean,
		default: false
	},
	
	additionalCPs: [{
		rawCPs: {
			type: String, // Apparently?
			default: "0"
		},
		
		cpSource: {
			type: documentSchema,
			default: () => {},
			required: true
		}
	}],

	chancelInformation: {
		type: documentSchema,
		default: () => {}
	},

	imperatorInformation: {
		type: documentSchema,
		default: () => {}
	},

	genericCharacterDetails: {
		type: documentSchema,
		default: () => {}
	},

	tempPermSync: {
		type: Boolean,
		default: false
	}
};
