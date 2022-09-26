const mongoose = require("mongoose");

module.exports = new mongoose.Schema({
    ops: [{
        delete: {
            type: Number,
            required: false
        },

        retain: {
            type: Number,
            required: false
        },

        insert: {
            type: String,
            required: false
        },

        attributes: {
            background: {
                type: String,
                required: false
            },

            bold: {
                type: Boolean,
                required: false
            },

            italic: {
                type: Boolean,
                required: false
            },

            strike: {
                type: Boolean,
                required: false
            },

            color: {
                type: String,
                required: false
            },

            font: {
                type: String,
                required: false
            },

            "code-block": {
                type: Boolean,
                required: false
            },

            link: {
                type: String,
                required: false
            },

            size: {
                type: String,
                required: false
            },

            script: {
                type: String,
                required: false
            },

            header: {
                type: Number,
                required: false
            },

            image: {
                type: String,
                required: false
            },

            blockquote: {
                type: Boolean,
                required: false
            },

            direction: {
                type: String,
                required: false
            },

            list: {
                type: String,
                required: false
            },

            align: {
                type: String,
                required: false
            }
        }
    }]
}, {strict: true});