function onSignIn() {
    const urlParams = new URLSearchParams(window.location.search);
    var idClient = urlParams.get('idClient');
    if (!idClient) {
        idClient = 'recGMIxbX0mMzLVGS';
    }

    var Airtable = require('airtable');
    var base = new Airtable({ apiKey: 'key5XoJsw8IpLR7OK' }).base('appYxDSaRNTNnDPPI');

    var methodes = [];
    var cours = [];

    //Charge les méthodes
    var methodesValue = { value: null };
    chargeMethodes(methodesValue)
        .then(() => {
            methodes = methodesValue.value

            //Charge le client
            base('Client').find(idClient, function (err, record) {
                if (err) { console.error(err); return; }

                const name = record.get('Name');
                $("#clientName").text(name);

                //Charge les 2 derniers cours du client
                base('Cours').select({ filterByFormula: 'IS_BEFORE({Date}, NOW())', fields: ["Date", ...methodes.map(x => x.titre)], maxRecords: 2, sort: [{ field: "Date", direction: "desc" }] })
                    .firstPage(function (err, records) {
                        if (err) { console.error(err); return; }
                        records.forEach(function (record) {
                            let c = { date: record.get('Date') };
                            methodes.forEach(x => {
                                c[x.titre] = record.get(x.titre);
                            });
                            cours.unshift(c);
                        });

                        //Charge le prochain cours
                        base('Cours').select({ filterByFormula: 'IS_AFTER({Date}, NOW())', fields: ["Date", ...methodes.map(x => x.titre)], maxRecords: 1, sort: [{ field: "Date", direction: "asc" }] })
                            .firstPage(function (err, records) {
                                if (err) { console.error(err); return; }
                                records.forEach(function (record) {
                                    let c = { date: record.get('Date') };
                                    methodes.forEach(x => {
                                        c[x.titre] = record.get(x.titre);
                                    });
                                    cours.push(c);
                                });

                                //Créé les dataTables
                                $("[cours='2']").text(moment(cours[0].date).format("DD/MM/YYYY"));
                                $("[cours='1']").text(moment(cours[1].date).format("DD/MM/YYYY"));
                                $("[cours='0']").text(moment(cours[2].date).format("DD/MM/YYYY"));
                                methodes.forEach(x => {
                                    var t = $("#tableMethode").clone().appendTo("#divCol").prop("id", x.titre).removeClass("d-none");
                                    t.DataTable({
                                        dom: "<'row'<'col-12'tr>>",
                                        paging: false,
                                        data: x.pieces.map(p => ({
                                            lecon: p.lecon,
                                            titre: p.titre,
                                            cours2: false,
                                            cours1: false,
                                            cours0: false,
                                        })),
                                        columns: [
                                            {
                                                data: "lecon",
                                                orderable: false,
                                            },
                                            {
                                                data: "titre",
                                                orderable: false,
                                            },
                                            {
                                                data: "cours2",
                                                orderable: false,
                                                render: function (data, type, row, meta) {
                                                    let checked = "";
                                                    if (data) checked = " checked"
                                                    return '<input type="checkbox" disabled' + checked + '/>';
                                                },
                                            },
                                            {
                                                data: "cours1",
                                                orderable: false,
                                                render: function (data, type, row, meta) {
                                                    let checked = "";
                                                    if (data) checked = " checked"
                                                    return '<input type="checkbox" disabled' + checked + '/>';
                                                },
                                            },
                                            {
                                                data: "cours0",
                                                orderable: false,
                                                render: function (data, type, row, meta) {
                                                    return '<input type="checkbox" />';
                                                },
                                                createdCell: function (cell, cellData, rowData, rowIndex, colIndex) {
                                                    $(cell).find("input").click(() => {

                                                    });
                                                }
                                            },
                                        ]
                                    });
                                });
                            });
                    });
            });
        });

    function chargeMethodes(returnValue) {
        return callScriptFunction('chargeMethodes', [], returnValue);
    }

    //Transforme une chaine multiligne en tableau d'objets
    function tableauTitre(texte) {
        return (texte && texte.split(String.fromCharCode(10)).filter(onlyUnique).map(x => { return { titre: x } })) || [];
    }

    //Transforme un tableau d'objet en chaine multiligne
    //Avec retrait des doublons
    function concateneTitre(tableau) {
        return tableau && tableau.map(x => x.titre).filter(onlyUnique).join(String.fromCharCode(10));
    }

    function rechargeTable(table, data) {
        table.clear().rows.add(data).draw();
    }

    //Retire un titre de la table et de la liste
    function retire(table, data, titre) {
        data.splice(data.findIndex(x => x.titre == titre), 1);
        table && rechargeTable(table, data);
    }

    //Ajoute un titre dans la table et la liste
    function ajoute(table, data, titre) {
        data.push({ titre: titre });
        table && rechargeTable(table, data);
    }

    //Enregistre dans Airtable
    function updateClient(dataFutur, dataEncours, dataJoue) {
        base('Client').update([{
            id: idClient,
            fields: {
                'Partitions futures': concateneTitre(dataFutur),
                'Partitions en cours': concateneTitre(dataEncours),
                'Partitions déjà jouées': concateneTitre(dataJoue),
            }
        }]);
    }

    function onlyUnique(value, index, self) {
        return self.indexOf(value) === index;
    }

    $("#btnAdd").prop("href", "proposition.html?idClient=" + idClient);
}

function onSignOut() {
}