const got = require("got")
const cheerio = require("cheerio");

const baseURL = "https://www.olx.ba/pretraga?trazilica=";


async function simpleSearch(searchTerm){

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


async function getIDS (searchTerm) {

	let page=1;
	console.log("getting item ids");
	const itemIDS = [];
	
	let search=true;

	while(search===true){

	const fullURL = `${baseURL}${searchTerm}&stranica=${page}`;
	const data = await got(`${fullURL}`);
	const html = await data.body;
	const $ = cheerio.load(html);
		if($('div.artikal:has(>a)').length){

			$('div.artikal:has(>a)').each(function(i,element){
				$element = $(element);
				$link = $element.find('a');
				const ID = $link.attr('href').match(/artikal\/(.*?)\//)[1];
				itemIDS.push(ID);

			});
			page++;
		} else {
			console.log(`succesfully got ${itemIDS.length}`);
			search=false;
		}

	}

	return itemIDS;
}

async function getData (id){
	
	try {

	const fullURL = `https://www.olx.ba/artikal/${id}`;
	const data = await got(`${fullURL}`);
	const html = await data.body;
	const $ = cheerio.load(html);


	const title = $('#naslovartikla');
	const price = $('.mobile-cijena p:has(>span.markadesno)');

	const itemData = {
		"Naslov": `${title.text().trim()}`,
		"Cijena": `${price.text().trim()}`
	};

	$('div.df').each(function(i,element){
		$element = $(element);
		$title = $element.find('.df1').text().trim();
		$value = $element.find('.df2').text().trim();
		if($title!==false){
			itemData[$title]=`${$value}`;
		} 
	})
	
	return itemData;

	} catch(err) {
		console.log(err);
	}
}


//async function fullSearch (searchTerm){
//	
//	let results=[];
//	let page = 1;
//
//
//
//	async function bla(){
//		const ids = await getIDS(searchTerm);
//		await ids.forEach(async(id)=>{
//			const item = await getData(id);
//			results.push(item);
//		})
//		return results;
//	}
//
//	bla().then((thing)=>{console.log(results)});
//
//	
//}

module.exports = {
	getIDS,
	getData,
	simpleSearch
};
