$(function () {
    const urlParams = new URLSearchParams(window.location.search);
    //const idClient = urlParams.get('idClient');
    const idClient = 'recGMIxbX0mMzLVGS';

    var Airtable = require('airtable');
    var base = new Airtable({ apiKey: 'key5XoJsw8IpLR7OK' }).base('appYxDSaRNTNnDPPI');

    var niveau;
    var styles;
    var dataProposition = [];
    var dataFutur = [];
    var dataEnCours = [];

    //Charge le client
    base('Client').find(idClient, function (err, record) {
        if (err) { console.error(err); return; }
        console.log(record);

        const name = record.get('Name');
        $("#clientName").text(name);

        niveau = record.get('Niveau');
        styles = record.get('Styles');
        dataFutur = tableauTitre(record.get('Partitions futures'));
        dataEnCours = tableauTitre(record.get('Partitions en cours'));
        dataJoue = tableauTitre(record.get('Partitions déjà jouées'));

        rechargeTable(tableFutur, dataFutur);
        rechargeTable(tableEnCours, dataEnCours);
    });

    const tableFutur = $("#tableFutur").DataTable({
        dom: "<'row'<'col-12'tr>>",
        paging: false,
        select: 'single',
        data: dataFutur,
        columns: [
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
            {
                data: "titre",
            },
            {
                data: "titre",
                orderable: false,
                render: function (data, type, row, meta) {
                    return '<button class="btn btn-sm btn-outline-primary"><i class="fas fa-chevron-right"></i></button>';
                },
                createdCell: function (cell, cellData, rowData, rowIndex, colIndex) {
                    $(cell).find("button").click(() => {
                        retire(tableFutur, dataFutur, rowData.titre);
                        ajoute(tableEnCours, dataEnCours, rowData.titre);
                        updateClient(dataFutur, dataEnCours, dataJoue);
                    });
                }
            }
        ]
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
                    return '<button class="btn btn-sm btn-outline-primary"><i class="fas fa-chevron-left"></i></button>';
                },
                createdCell: function (cell, cellData, rowData, rowIndex, colIndex) {
                    $(cell).find("button").click(() => {
                        retire(tableEnCours, dataEnCours, rowData.titre);
                        ajoute(tableFutur, dataFutur, rowData.titre);
                        updateClient(dataFutur, dataEnCours, dataJoue);
                    });
                }
            },
            {
                data: "titre",
            },
            {
                data: "titre",
                orderable: false,
                render: function (data, type, row, meta) {
                    return '<button class="btn btn-sm btn-outline-primary"><i class="far fa-thumbs-up"></i></button>';
                },
                createdCell: function (cell, cellData, rowData, rowIndex, colIndex) {
                    $(cell).find("button").click(() => {
                        retire(tableEnCours, dataEnCours, rowData.titre);
                        ajoute(null, dataJoue, rowData.titre);
                        updateClient(dataFutur, dataEnCours, dataJoue);
                    });
                }
            },
        ]
    });

    //Affichage de la modale
    $('#modalProposition').on('show.bs.modal', function () {
        //Charge les propositions
        tableProposition.ajax.reload();
    });

    const tableProposition = $("#tableProposition").DataTable({
        dom: "<'row'<'col-12'tr>>",
        paging: false,
        processing: true,
        order: [[3, 'desc']],
        columns: [
            {
                data: "titre",
                orderable: false,
            },
            {
                data: "style",
                orderable: false,
            },
            {
                data: "niveau",
                orderable: false,
            },
            {
                data: "pertinence",
                orderable: false,
            },
            {
                data: "titre",
                orderable: false,
                render: function (data, type, row, meta) {
                    return '<button class="btn btn-sm btn-outline-primary"><i class="fas fa-plus-circle"></i></button>'
                },
                createdCell: function (cell, cellData, rowData, rowIndex, colIndex) {
                    $(cell).find("button").click(() => {
                        ajoute(tableFutur, dataFutur, rowData.titre);
                        retire(tableProposition, dataProposition, rowData.titre);
                        updateClient(dataFutur, dataEnCours, dataJoue);
                    });
                }
            },
        ],
        createdRow: function (row, data, dataIndex, cells) {
            if (data.pertinence < 2) {
                $(row).addClass('table-secondary');
            }
        },
        ajax: function (data, callback, settings) {
            //Charge les propositions
            var returnValue = { value: null };
            if (niveau) {
                partitions(returnValue)
                    .then(() => {
                        dataProposition = returnValue.value
                            .filter(x => !dataFutur.map(x => x.titre).includes(x.titre))
                            .filter(x => !dataEnCours.map(x => x.titre).includes(x.titre))
                            .filter(x => !dataJoue.map(x => x.titre).includes(x.titre))
                            .filter(x => x.niveau >= niveau - 1 && x.niveau <= niveau + 1)
                            .map(x => ({ ...x, pertinence: pertinence(x) }));
                        callback({ data: dataProposition });
                    });
            }
        }
    });

    function pertinence(data) {
        var p = 2;
        if (data.niveau != niveau) p--;
        if (!styles.includes(data.style)) p--;
        return p;
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

    $("#btnAdd").click(function () {
        $("#modalProposition").modal("show");
    });



    function partitions(returnValue) {
        return callScriptFunction('partitions', [], returnValue);
    }
});

function onSignIn() {
}

function onSignOut() {
}