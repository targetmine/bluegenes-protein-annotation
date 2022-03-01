const queryComment = proteinId => ({
	from: 'Protein',
	select: ['comments.description', 'comments.type'],
	orderBy: [
		{
			path: 'comments.type',
			direction: 'ASC'
		}
	],
	where: [
		{
			path: 'Protein.id',
			op: '=',
			value: proteinId
		}
	]
});

// eslint-disable-next-line
function queryData(proteinId, serviceUrl, imjsClient = imjs) {
	return new Promise((resolve, reject) => {
		const service = new imjsClient.Service({ root: serviceUrl });
		service
			.records(queryComment(proteinId))
			.then(data => {
				if (data.length) resolve(data[0]);
				else reject('No comment data.');
			})
			.catch(reject);
	});
}

module.exports = queryData;
