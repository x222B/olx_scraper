const got = require("got")
const cheerio = require("cheerio");

const baseURL = "https://www.olx.ba/pretraga?trazilica=";

// Gets data that is available on the results page
async function simpleSearch(searchTerm){

	const results = [];
	let page = 1;
	let search = true;
    // Searches every page as long as there are results on the page
	while(search==true){

        // Loads the html into cheerio
		const fullURL = `${baseURL}${searchTerm}&stranica=${page}`;
		const data = await got(`${fullURL}`);
		const html = await data.body;
		const $ = cheerio.load(html);

        // Checks if there is content on the page
		if($('div.artikal:has(>a)').length){

			console.log(`Scraping '${searchTerm.replace(/\+/g," ")}' on page ${page}`);
            // Saves data from every element into array
			$('div.artikal:has(>a)').each((i,element)=>{

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
            // Go to next page
			page++;

		} else {
            // If there is not content on the page, stop
			console.log(`Successfully scraped ${results.length} items.`); 
			search=false;
		}
	}
	return results;
};

// Gets the OLX ID for every item
async function getIDS (searchTerm) {

	let page=1;
	console.log("Retrieving item IDs");
	const itemIDS = [];
	
	let search=true;
    // Searches every page that has content
	while(search===true){

        // Loads the html into cheerio
		const fullURL = `${baseURL}${searchTerm}&stranica=${page}`;
		const data = await got(`${fullURL}`);
		const html = await data.body;
		const $ = cheerio.load(html);
            // Cheks if the page has content
			if($('div.artikal:has(>a)').length){
				console.log(`Scraping page ${page}`)
				$('div.artikal:has(>a)').each(function(i,element){
					$element = $(element);
					$link = $element.find('a');
					const ID = $link.attr('href').match(/artikal\/(.*?)\//)[1];
					itemIDS.push(ID);
				});
				page++;
			} else {
				console.log(`Found ${itemIDS.length} items`);
				search=false;
			}
	}
	return itemIDS;
}

// Gets data for a given ID
async function getData (id){

	const fullURL = `https://www.olx.ba/artikal/${id}`;
	const data = await got(`${fullURL}`);
	const html = await data.body;
	const $ = cheerio.load(html);

	let itemData={};

	try{
		console.log(`Parsing data for [${id}]`)
		const title = $('#naslovartikla');
		const priceTitle = $('div#pc p.n');
		const priceValue = $('div#pc p.n + p');
	
		itemData = {
			"Naslov": `${title.text().trim()}`,
			"Cijena": `${priceValue.text().trim()}`
		}
	
		$('div#dodatnapolja1 div.df').each(function(i,element){
			$element = $(element);
			$title = $element.find(".df1").text();
			$value = $element.find(".df2").text();
			if($value==''){
				$value="DA";
			}
			itemData[$title]=`${$value}`;
		})

	} catch(err){
		console.log(err);
	}
	
	return itemData;
}

module.exports = {
	getIDS,
	getData,
	simpleSearch
};
