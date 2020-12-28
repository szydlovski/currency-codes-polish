const axios = require('axios');
const { JSDOM } = require('jsdom');
const fs = require('fs').promises;
const path = require('path');

async function build() {
	console.log('Scraping...');
	const scrapedDataEn = await scrapeData(
		'https://en.wikipedia.org/wiki/ISO_4217'
	);
	const scrapedDataPl = await scrapeData(
		'https://pl.wikipedia.org/wiki/ISO_4217'
	);
	const scrapedData = mergeScrapes(scrapedDataEn, scrapedDataPl);
	const { full, alpha, numeric } = dataVariants(scrapedData);
	console.log('Saving files...');
	for (const [filepath, data] of [
		['codes.json', JSON.stringify(full, null, 2)],
		['alpha/index.json', JSON.stringify(alpha, null, 2)],
		['numeric/index.json', JSON.stringify(numeric, null, 2)],
		['esm/index.js', esmify(JSON.stringify(full, null, 2))],
		['esm/alpha/index.js', esmify(JSON.stringify(alpha, null, 2))],
		['esm/numeric/index.js', esmify(JSON.stringify(numeric, null, 2))],
	]) {
		await fs.mkdir(path.dirname(filepath), { recursive: true });
		await fs.writeFile(filepath, data);
	}
	console.log('All done!');
}

function dataVariants(data) {
	const extract = (propName) =>
		data.map((entry) => ({
			name_pl: entry.name_pl,
			name_en: entry.name_en,
			minor: entry.minor,
			code: entry[propName],
		}));
	return {
		full: data,
		alpha: extract('alpha'),
		numeric: extract('numeric')
	};
}

function mergeScrapes(dataEn, dataPl) {
	return dataEn.map((entry) => {
		const entryPl = dataPl.find((entryPl) => entry.alpha === entryPl.alpha);
		const { alpha, numeric } = entry;
		return {
			alpha,
			numeric,
			name_en: entry.name,
			name_pl: entryPl.name,
		};
	}).filter(({alpha}) => alpha[0] !== 'X' || ['XAF', 'XCD', 'XOF', 'XPF'].includes(alpha));
}

async function scrapeData(targetUrl) {
	const pageHtml = await axios.get(targetUrl);
	const dom = new JSDOM(pageHtml.data);
	const dataTable = arrayify(
		dom.window.document.querySelectorAll(`.mw-parser-output table`)
	).find((table) =>
		arrayify(table.querySelectorAll(`tbody tr`)).find((row) => {
			const targetCell = row.querySelector('td:nth-child(1)');
			return (
				targetCell && targetCell.textContent.toLowerCase().trim() === 'aed'
			);
		})
	);
	return arrayify(dataTable.querySelectorAll('tr'))
		.slice(1)
		.map((row) => ({
			alpha: cleanString(row.children[0].textContent),
			numeric: cleanString(row.children[1].textContent),
			name: cleanString(row.children[3].textContent),
		}));
}

function cleanString(str) {
	return str.replace(/(\[.*\])/g, '').trim();
}

function esmify(code) {
	return `export default ${code}`;
}

function arrayify(value) {
	return Array.prototype.slice.call(value);
}

build();
