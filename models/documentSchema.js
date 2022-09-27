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