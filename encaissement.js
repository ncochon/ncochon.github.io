/**@type HTMLDivElement */
const divFacture = document.getElementById('divFacture');
/**@type HTMLSelectElement */
const cboFacture = document.getElementById('cboFacture');
cboFacture.addEventListener('change', cboFactureChangeHandler);

/**@type HTMLDivElement */
const divPaiement = document.getElementById('divPaiement');
/**@type HTMLInputElement */
const chkPayee = document.getElementById('chkPayee');
chkPayee.addEventListener('change', enableEnregistrer);
/**@type HTMLSelectElement */
const cboMoyenPaiement = document.getElementById('cboMoyenPaiement');
cboMoyenPaiement.addEventListener('change', enableEnregistrer);
/**@type HTMLInputElement */
const dateEncaissement = document.getElementById('dateEncaissement');
dateEncaissement.addEventListener('change', enableEnregistrer);
/**@type HTMLButtonElement */
const btnEnregistrer = document.getElementById('btnEnregistrer');
btnEnregistrer.addEventListener('click', btnEnregistrerClickHandler);

function onSignIn() {
	afficheFactures();
}

function onSignOut() {
	divFacture.style.display = 'none';
	divPaiement.style.display = 'none';
}

/**
 * Retourne la liste des factures à encaisser
 * @typedef {object} ReturnValue
 * @property {object} value
 * @param {ReturnValue} returnValue 
 */
function getFacturesARegler(returnValue) {
	return callScriptFunction('facturesARegler', [], returnValue);
}

/**
 * Enregistre le paiement de la facture
 * @param {string} numero 
 * @param {boolean} payee 
 * @param {string} moyenPaiement 
 * @param {Date} dateEncaissement 
 */
function enregistrePaiement(numero, payee, moyenPaiement, dateEncaissement) {
	console.log({numero, payee, moyenPaiement, dateEncaissement});
	return callScriptFunction('enregistrePaiement', [numero, payee, moyenPaiement, dateEncaissement]);
}

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
					option.payee = x[2];
					option.moyenPaiement = x[3];
					cboFacture.appendChild(option);
				});
			}
		});
}

function cboFactureChangeHandler() {
	const option = cboFacture.selectedOptions[0];
	const moyenPaiement = option.moyenPaiement;
	const payee = option.payee == 'TRUE';
	affichePaiement(payee, moyenPaiement);
}

/**
 * Affiche les informations de paiement
 * @param {boolean} payee 
 * @param {string} moyenPaiement 
 */
function affichePaiement(payee, moyenPaiement) {
	divPaiement.style.display = 'block';
	chkPayee.checked = payee;
	cboMoyenPaiement.value = moyenPaiement;
	btnEnregistrer.disabled = true;
}

//Active le bouton d'enregistrement
function enableEnregistrer() {
	btnEnregistrer.disabled = false;
}

function btnEnregistrerClickHandler() {
	//Empeche le click multiple
	btnEnregistrer.disabled = true;

	const numero = cboFacture.value;
	const payee = chkPayee.checked;
	const moyenPaiement = cboMoyenPaiement.value;
	const date = new Date(dateEncaissement.value);
	enregistrePaiement(numero, payee, moyenPaiement, date)
		.then(() => {
			appendPre("Enregistrement du paiement de la facture " + numero + " terminé");

			afficheFactures();
		});
}