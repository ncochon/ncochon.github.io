function onSignIn() {
    const urlParams = new URLSearchParams(window.location.search);
    var idClient = urlParams.get('idClient');
    if (!idClient) {
        idClient = 'recGMIxbX0mMzLVGS';
    }

    var Airtable = require('airtable');
    var base = new Airtable({ apiKey: 'key5XoJsw8IpLR7OK' }).base('appYxDSaRNTNnDPPI');

    var dataFutur = [];
    var dataEnCours = [];
    var dataJoue = [];

    //Charge le client
    base('Client').find(idClient, function (err, record) {
        if (err) { console.error(err); return; }
        console.log(record);

        const name = record.get('Name');
        $("#clientName").text(name);

        dataFutur = tableauTitre(record.get('Partitions futures'));
        dataEnCours = tableauTitre(record.get('Partitions en cours'));
        dataJoue = tableauTitre(record.get('Partitions déjà jouées'));

        //Charge les urls des partitions
        let titres = dataFutur.concat(dataEnCours).map(x => x.titre);
        partitionFichiers(titres).then(returnValue => {
            dataFutur.forEach(x => {
                x.fichiers = returnValue[x.titre]
            });
            rechargeTable(tableFutur, dataFutur);
            tableFutur.columns.adjust().draw();

            dataEnCours.forEach(x => {
                x.fichiers = returnValue[x.titre]
            });
            rechargeTable(tableEnCours, dataEnCours);
            tableEnCours.columns.adjust().draw();
        });

        rechargeTable(tableFutur, dataFutur);
        rechargeTable(tableEnCours, dataEnCours);
    });

    const tableEnCours = $("#tableEnCours").DataTable({
        dom: "<'row'<'col-12'tr>>",
        paging: false,
        data: dataEnCours,
        columns: [
            {
                data: "titre",
                orderable: false,
                render: function (data, type, row, meta) {
                    return '<button class="btn btn-sm btn-outline-primary"><i class="far fa-check-circle"></i></button>';
                },
                createdCell: function (cell, cellData, rowData, rowIndex, colIndex) {
                    $(cell).find("button").click(() => {
                        retire(tableEnCours, dataEnCours, rowData.titre);
                        ajoute(null, dataJoue, rowData.titre);
                        updateClient(dataFutur, dataEnCours, dataJoue);
                    });
                }
            },
            {
                data: "titre",
            },
            {
                data: "fichiers",
                render: function (data, type, row, meta) {
                    if (data) {
                        return data.map(x => '<a href="' + x.url + '" target="_blank">' + x.nom + '</a>').join('<br/>');
                    }
                    else {
                        return "";
                    }
                },
            },
            {
                data: "titre",
                orderable: false,
                render: function (data, type, row, meta) {
                    return '<button class="btn btn-sm btn-outline-primary"><i class="fas fa-chevron-right"></i></button>';
                },
                createdCell: function (cell, cellData, rowData, rowIndex, colIndex) {
                    $(cell).find("button").click(() => {
                        retire(tableEnCours, dataEnCours, rowData.titre);
                        ajoute(tableFutur, dataFutur, rowData.titre);
                        updateClient(dataFutur, dataEnCours, dataJoue);
                    });
                }
            },
        ]
    });

    const tableFutur = $("#tableFutur").DataTable({
        dom: "<'row'<'col-12'tr>>",
        paging: false,
        data: dataFutur,
        columns: [
            {
                data: "titre",
                orderable: false,
                render: function (data, type, row, meta) {
                    return '<button class="btn btn-sm btn-outline-primary"><i class="fas fa-chevron-left"></i></button>';
                },
                createdCell: function (cell, cellData, rowData, rowIndex, colIndex) {
                    $(cell).find("button").click(() => {
                        retire(tableFutur, dataFutur, rowData.titre);
                        ajoute(tableEnCours, dataEnCours, rowData.titre);
                        updateClient(dataFutur, dataEnCours, dataJoue);
                    });
                }
            },
            {
                data: "titre",
            },
            {
                data: "fichiers",
                render: function (data, type, row, meta) {
                    if (data) {
                        return data.map(x => '<a href="' + x.url + '" target="_blank">' + x.nom + '</a>').join('<br/>');
                    }
                    else {
                        return "";
                    }
                },
            },
            {
                data: "titre",
                orderable: false,
                render: function (data, type, row, meta) {
                    return '<button class="btn btn-sm btn-outline-primary"><i class="far fa-times-circle"></i></button>';
                },
                createdCell: function (cell, cellData, rowData, rowIndex, colIndex) {
                    $(cell).find("button").click(() => {
                        retire(tableFutur, dataFutur, rowData.titre);
                        updateClient(dataFutur, dataEnCours, dataJoue);
                    });
                }
            },
        ]
    });

    //Transforme une chaine multiligne en tableau d'objets
    function tableauTitre(texte) {
        return (texte && texte.split(String.fromCharCode(10)).filter(onlyUnique).map(x => { return { titre: x, fichier: null } })) || [];
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

    function partitionFichiers(titres) {
        return callScriptFunction('partitionFichiers', [titres])
    }
}

function onSignOut() {
}