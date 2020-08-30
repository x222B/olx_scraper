const got = require("got")

const url = "https://www.olx.ba/pretraga?trazilica=";

function searchItems (searchTerm){
	return got(`${url}${searchTerm}`)
		.then(data=>data.body)
}

searchItems("usb")
	.then(response => console.log(response))
