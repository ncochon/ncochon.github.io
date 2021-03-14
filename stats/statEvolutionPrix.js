$(function () {
    //Charge les données des cours
    var Airtable = require('airtable');
    var base = new Airtable({ apiKey: 'key5XoJsw8IpLR7OK' }).base('appYxDSaRNTNnDPPI');

    const cours = [];

    base('Cours').select({ fields: ["Date", "NomClient", "Duree", "Prix"] })
        .eachPage(function page(records, fetchNextPage) {
            records.forEach(function (record) {
                cours.push({
                    momentDate: moment(record.get('Date').replace("Z", "")),
                    Date: moment(record.get('Date').replace("Z", "")).format("DD/MM/YYYY HH:mm"),
                    Client: record.get('NomClient'),
                    Durée: record.get('Duree'),
                    Prix: record.get('Prix'),
                });
            });

            fetchNextPage();
        }, function done(err) {
            if (err) { console.error(err); return; }

            var dataClass = $.pivotUtilities.SubtotalPivotData;
            var renderers = $.pivotUtilities.subtotal_renderers;
            $("#output").pivotUI(cours,
                {
                    dataClass: dataClass,
                    renderers: renderers,
                    hiddenAttributes: ["momentDate"],
                    sorters: {
                        Date: function (x, y) {
                            x = moment(x, "DD/MM/YYYY HH:mm");
                            y = moment(y, "DD/MM/YYYY HH:mm");
                            if (x.isBefore(y)) return -1;
                            else if (x.isAfter(y)) return 1;
                            else return 0;
                        }
                    },
                    derivedAttributes: {
                        Année: x => x.momentDate.year(),
                        Mois: x => x.momentDate.month() + 1,
                    },
                    rendererName: "Table With Subtotal",
                    aggregatorName: "Ratio de sommes",
                    vals: ["Prix", "Durée"],
                    rows: ["Année", "Mois"]
                }, false, "fr");
        });
});