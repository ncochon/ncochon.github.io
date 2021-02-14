$(function () {
    //Charge les données des cours
    var Airtable = require('airtable');
    // Get a base ID for an instance of art gallery example
    var base = new Airtable({ apiKey: 'key5XoJsw8IpLR7OK' }).base('appYxDSaRNTNnDPPI');

    const cours = [];

    base('Cours').select().eachPage(function page(records, fetchNextPage) {
        records.forEach(function (record) {
            cours.push({
                Date: record.get('Date'),
                Client: record.get('NomClient'),
                Annee: record.get('AnneeCours'),
                Mois: record.get('MoisCours'),
                Durée: record.get('Duree'),
                Prix: record.get('Prix'),
            });
        });

        fetchNextPage();
    }, function done(err) {
        if (err) { console.error(err); return; }

        var derivers = $.pivotUtilities.derivers;
        var renderers = $.extend($.pivotUtilities.renderers, $.pivotUtilities.plotly_renderers);
        $("#output").pivotUI(cours,
            {
                renderers: renderers,
                derivedAttributes: {
                    "Prix horaire": function(mp) {
                        return mp["Prix"] / mp["Durée"];
                    }
                }
            });
    });
});