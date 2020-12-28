var divClient = document.getElementById('divClient');
var cboClient = document.getElementById('cboClient');
cboClient.addEventListener('change', cboClientChangeHandler);

var divCours = document.getElementById('divCours');
var ulCours = document.getElementById('ulCours');

var btnFacturer = document.getElementById('btnFacturer');
btnFacturer.addEventListener('click', btnFacturerClickHandler);

function onSignIn() {
	afficheClients();
}

function onSignOut() {
	divClient.style.display = 'none';
	divCours.style.display = 'none';
}

//Retourne la liste des clients à facturer
function getClientsAFacturer(returnValue) {
	return callScriptFunction('clientsAFacturer', [], returnValue);
}

//Retourne la liste des cours à facturer pour le client
function getCoursAFacturer(client, returnValue) {
	return callScriptFunction('coursAFacturer', [client], returnValue);
}

function genereFacture(client, returnValue) {
	return callScriptFunction('genereFacture', [client], returnValue);
}

//Affiche la liste des clients à facturer
function afficheClients() {
	//vide la liste
	while (cboClient.firstChild) {
		cboClient.removeChild(cboClient.lastChild);
	}
	//Ajoute l'option vide
	var option = document.createElement("option");
	cboClient.appendChild(option);

	var returnValue = { value: null };
	getClientsAFacturer(returnValue)
		.then(() => {
			divClient.style.display = 'block';

			var clients = returnValue.value;

			if (clients != null && clients.length > 0) {
				clients.forEach(x => {
					option = document.createElement("option");
					option.text = x;
					cboClient.appendChild(option);
				});
			}
		});
}

function cboClientChangeHandler(e) {
	afficheCours(e.target.value);
}

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
