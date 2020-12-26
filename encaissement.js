// Client ID and API key from the Developer Console
var CLIENT_ID = '470606754397-1kirsg9jfpbn6o3po81kb9nk9o42n35s.apps.googleusercontent.com';
var API_KEY = 'AIzaSyB_tnmlKQNbz9z8u8AiHgnEo7h0o5pTkiY';

// Array of API discovery doc URLs for APIs used by the quickstart
var DISCOVERY_DOCS = ["https://script.googleapis.com/$discovery/rest?version=v1"];

// Authorization scopes required by the API; multiple scopes can be
// included, separated by spaces.
var SCOPES = 'https://www.googleapis.com/auth/script.projects https://www.googleapis.com/auth/spreadsheets https://www.googleapis.com/auth/forms';

var authorizeButton = document.getElementById('authorize_button');
var signoutButton = document.getElementById('signout_button');

var divFacture = document.getElementById('divFacture');
var cboFacture = document.getElementById('cboFacture');
//cboFacture.addEventListener('change', cboFactureChangeHandler);

//var btnFacturer = document.getElementById('btnFacturer');
//btnFacturer.addEventListener('click', btnFacturerClickHandler);

/**
 *  On load, called to load the auth2 library and API client library.
 */
function handleClientLoad() {
	gapi.load('client:auth2', initClient);
}

/**
 *  Initializes the API client library and sets up sign-in state
 *  listeners.
 */
function initClient() {
	gapi.client.init({
		apiKey: API_KEY,
		clientId: CLIENT_ID,
		discoveryDocs: DISCOVERY_DOCS,
		scope: SCOPES
	}).then(function () {
		// Listen for sign-in state changes.
		gapi.auth2.getAuthInstance().isSignedIn.listen(updateSigninStatus);

		// Handle the initial sign-in state.
		updateSigninStatus(gapi.auth2.getAuthInstance().isSignedIn.get());
		authorizeButton.onclick = handleAuthClick;
		signoutButton.onclick = handleSignoutClick;
	}, function (error) {
		appendPre(JSON.stringify(error, null, 2));
	});
}

/**
 *  Called when the signed in status changes, to update the UI
 *  appropriately. After a sign-in, the API is called.
 */
function updateSigninStatus(isSignedIn) {
	if (isSignedIn) {
		authorizeButton.style.display = 'none';
		//signoutButton.style.display = 'block';
		afficheFactures();
	} else {
		authorizeButton.style.display = 'block';
		signoutButton.style.display = 'none';
		divFacture.style.display = 'none';
		//divCours.style.display = 'none';
	}
}

/**
 *  Sign in the user upon button click.
 */
function handleAuthClick() {
	gapi.auth2.getAuthInstance().signIn();
}

/**
 *  Sign out the user upon button click.
 */
function handleSignoutClick() {
	gapi.auth2.getAuthInstance().signOut();
}

/**
 * Append a pre element to the body containing the given message
 * as its text node. Used to display the results of the API call.
 *
 * @param {string} message Text to be placed in pre element.
 */
function appendPre(message) {
	var pre = document.getElementById('content');
	var textContent = document.createTextNode(message + '\n');
	pre.appendChild(textContent);
}

/**
* Load the API and make an API call.  Display the results on the screen.
*/
function callScriptFunction(functionName, parameters, returnValue) {
	// Call the Apps Script API run method
	//   'scriptId' is the URL parameter that states what script to run
	//   'resource' describes the run request body (with the function name
	//              to execute)
	return gapi.client.script.scripts.run({
		scriptId: "MQZOaFnbhMjOOHt6VT-lierRySOfcs_yW",
		resource: {
			function: functionName,
			parameters: parameters,
			devMode: true,
		}
	}).then(function (resp) {
		var result = resp.result;
		if (result.error && result.error.status) {
			// The API encountered a problem before the script
			// started executing.
			appendPre('Error calling API:');
			appendPre(JSON.stringify(result, null, 2));
		} else if (result.error) {
			// The API executed, but the script returned an error.

			// Extract the first (and only) set of error details.
			// The values of this object are the script's 'errorMessage' and
			// 'errorType', and an array of stack trace elements.
			var error = result.error.details[0];
			appendPre('Script error message: ' + error.errorMessage);

			if (error.scriptStackTraceElements) {
				// There may not be a stacktrace if the script didn't start
				// executing.
				appendPre('Script error stacktrace:');
				for (var i = 0; i < error.scriptStackTraceElements.length; i++) {
					var trace = error.scriptStackTraceElements[i];
					appendPre('\t' + trace.function + ':' + trace.lineNumber);
				}
			}
		} else {
			// Returne la valeur de retour
			if (returnValue != null) {
				returnValue.value = result.response.result;
			}
		}
	});
}

//Retourne la liste des factures à encaisser
function getFacturesAEncaisser(returnValue) {
	return callScriptFunction('facturesAEncaisser', [], returnValue);
}

//Retourne la liste des cours à facturer pour le client
/*function getCoursAFacturer(client, returnValue) {
	return callScriptFunction('coursAFacturer', [client], returnValue);
}

function genereFacture(client, returnValue) {
	return callScriptFunction('genereFacture', [client], returnValue);
}*/

//Affiche la liste des factures à encaisser
function afficheFactures() {
	//vide la liste
	while (cboFacture.firstChild) {
		cboFacture.removeChild(cboFacture.lastChild);
	}
	//Ajoute l'option vide
	var option = document.createElement("option");
	cboFacture.appendChild(option);

	var returnValue = { value: null };
	getFacturesAEncaisser(returnValue)
		.then(() => {
			divFactre.style.display = 'block';

			var factures = returnValue.value;

			if (factures != null && factures.length > 0) {
				factures.forEach(x => {
          const tab = x.split(";");
					option = document.createElement("option");
					option.value = tab[0]
          option.text = tab[1];
					cboClient.appendChild(option);
				});
			}
		});
}
/*
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
*/
