$(function () {
    //Charge les données des cours
    var Airtable = require('airtable');
    var base = new Airtable({ apiKey: 'key5XoJsw8IpLR7OK' }).base('appYxDSaRNTNnDPPI');

    const cours = [];

    base('Cours').select({ fields: ["Date", "NomClient", "Duree", "Prix"] })
        .eachPage(function page(records, fetchNextPage) {
            records.forEach(function (record) {
                cours.push({
                    _Date: moment(record.get('Date')).toDate(),
                    Date: moment(record.get('Date')).format("DD/MM/YYYY HH:mm"),
                    Client: record.get('NomClient'),
                    Durée: record.get('Duree'),
                    Prix: record.get('Prix'),
                });
            });

            fetchNextPage();
        }, function done(err) {
            if (err) { console.error(err); return; }

            var derivers = $.pivotUtilities.derivers;
            var renderers = $.extend($.pivotUtilities.renderers, $.pivotUtilities.plotly_renderers);

            var aggMap = {
                'agg1': {
                    aggType: 'Count Unique Values',
                    arguments: ['Client'],
                    name: 'CountUnique(Client)',
                    varName: 'a',
                    renderEnhancement: 'none'
                },

                'agg2': {
                    aggType: 'Sum',
                    arguments: ['Prix'],
                    name: 'Sum(Prix)',
                    varName: 'b',
                    hidden: false,
                    renderEnhancement: 'none'
                },
                'agg3': {
                    aggType: 'Sum',
                    arguments: ['Durée'],
                    name: 'Sum(Durée)',
                    varName: 'c',
                    hidden: false,
                    renderEnhancement: 'none'
                }
            };

            var customAggs = {};
            customAggs['Multifact Aggregators'] = $.pivotUtilities.multifactAggregatorGenerator(aggMap, []);

            $("#output").pivotUI(cours,
                {
                    hiddenAttributes: ["_Date"],
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
                        "Prix horaire": x => x.Prix / x.Durée,
                        Année: x => x._Date.getFullYear(),
                        Mois: x => x._Date.getMonth() + 1,
                    },
                    aggregators: $.extend($.pivotUtilities.aggregators, customAggs),
                    renderers: $.extend($.pivotUtilities.renderers, $.pivotUtilities.gtRenderers),
                    rendererOptions: {
                        aggregations: {
                            defaultAggregations: aggMap,
                        }
                    },
                    aggregatorName: "Multifact Aggregators",
                    rendererName: "GT Table",
                    rows: ["Année", "Mois"]
                });
        });
});