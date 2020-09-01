const express = require("express");
const app = express();
const scraper = require("./scraper.js");
const ejs = require("ejs");
const fs = require("fs");

app.set("view engine","ejs");
app.use(express.static('public'));
app.use(express.urlencoded({extended:'true'}));

app.get("/",(req,res)=>{
	res.render("index.ejs");
})


app.get("/search", (req,res)=>{
		const parsedSearchTerm = req.query.searchTerm.replace(/ /g,"+");
		const items = [];
		if(req.query.searchTerm==''){
			res.render("results",{data:undefined})
		} else {
		scraper.miniSearch(parsedSearchTerm)
				.then(data=>res.render("results",{data:data}))
		}
})
app.get("/test",(req,res)=>{
	const parsedSearchTerm = req.query.searchTerm.replace(/ /g,"+");
	const items = [];
	scraper.miniSearch(parsedSearchTerm)
		.then((data)=>{
			fileName = req.query.searchTerm + ".json"
			data=JSON.stringify(data);
			fs.writeFile(fileName,data,(err)=>{
				if(err){
					return console.log(err);
				}
				console.log("The file was saved! ["+ fileName+"]");
			})
		})

})

app.get("/bigSearch",(req,res)=>{
		
	const parsedSearchTerm = req.query.searchTerm.replace(/ /g,"+");
	const items = [];
	const promises=[];

	scraper.getIDS(parsedSearchTerm)
			.then((ids)=>{
					ids.forEach(id=>{
						promises.push(scraper
								.getData(id)
									.then(data=>items.push(data))
					);
					})
					Promise.all(promises).then(()=>{
						//data=JSON.stringify(items);
						res.render("results",{data:items});
						//res.json(items);	
					});
			});
})

const port = process.env.PORT || 3000;
app.listen(port, ()=>{
	console.log(`listening on ${port}`);
})
