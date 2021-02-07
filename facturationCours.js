function onSignIn() {
    genere();
}

function onSignOut() {
}

function genereFactureCours(idCours, returnValue) {
    return callScriptFunction('genereFactureCours', [idCours], returnValue);
}

function genere() {
    const urlParams = new URLSearchParams(window.location.search);
    const idCours = urlParams.get('idCours');
    var returnValue = { value: null };
    appendPre("Création de la facture en cours...");
    genereFactureCours(idCours, returnValue)
        .then(() => {
            appendPre("Création de la facture " + returnValue.value + " terminée");
        });
}