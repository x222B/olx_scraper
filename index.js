const express = require("express");
const app = express();
const scraper = require("./scraper.js");

app.get("/",(req,res)=>{
	res.json({
	message:"scraping is fun"
	})
})

app.get("/search/:title", (req,res)=>{
	let parsedTitle = req.params.title.replace(/ /g,"+");
	scraper
		.miniSearch(parsedTitle)
		.then(items=>{
			res.json(items);
		})
})

const port = process.env.PORT || 3000;
app.listen(port, ()=>{
	console.log(`listening on ${port}`);
})
