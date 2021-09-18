function onSignIn() {
    genere();
}

function onSignOut() {
}

function genereFactureCours(idCours) {
    return callScriptFunction('genereFactureCours', [idCours]);
}

function genere() {
    const urlParams = new URLSearchParams(window.location.search);
    const idCours = urlParams.get('idCours');
    appendPre("Création de la facture en cours...");
    genereFactureCours(idCours)
        .then(returnValue => {
            appendPre("Création de la facture " + returnValue + " terminée");
        });
}