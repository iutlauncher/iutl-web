function onLoad() {
	let params = new URLSearchParams(window.location.href.split('?')[1]);

	if (params.has("search")) {
		document.getElementById("searchinput").value = params.get("search");
		search(params.get("search")).then(
			function (val) {
				displayResults(val.map(r => r.doc), "search-results");
			},
			function (err) {
				displayError("search-results");
				console.error(err);
			}
		);
		document.title = "Résultats pour « " + params.get("search") + " » — IUTLauncher";
		document.getElementById("search").insertAdjacentHTML("afterend", loadingBlock("Résultats de la recherche", "search-results"))
	}
	else
	{
		for (let e of document.getElementsByTagName("form")) e.reset();
	}
}

function __sleep(milliseconds) {  
    return new Promise(resolve => setTimeout(resolve, milliseconds));  
}  

async function search(query) {
	let searchIndex = elasticlunr(function () {
		this.addField('title');
		this.addField('description');
		this.setRef('uuid');
	});

	var response, unprocessedIndex;

	await fetch("api/index.json").then(
		function (val) {
			response = val;
		},
		function (err) {
			throw err;
		}
	);

	await response.json().then(
		function (val) {
			unprocessedIndex = val;
		},
		function (err) {
			throw err;
		}
	);

	for (const doc of unprocessedIndex) {
		searchIndex.addDoc(doc);
	}

	await __sleep(2000);

	return searchIndex.search(query, {expand: true});
}

function displayResults(results, id) {
	
}

function displayError(id) {
	e = document.getElementById(id);
	e.classList.remove("loading");
	e.classList.add("fail");
	e.innerHTML = '<span>Une erreur est survenue</span>';
}

function loadingBlock(heading, id) {
	html = '<div><div class="block-heading"><h2>';
	html += heading;
	html += '</h2><span class="line"></span></div><div class="loading" id="';
	html += id;
	html += '"><span></span><span></span><span></span><span></span><span></span></div></div>';
	return html;
}