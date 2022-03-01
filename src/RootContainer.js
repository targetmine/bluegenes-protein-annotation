import React from 'react';
import queryUniprotFeature from './queries/queryUniprotFeature';
import queryModification from './queries/queryModification';
import queryComment from './queries/queryComment';
import Loading from './loading';

const allowed_comment_types = [
	'similarity',
	'function',
	'tissue specificity',
	'subcellular location',
	'catalytic activity',
	'disease',
	'developmental stage',
	'pathway',
	'pharmaceutical'
];

const subsection_order = [
	'Molecule processing',
	'Regions',
	'Sites',
	'Amino acid modifications'
];

const type_order = [
	'initiator methionine',
	'signal peptide',
	'transit peptide',
	'propeptide',
	'chain',
	'peptide',
	'topological domain',
	'transmembrane region',
	'intramembrane region',
	'domain',
	'repeat',
	'calcium-binding region',
	'zinc finger region',
	'DNA-binding region',
	'nucleotide phosphate-binding region',
	'region of interest',
	'coiled-coil region',
	'short sequence motif',
	'compositionally biased region',
	'active site',
	'metal ion-binding site',
	'binding site',
	'site',
	'non-standard amino acid',
	'modified residue',
	'lipid moiety-binding region',
	'glycosylation site',
	'disulfide bond',
	'cross-link'
];

const subsection = {
	'initiator methionine': 'Molecule processing',
	'signal peptide': 'Molecule processing',
	'transit peptide': 'Molecule processing',
	propeptide: 'Molecule processing',
	chain: 'Molecule processing',
	peptide: 'Molecule processing',
	'topological domain': 'Regions',
	'transmembrane region': 'Regions',
	'intramembrane region': 'Regions',
	domain: 'Regions',
	repeat: 'Regions',
	'calcium-binding region': 'Regions',
	'zinc finger region': 'Regions',
	'DNA-binding region': 'Regions',
	'nucleotide phosphate-binding region': 'Regions',
	'region of interest': 'Regions',
	'coiled-coil region': 'Regions',
	'short sequence motif': 'Regions',
	'compositionally biased region': 'Regions',
	'active site': 'Sites',
	'metal ion-binding site': 'Sites',
	'binding site': 'Sites',
	site: 'Sites',
	'non-standard amino acid': 'Amino acid modifications',
	'modified residue': 'Amino acid modifications',
	'lipid moiety-binding region': 'Amino acid modifications',
	'glycosylation site': 'Amino acid modifications',
	'disulfide bond': 'Amino acid modifications',
	'cross-link': 'Amino acid modifications'
};

function sortByRegion(a, b) {
	const toa = type_order.indexOf(a.type);
	const tob = type_order.indexOf(b.type);
	if (toa === tob) {
		const sa = a.start;
		const sb = b.start;
		if (!sa) {
			return 1;
		}
		if (!sb) {
			return -1;
		}
		if (sa === sb) {
			const ea = a.end;
			const eb = b.end;
			if (!ea) {
				return 1;
			}
			if (!eb) {
				return -1;
			}
			return ea - eb;
		} else {
			sa - sb;
		}
	} else {
		return toa - tob;
	}
}

