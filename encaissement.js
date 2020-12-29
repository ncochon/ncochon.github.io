var divFacture = document.getElementById('divFacture');
var cboFacture = document.getElementById('cboFacture');
cboFacture.addEventListener('change', cboFactureChangeHandler);

/*var divCours = document.getElementById('divCours');
var ulCours = document.getElementById('ulCours');

var btnFacturer = document.getElementById('btnFacturer');
btnFacturer.addEventListener('click', btnFacturerClickHandler);
*/
function onSignIn(){
	afficheFactures();
}

function onSignOut(){
	divFacture.style.display = 'none';
	//divCours.style.display = 'none';
}

//Retourne la liste des factures à encaisser
function getFacturesARegler(returnValue) {
	return callScriptFunction('facturesARegler', [], returnValue);
}

//Retourne la liste des cours à facturer pour le client
/*function getCoursAFacturer(client, returnValue) {
	return callScriptFunction('coursAFacturer', [client], returnValue);
}

function genereFacture(client, returnValue) {
	return callScriptFunction('genereFacture', [client], returnValue);
}*/

//Affiche la liste des factures à régler
function afficheFactures() {
	//vide la liste
	while (cboFacture.firstChild) {
		cboFacture.removeChild(cboFacture.lastChild);
	}
	//Ajoute l'option vide
	var option = document.createElement("option");
	cboFacture.appendChild(option);

	var returnValue = { value: null };
	getFacturesARegler(returnValue)
		.then(() => {
			divFacture.style.display = 'block';

			var factures = returnValue.value;

			if (factures != null && factures.length > 0) {
				factures.forEach(x => {
					option = document.createElement("option");
					option.value = x[0]
					option.text = x[1];
					option.moyenPaiement = x[2];
					cboFacture.appendChild(option);
				});
			}
		});
}

function cboFactureChangeHandler(e) {
	console.log(e);
	//afficheCours(e.target.value);
}
/*
function afficheCours(client) {
	//vide la liste
	while (ulCours.firstChild) {
		ulCours.removeChild(ulCours.lastChild);
	}

	var returnValue = { value: null };
	getCoursAFacturer(client, returnValue)
		.then(() => {
			var cours = returnValue.value;

			if (cours != null && cours.length > 0) {
				divCours.style.display = 'block';

				cours.forEach(x => {
					var li = document.createElement("li");
					var textNode = document.createTextNode(x);
					li.appendChild(textNode);
					ulCours.appendChild(li);
				});

				btnFacturer.disabled = false;
			}
			else {
				appendPre("Il n'existe pas de client à facturer");
            }
		});
}

function btnFacturerClickHandler() {
	//Empeche le click multiple
	btnFacturer.disabled = true;

	var client = cboClient.value;
	var returnValue = { value: null };
	genereFacture(client, returnValue)
		.then(() => {
			appendPre("Création de la facture " + returnValue.value + " terminée");

			afficheClients();
		});
}
*/
