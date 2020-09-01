const express = require("express");
const app = express();
const scraper = require("./scraper.js");
const ejs = require("ejs");
const fs = require("fs");

app.set("view engine","ejs");
app.use(express.static('public'));
app.use(express.json({limit: '50mb'}));
app.use(express.urlencoded({limit: '50mb'}));

app.get("/",(req,res)=>{
	res.render("index");
})


app.get("/search", (req,res)=>{

	const parsedSearchTerm = req.query.searchTerm.replace(/ /g,"+");

	if(req.query.dataType==='simple'){

		if(req.query.searchTerm==''){
			res.render("simpleResults",{data:undefined})
		} else  {
			scraper.simpleSearch(parsedSearchTerm)
					.then(data=>res.render("simpleResults",{items:{data:data,saved:false}}))
		}

	} else if(req.query.dataType==='full'){

		const items = [];
		const promises=[];

		if(req.query.searchTerm==''){
			res.render("fullResults",{data:undefined})
		} else  {
		scraper.getIDS(parsedSearchTerm)
				.then((ids)=>{
						console.log(`Fetching data for ${ids.length} items`);
						ids.forEach(id=>{
							promises.push(scraper.getData(id)
										.then(data=>items.push(data))
							);
					})
					Promise.all(promises).then(()=>{
						console.log("Fetching completed. Displaying in browser...");
						res.render("fullResults",{items2:{data:items,saved:false}});
					});
			});
		}
	} else {
		console.log("radio error");
	}
})


app.post("/search/save",(req,res)=>{
		fs.writeFile("data.json",req.body.data,(err)=>{
			console.log("Data saved to [data.json]");
			if(req.body.type==="full"){
				res.render("fullResults",{items2:{data:JSON.parse(req.body.data),saved:true}});
			}else {
				res.render("simpleResults",{items:{data:JSON.parse(req.body.data),saved:true}});
			}
		if(err){
			console.log(err);
		}	
		})

})

const port = process.env.PORT || 3000;
app.listen(port, ()=>{
	console.log(`listening on ${port}`);
})
