// Client ID and API key from the Developer Console
var CLIENT_ID = '470606754397-1kirsg9jfpbn6o3po81kb9nk9o42n35s.apps.googleusercontent.com';
var API_KEY = 'AIzaSyB_tnmlKQNbz9z8u8AiHgnEo7h0o5pTkiY';

// Array of API discovery doc URLs for APIs used by the quickstart
var DISCOVERY_DOCS = ["https://script.googleapis.com/$discovery/rest?version=v1"];

// Authorization scopes required by the API; multiple scopes can be
// included, separated by spaces.
var SCOPES = 'https://www.googleapis.com/auth/script.send_mail https://www.googleapis.com/auth/drive https://www.googleapis.com/auth/documents https://www.googleapis.com/auth/script.external_request https://www.googleapis.com/auth/spreadsheets https://mail.google.com/';

var authorizeButton = document.getElementById('authorize_button');
var signoutButton = document.getElementById('signout_button');
authorizeButton.onclick = getToken;

var tokenClient;
var access_token;

function gapiStart() {
	console.log('gapiStart');
	gapi.client.init({
		apiKey: API_KEY,
		clientId: CLIENT_ID,
		discoveryDocs: DISCOVERY_DOCS,
		scope: SCOPES
	}).then(function () {
		console.log('gapiStart then1');
		

		//onSignIn();

	}).then(function (response) {
		console.log('ok');
	}, function (reason) {
		console.log(reason);
		//console.log('Error: ' + reason.result.error.message);
	});
}

function gapiLoad() {
	console.log('gapiLoad');
	gapi.load('client', gapiStart)
}

function gisInit() {
	console.log('gisInit');
	tokenClient = google.accounts.oauth2.initTokenClient({
		client_id: CLIENT_ID,
		scope: SCOPES,
		callback: (tokenResponse) => {
			console.log('gisInit callback');
			// callback for tokenClient.requestAccessToken()
			access_token = tokenResponse.access_token;
			// gapi.client is automatically updated
			console.log('gapi.client access token: ' + JSON.stringify(gapi.client.getToken()));
		},
	});
}

function getToken() {
	// Re-entrant function to request user consent.
	// Returns an access token to the callback specified in google.accounts.oauth2.initTokenClient
	// Use a user gesture to call this function and obtain a new, valid access token
	// when the previous token expires and a 401 status code is returned by Google API calls.
	tokenClient.requestAccessToken();
}

// function revokeToken() {
// 	google.accounts.oauth2.revoke(access_token, () => { console.log('access token revoked') });
// }

/**
* Load the API and make an API call.  Display the results on the screen.
*/
function callScriptFunction(functionName, parameters) {
	console.log('callScriptFunction');
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

			console.log('Error calling API: ' + JSON.stringify(result));
		} else if (result.error) {
			// The API executed, but the script returned an error.

			// Extract the first (and only) set of error details.
			// The values of this object are the script's 'errorMessage' and
			// 'errorType', and an array of stack trace elements.
			var error = result.error.details[0];
			appendPre('Script error message: ' + error.errorMessage);
			console.log('Script error message: ' + error.errorMessage);

			if (error.scriptStackTraceElements) {
				// There may not be a stacktrace if the script didn't start
				// executing.
				appendPre('Script error stacktrace:');
				console.log('Script error stacktrace:');
				for (var i = 0; i < error.scriptStackTraceElements.length; i++) {
					var trace = error.scriptStackTraceElements[i];
					appendPre('\t' + trace.function + ':' + trace.lineNumber);
					console.log('\t' + trace.function + ':' + trace.lineNumber);
				}
			}
		} else {
			// Returne la valeur de retour
			return result.response.result;
		}
	})
		.catch(err => {
			console.log('callScriptFunction catch');
			authorizeButton.style.display = 'block';
		});

}