class RootContainer extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			comments: [],
			uniproFeatures: [],
			modifications: [],
			containPspData: ''
		};
	}

	componentDidMount() {
		queryComment(this.props.entity.Protein.value, this.props.serviceUrl)
			.then(res => {
				let commentSet = new Set(allowed_comment_types);
				const contents = [];
				res.comments.sort((a, b) => {
					var typeA = a.type.toUpperCase();
					var typeB = b.type.toUpperCase();
					if (typeA < typeB) {
						return -1;
					}
					if (typeA > typeB) {
						return 1;
					}
					return 0;
				});
				let count = 0;
				res.comments.forEach(comment => {
					if (commentSet.has(comment.type)) {
						contents.push(
							<tr className={count % 2 ? 'odd' : 'even'}>
								<td className="type">{comment.type}</td>
								<td>{comment.description}</td>
							</tr>
						);
						count++;
					}
				});

				let comments = [
					<thead key="comment_head">
						<tr>
							<th style={{ width: '180px' }}>Type</th>
							<th>Comment</th>
						</tr>
					</thead>,
					<tbody key="comment_body">{contents}</tbody>
				];
				this.setState({ comments: comments });
			})
			.catch(error => {
				this.setState({
					comments: [
						<tr key="commentsnd">
							<td className="noData">{error}</td>
						</tr>
					]
				});
			});

		queryUniprotFeature(this.props.entity.Protein.value, this.props.serviceUrl)
			.then(res => {
				const featureMap = {};
				res.features.forEach(feature => {
					const type = feature.type;
					const subs = subsection[type];
					if (featureMap[subs]) {
						featureMap[subs].push(feature);
					} else {
						featureMap[subs] = [feature];
					}
				});
				let keys = Object.keys(featureMap);
				keys.forEach(key => {
					featureMap[key].sort(sortByRegion);
				});

				const contents = [];
				subsection_order.forEach(subsection => {
					if (featureMap[subsection]) {
						contents.push(
							<tr>
								<th colSpan="4">{subsection}</th>
							</tr>
						);
						featureMap[subsection].forEach((feature, index) => {
							if (feature.start == feature.end) {
								contents.push(
									<tr className={index % 2 ? 'odd' : 'even'}>
										<td>{feature.start}</td>
										<td>1</td>
										<td className="type">{feature.type}</td>
										<td>{feature.description}</td>
									</tr>
								);
							} else {
								if (feature.type == 'disulfide bond') {
									contents.push(
										<tr className={index % 2 ? 'odd' : 'even'}>
											<td>
												{feature.start} &harr; {feature.end}
											</td>
											<td>&nbsp;</td>
											<td className="type">{feature.type}</td>
											<td>{feature.description}</td>
										</tr>
									);
								} else {
									contents.push(
										<tr className={index % 2 ? 'odd' : 'even'}>
											<td>
												{feature.start} - {feature.end}
											</td>
											<td>{feature.end - feature.start + 1}</td>
											<td className="type">{feature.type}</td>
											<td>{feature.description}</td>
										</tr>
									);
								}
							}
						});
					}
				});
				this.setState({ uniproFeatures: contents });
			})
			.catch(error => {
				this.setState({
					uniproFeatures: [
						<tr key="featuresnd">
							<td className="noData">{error}</td>
						</tr>
					]
				});
			});
		queryModification(this.props.entity.Protein.value, this.props.serviceUrl)
			.then(res => {
				let containPspData = false;
				let modificationMap = {};
				res.modifications.forEach(modification => {
					const type = modification.type;
					if (modificationMap[type]) {
						modificationMap[type].push(modification);
					} else {
						modificationMap[type] = [modification];
					}
					if (!containPspData) {
						modification.dataSets.forEach(ds => {
							if (ds.name == 'PhosphoSitePlus') {
								containPspData =
									'https://www.phosphosite.org/uniprotAccAction?id=' +
									res.primaryAccession;
								return true;
							}
						});
					}
				});

				let contents = [];
				let keys = Object.keys(modificationMap);
				keys.sort();
				keys.forEach((key, index) => {
					modificationMap[key].sort(sortByRegion);

					let allPositions = modificationMap[key]
						.map(modification => (
							<span
								key={modification.objectId}
								onClick={() => {
									this.props.navigate('report', {
										type: modification.class,
										id: modification.objectId
									});
								}}
							>
								{modification.position}
							</span>
						))
						.reduce((prev, curr) => [prev, ', ', curr]);

					contents.push(
						<tr className={index % 2 ? 'odd' : 'even'}>
							<td className="type">{key}</td>
							<td>{allPositions}</td>
						</tr>
					);
				});

				let modifications = [
					<thead key="modification_head">
						<tr>
							<th style={{ width: '180px' }}>Modification Type</th>
							<th>Positions</th>
						</tr>
					</thead>,
					<tbody key="modification_body">{contents}</tbody>
				];

				this.setState({
					modifications: modifications,
					containPspData: containPspData
				});
			})
			.catch(error => {
				this.setState({
					modifications: [
						<tr key="modificationsnd">
							<td className="noData">{error}</td>
						</tr>
					]
				});
			});
	}

	render() {
		return (
			<div className="rootContainer">
				<h2>Curated comments from UniProt</h2>
				<table className="annotationTable">
					{this.state.comments.length ? this.state.comments : <Loading />}
				</table>
				<h2>UniProt Features</h2>
				<table className="annotationTable">
					{this.state.uniproFeatures.length ? (
						this.state.uniproFeatures
					) : (
						<Loading />
					)}
				</table>
				<h2>Modifications</h2>
				<table className="annotationTable">
					{this.state.modifications.length ? (
						this.state.modifications
					) : (
						<Loading />
					)}
				</table>
				{this.state.containPspData ? (
					<div style={{ fontSize: '8px', margin: '12px 0px' }}>
						* Contains the data derived from{' '}
						<a
							href={this.state.containPspData}
							target="_blank"
							rel="noreferrer"
						>
							PhosphoSitePlus&reg; (PSP)
						</a>
						. The PSP data should not ues for commercial purpose.
					</div>
				) : (
					''
				)}
			</div>
		);
	}
}

export default RootContainer;
