function onLoad() {
	let params = new URLSearchParams(window.location.href.split('?')[1]);

	if (params.has("search")) {
		document.getElementById("searchinput").value = params.get("search");
		search(params.get("search"));
	}
	else
	{
		for (let e of document.getElementsByTagName("form")) e.reset();
	}
}

function search(query) {
	let searchIndex = elasticlunr(function () {
		this.addField('title');
		this.addField('desc');
		this.setRef('id');
	});

	for (const doc of UNPROCESSED_INDEX) {
		searchIndex.addDoc(doc);
	}

	console.log(searchIndex.search(query));
}