const mongoose = require("mongoose"),
	  CharacterSheetSchema = require("./characterSheetSchema")

module.exports = mongoose.model("characterSheet", CharacterSheetSchema);