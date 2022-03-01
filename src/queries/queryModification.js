const queryModification = proteinId => ({
	from: 'Protein',
	select: [
		'primaryAccession',
		'modifications.position',
		'modifications.type',
		'modifications.dataSets.name'
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
			.records(queryModification(proteinId))
			.then(data => {
				if (data.length) resolve(data[0]);
				else reject('No modification data.');
			})
			.catch(reject);
	});
}

module.exports = queryData;
