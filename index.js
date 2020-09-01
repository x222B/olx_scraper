const express = require("express");
const app = express();
const scraper = require("./scraper.js");
const ejs = require("ejs");

app.set("view engine","ejs");
app.use(express.static('public'));
app.use(express.urlencoded({extended:'true'}));

app.get("/",(req,res)=>{
	res.render("index.ejs");
})


app.get("/search", (req,res)=>{

	const parsedSearchTerm = req.query.searchTerm.replace(/ /g,"+");
	const items = [];
	const promises=[];

	scraper
		.getIDS(parsedSearchTerm)
			.then((ids)=>{
					ids.forEach(id=>{
						promises.push(scraper
								.getData(id)
									.then(data=>items.push(data))
					);
					})
					Promise.all(promises).then(()=>{
						res.json(items);	
					});
			});
	})

const port = process.env.PORT || 3000;
app.listen(port, ()=>{
	console.log(`listening on ${port}`);
})
