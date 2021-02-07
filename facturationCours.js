function onSignIn() {
    genere();
}

function onSignOut() {
    divClient.style.display = 'none';
    divCours.style.display = 'none';
}

function genereFactureCours(idCours, returnValue) {
    return callScriptFunction('genereFactureCours', [idCours], returnValue);
}

function genere() {
    const urlParams = new URLSearchParams(window.location.search);
    const idCours = urlParams.get('idCours');
    var returnValue = { value: null };
    genereFactureCours(idCours, returnValue)
        .then(() => {
            appendPre("Création de la facture " + returnValue.value + " terminée");
        });
}