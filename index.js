const express = require("express");
const app = express();
const scraper = require("./scraper.js");
const ejs = require("ejs");
const fs = require("fs");

app.set("view engine","ejs");
app.use(express.static('public'));
app.use(express.urlencoded({extended:'true'}));

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
					.then(data=>res.render("simpleResults",{data:data}))
		}

	} else if(req.query.dataType==='full'){

		const items = [];
		const promises=[];

		if(req.query.searchTerm==''){
			res.render("fullResults",{data:undefined})
		} else  {
		scraper.getIDS(parsedSearchTerm)
				.then((ids)=>{
						ids.forEach(id=>{
							promises.push(scraper.getData(id)
										.then(data=>items.push(data))
							);
					})
					Promise.all(promises).then(()=>{
						res.render("fullResults",{data:items});
					});
			});
		}
	} else {
		console.log("radio error");
	}
})

const port = process.env.PORT || 3000;
app.listen(port, ()=>{
	console.log(`listening on ${port}`);
})





						//fileName = req.query.searchTerm + ".json";
						//let fullitems='[';
						//items.forEach((item)=>{
						//	item=JSON.stringify(item);
						//	fullitems+=item+',';
						//})

						//fullitems=fullitems.slice(0,-1);
						//fullitems+=']';
						//fullitems=JSON.stringify(fullitems);
						//res.json(fullitems);

					//	fs.writeFile(fileName,fullitems,(err)=>{
					//		if(err){
					//			return console.log(err);
					//		}
					//	console.log("The file was saved! ["+ fileName+"]");
					//	})
