$(function () {
    //Récupère les donnée sauvegardées
    //PC
    const pc = localStorage.getItem('pc');
    if (pc) {
        $('input[name="pc"][value="' + pc + '"]').prop("checked", true);
    }

    //Commande
    const commande = localStorage.getItem('commande');
    const commandeMsg = localStorage.getItem('commandeMsg');
    const commandeCustom = localStorage.getItem('commandeCustom');
    if (commande) {
        $('input[name="commande"][value="' + commande + '"]').prop("checked", true);
        $('#txtMsg').val(commandeMsg);
        $('#txtCustom').val(commandeCustom);
    }

    //Gestion des input
    $('input[name="commande"]').change(enableInput);
    function enableInput(e) {
        //grise les champs
        $('#txtMsg').prop("disabled", !$('#rdoMsg').is(":checked"));
        $('#txtCustom').prop("disabled", !$('#rdoCustom').is(":checked"));

        //focus
        if (this.dataset) {
            $(this.dataset.for).focus();
        }
    }

    enableInput();

    $('#btnEnvoyer').click(function () {
        //Sauve les données
        //PC
        const pc = $('input[name="pc"]:checked').val();
        localStorage.setItem('pc', pc);

        //Commande
        const commande = $('input[name="commande"]:checked').val()
        localStorage.setItem('commande', commande);

        const commandeMsg = $('#txtMsg').val();
        localStorage.setItem('commandeMsg', commandeMsg);

        const commandeCustom = $('#txtCustom').val();
        localStorage.setItem('commandeCustom', commandeCustom);

        //Execute la commande
        var cmd;
        switch (commande) {
            case 'Shutdown': cmd = "shutdown -p"; break;
            case 'Msg': cmd = "msg * " + commandeMsg; break;
            case 'Custom': cmd = commandeCustom; break;
        }
        $('<a target="_blank" href="http://' + pc + '/?' + cmd + '"></a>')[0].click();
    });
});