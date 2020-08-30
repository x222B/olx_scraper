const got = require("got")
const cheerio = require("cheerio");

const url = "https://www.olx.ba/pretraga?trazilica=";


async function getLinks(searchTerm){
	const items = [];
	const data = await got(`${url}${searchTerm}`);
	const html = await data.body;
	const $ = cheerio.load(html);
	$('div.artikal:has(>a)').each(function(i,element){
		$element = $(element);
		$link = $element.find('a');
		$title = $link.find('p')
		$price = $element.find('div.datum span')
		$date = $element.find('div.datum div.kada');
		const item = {
			title: `${$title.text()}`,
			price: `${$price.text()}`,
			dateAdded: `${$date.attr('title')}`,
			link: `${$link.attr('href')}`
		}
		items.push(item);
			
		//console.log("===============")
		//console.log($title.text());
		//console.log($link.attr('href'));
		//console.log($price.text());
		//console.log($date.attr('title'));
	});
	console.log(items);

};

getLinks("ruksak");
