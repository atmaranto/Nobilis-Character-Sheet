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

var validQueryPaths = {
    "additionalCPs.rawCPs": "number",
    "additionalCPs.cpSource": "string",
    "affiliation": "string",
    "anchors": "string",
    "aspect": "number",
    "bondAllocation": "string",
    "characterName": "string",
    "deadlyWounds": "number",
    "domain": "number",
    "domains.domain": "number",
    "domains.domainDescription": "string",
    "domains.estateProperties": "string",
    "gifts.giftAOEType": "number",
    "gifts.giftEstate": "string",
    "gifts.giftEstateType": "number",
    "gifts.giftFlexibility": "number",
    "gifts.giftInvocationType": "number",
    "gifts.giftName": "string",
    "gifts.isGiftRare": "boolean",
    "gifts.miracleLevel": "number",
    "hasPortrait": "boolean",
    "limits.cps": "number",
    "limits.description": "string",
    "limits.limitName": "string",
    "permanentAMP": "number",
    "permanentDMP": "number",
    "permanentRMP": "number",
    "permanentSMP": "number",
    "playerName": "string",
    "realm": "number",
    "restrictions.description": "string",
    "restrictions.mps": "number",
    "restrictions.restrictionName": "string",
    "riteOfHolyFire": "boolean",
    "seriousWounds": "number",
    "spirit": "number",
    "surfaceWounds": "number",
    "temporaryAMP": "number",
    "temporaryDMP": "number",
    "temporaryRMP": "number",
    "temporarySMP": "number",
    "virtues.description": "string",
    "virtues.virtueName": "string"
}

if(typeof module === "object") {
    module.exports = validQueryPaths;
}
