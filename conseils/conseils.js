function onSignIn() {
    const urlParams = new URLSearchParams(window.location.search);
    var idClient = urlParams.get('idClient');
    if (!idClient) {
        //idClient = 'recGMIxbX0mMzLVGS';
        idClient = 'rec0BYexFc3OIKXUO';
    }

    appendPre("Création du mail en cours...");

    callScriptFunction('genereMailConseil', [idClient])
        .then(() => {
            appendPre("Création du mail terminée.");
        });

}

function onSignOut() {
}