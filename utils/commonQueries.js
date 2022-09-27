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