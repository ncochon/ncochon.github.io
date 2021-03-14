function onSignIn() {
    genere();
}

function onSignOut() {
}

function genereFactureClient(idClient, returnValue) {
    return callScriptFunction('genereFactureClient', [idClient], returnValue);
}

function genere() {
    const urlParams = new URLSearchParams(window.location.search);
    const idClient = urlParams.get('idClient');
    var returnValue = { value: null };
    appendPre("Création de la facture en cours...");
    genereFactureClient(idClient, returnValue)
        .then(() => {
            appendPre("Création de la facture " + returnValue.value + " terminée");
        });
}