const queryUniprotFeature = proteinId => ({
	from: 'Protein',
	select: [
		'features.start',
		'features.end',
		'features.type',
		'features.description'
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
			.records(queryUniprotFeature(proteinId))
			.then(data => {
				if (data.length) resolve(data[0]);
				else reject('No feature data.');
			})
			.catch(reject);
	});
}

module.exports = queryData;
