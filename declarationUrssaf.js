$(function () {
    //Charge les données des factures
    var Airtable = require('airtable');
    var base = new Airtable({ apiKey: 'key5XoJsw8IpLR7OK' }).base('appYxDSaRNTNnDPPI');

    const factures = [];

    base('Facture').select({ fields: ["DateEncaissement", "Client", "Montant"], sort: [{ field: "DateEncaissement", direction: "desc" }], filterByFormula:"DateEncaissement != ''" })
        .eachPage(function page(records, fetchNextPage) {
            records.forEach(function (record) {
                factures.push({
                    momentDate: moment(record.get('DateEncaissement')),
                    Date: moment(record.get('DateEncaissement')).format("DD/MM/YYYY"),
                    Client: record.get('Client'),
                    Montant: record.get('Montant'),
                });
            });

            fetchNextPage();
        }, function done(err) {
            if (err) { console.error(err); return; }

            $("#output").pivotUI(factures,
                {
                    dataClass: $.pivotUtilities.SubtotalPivotData,
                    hiddenAttributes: ["momentDate"],
                    sorters: {
                        Date: function (x, y) {
                            x = moment(x, "DD/MM/YYYY");
                            y = moment(y, "DD/MM/YYYY");
                            if (x.isBefore(y)) return -1;
                            else if (x.isAfter(y)) return 1;
                            else return 0;
                        }
                    },
                    derivedAttributes: {
                        Année: x => x.momentDate.year(),
                        Mois: x => x.momentDate.month() + 1,
                        Trimestre: x => "T" + x.momentDate.quarter(),
                    },
                    renderers: $.pivotUtilities.subtotal_renderers,
                    rendererName: "Table With Subtotal",
                    rendererOptions: {
                        rowSubtotalDisplay: {
                            hideOnExpand: true,
                            collapseAt: 0
                        },
                    },
                    rows: ["Année", "Trimestre", "Mois"],
                    aggregatorName: "Somme",
                    vals: ["Montant"],
                },
                false, "fr");
        });
});