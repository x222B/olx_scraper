const express = require("express");
const app = express();
const scraper = require("./scraper.js");
const LocalStorage = require("node-localstorage").LocalStorage;

app.get("/",(req,res)=>{
	res.json({
	message:"scraping is fun"
	})
})

app.get("/search/:searchTerm", (req,res)=>{
	let parsedSearchTerm = req.params.searchTerm.replace(/ /g,"+");
	const items = [];
	let promises=[];

	scraper
		.getIDS(parsedSearchTerm)
			.then((ids)=>{
					ids.forEach(id=>{
						promises.push(scraper
								.getData(id)
									.then(data=>items.push(data))
					);
					})
					Promise.all(promises).then((results)=>{
						res.json(items);	
					});
			});
	})

const port = process.env.PORT || 3000;
app.listen(port, ()=>{
	console.log(`listening on ${port}`);
})
