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
                const info = returnValue[x.titre];
                x.fichiers = info.fichiers;
                x.note = info.note;
            });
            rechargeTable(tableFutur, dataFutur);

            dataEnCours.forEach(x => {
                const info = returnValue[x.titre];
                x.fichiers = info.fichiers;
                x.note = info.note;
            });
            rechargeTable(tableEnCours, dataEnCours);
        });

        rechargeTable(tableFutur, dataFutur);
        rechargeTable(tableEnCours, dataEnCours);
    });

    const tableEnCours = $("#tableEnCours").DataTable({
        retrieve: true,
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
                        retire(tableEnCours, dataEnCours, rowData);
                        ajoute(null, dataJoue, rowData);
                        updateClient(dataFutur, dataEnCours, dataJoue);
                    });
                }
            },
            {
                data: "titre",
                render: function (data, type, row, meta) {
                    var html = data;

                    if (row.note) {
                        html += ' <i class="fas fa-info-circle" data-bs-toggle="tooltip"></i>';
                    }

                    return html;
                },
                createdCell: function (cell, cellData, rowData, rowIndex, colIndex) {
                    const $i = $(cell).find("i");
                    if ($i[0]) {
                        $i.prop("title", rowData.note);
                        new bootstrap.Tooltip($i[0]);
                    }
                }
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
                        retire(tableEnCours, dataEnCours, rowData);
                        ajoute(tableFutur, dataFutur, rowData);
                        updateClient(dataFutur, dataEnCours, dataJoue);
                    });
                }
            },
        ]
    });

    const tableFutur = $("#tableFutur").DataTable({
        retrieve: true,
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
                        retire(tableFutur, dataFutur, rowData);
                        ajoute(tableEnCours, dataEnCours, rowData);
                        updateClient(dataFutur, dataEnCours, dataJoue);
                    });
                }
            },
            {
                data: "titre",
                render: function (data, type, row, meta) {
                    var html = data;

                    if (row.note) {
                        html += ' <i class="fas fa-info-circle" data-bs-toggle="tooltip"></i>';
                    }

                    return html;
                },
                createdCell: function (cell, cellData, rowData, rowIndex, colIndex) {
                    const $i = $(cell).find("i");
                    if ($i[0]) {
                        $i.prop("title", rowData.note);
                        new bootstrap.Tooltip($i[0]);
                    }
                }
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
                        retire(tableFutur, dataFutur, rowData);
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
        table.clear().rows.add(data);
        table.columns.adjust().draw();
    }

    //Retire un titre de la table et de la liste
    function retire(table, data, row) {
        data.splice(data.findIndex(x => x.titre == row.titre), 1);
        table && rechargeTable(table, data);
    }

    //Ajoute un titre dans la table et la liste
    function ajoute(table, data, row) {
        data.push(row);
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