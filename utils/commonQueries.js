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

let constructReadQuery = (id, acct, includePublic) => {
	let query = {
		uuid: id,
	};

	if(!acct || !acct.isAdmin) {
		query.$or = [];

		if(includePublic !== false) {
			query.$or.push({public: true});
			query.$or.push({publicWritable: true});
		}

		if(acct) {
			query.$or.push({owner: acct._id});
			query.$or.push(
				{
					sharedWith: {
						$elemMatch: {
							user: acct._id,
						}
					}
				}
			);
		}
	}

	return query;
}

let constructWriteQuery = (id, acct, includePublic) => {
	let query = {
		uuid: id
	};

	if(!acct || !acct.isAdmin) {
		query.$or = [];

		if(includePublic !== false) {
			query.$or.push({publicWritable: true});
		}

		if(acct) {
			query.$or.push({owner: acct._id});
			query.$or.push({
				sharedWith: {
					$elemMatch: {
						user: acct._id,
						permission: {
							$in: ["write", "owner"]
						}
					}
				}
			});
		}
	}

	return query;
}

let constructDeleteQuery = (id, acct) => {
	let query = {
		uuid: id
	};

	if(!acct || !acct.isAdmin) {
		query.$or = [
			{owner: acct._id},
			{
				sharedWith: {
					$elemMatch: {
						user: acct._id,
						permission: "owner"
					}
				}
			}
		];
	}

	return query;
}

module.exports = {constructReadQuery, constructWriteQuery, constructDeleteQuery};