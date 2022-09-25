let constructReadQuery = (id, acct) => {
	let query = {
		uuid: id,
	};

	if(!acct || !acct.isAdmin) {
		query.$or = [{public: true}, {publicWritable: true}];

		if(acct) {
			query.$or.push({owner: acct._id});
			query.$or.push({
				sharedWith: {
					owner: acct._id
				}
			});
		}
	}

	return query;
}

let constructWriteQuery = (id, acct) => {
	let query = {
		uuid: id
	};

	if(!acct || !acct.isAdmin) {
		query.$or = [{publicWritable: true}];

		if(acct) {
			query.$or.push({owner: acct._id});
			query.$or.push({
				sharedWith: {
					owner: acct._id,
					permission: {
						$in: ["write", "owner"]
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
					owner: acct._id,
					permission: "owner"
				}
			}
		];
	}

	return query;
}

module.exports = {constructReadQuery, constructWriteQuery, constructDeleteQuery};