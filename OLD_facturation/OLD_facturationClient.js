function onSignIn() {
    genere();
}

function onSignOut() {
}

function genereFactureClient(idClient) {
    return callScriptFunction('genereFactureClient', [idClient]);
}

function genere() {
    const urlParams = new URLSearchParams(window.location.search);
    const idClient = urlParams.get('idClient');
    var returnValue = { value: null };
    appendPre("Création de la facture en cours...");
    genereFactureClient(idClient)
        .then(returnValue => {
            appendPre("Création de la facture " + returnValue + " terminée");
        });
}