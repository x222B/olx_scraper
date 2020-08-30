const got = require("got")
const cheerio = require("cheerio");

const baseURL = "https://www.olx.ba/pretraga?trazilica=";


async function miniSearch(searchTerm){

	const results = [];
	let page = 1;
	let search =true;

	while(search==true){

		const fullURL = `${baseURL}${searchTerm}&stranica=${page}`;
		const data = await got(`${fullURL}`);
		const html = await data.body;
		const $ = cheerio.load(html);

		if($('div.artikal:has(>a)').length){

			console.log(`Scraping '${searchTerm.replace(/\+/g," ")}' on page ${page}`);

			$('div.artikal:has(>a)').each(function(i,element){

				$element = $(element);
				$link = $element.find('a');
				$title = $link.find('p')
				$price = $element.find('div.datum span');
				$date = $element.find('div.datum div.kada');
				const ID = $link.attr('href').match(/artikal\/(.*?)\//)[1];
				const result = {
					title: `${$title.text()}`,
					price: `${$price.text()}`,
					dateAdded: `${$date.attr('title')}`,
					link: `${$link.attr('href')}`,
					olx_ID: `${ID}`
				}
				results.push(result);
			});
			page++;
		} else {
			console.log(`Successfully craped ${results.length} items.`); 
			search=false;
		}
	}
	return results;
};

module.exports = {
	miniSearch
};
