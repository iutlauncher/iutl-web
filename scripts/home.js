function onLoad() {
	let params = new URLSearchParams(window.location.href.split('?')[1]);

	if (params.has("search")) {
		const query = params.get("search");

		document.getElementById("searchinput").value = query;
		document.title = "Résultats pour « " + params.get("search") + " » — IUTLauncher";
		document.getElementById("search").insertAdjacentHTML("afterend", loadingBlock("Résultats de la recherche", "search-results"));

		search(query).then(
			function (val) {
				displayResults("search-results", query, val.map(r => r.doc));
			},
			function (err) {
				displayError("search-results");
				console.error(err);
			}
		);
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

	await fetch("api/index").then(
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

	//await __sleep(2000);

	return searchIndex.search(query, {expand: true});
}

function displayResults(id, query, results) {
	e = document.getElementById(id);
	e.classList.remove("loading");

	if (results.length == 0) {
		e.classList.add("no-results");
		e.innerHTML = '<span>Aucun résultat trouvé pour « ' + query + ' »</span>';
	} else {
		e.classList.add("results");
		if (results.length < 2) {
			e.style.maxWidth = (results.length * 250).toString() + "px";
		}
		e.innerHTML = results.map(gameCard).join("");
	}
}

function gameCard(game) {
	return '<a class="card" href="'
		+ game.uuid
		+ '"><img src="static/dino.jpeg"><span class="card-title">'
		+ game.title
		+ '</span><span class="card-description">'
		+ game.description
		+ '</span></a>';
}

function displayError(id) {
	e = document.getElementById(id);
	e.classList.remove("loading");
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