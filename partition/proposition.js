function onSignIn() {
    const urlParams = new URLSearchParams(window.location.search);
    var idClient = urlParams.get('idClient');
    if (!idClient) {
        idClient = 'recd87iwjiVld6JmN';
    }

    $("#btnClose").click(() => { location = "index.html?idClient=" + idClient });

    var Airtable = require('airtable');
    var base = new Airtable({ apiKey: 'key5XoJsw8IpLR7OK' }).base('appYxDSaRNTNnDPPI');

    var niveau;
    var styles;
    var dataProposition = [];
    var dataFutur = [];
    var dataEnCours = [];
    var dataJoue = [];
    var dataProposition = [];

    var currentData = {};

    //Charge le client
    base('Client').find(idClient, function (err, record) {
        if (err) { console.error(err); return; }

        const name = record.get('Name');
        $("#clientName").text(name);

        niveau = record.get('Niveau');
        styles = record.get('Styles');
        dataFutur = tableauTitre(record.get('Partitions futures'));
        dataEnCours = tableauTitre(record.get('Partitions en cours'));
        dataJoue = tableauTitre(record.get('Partitions déjà jouées'));

        //Charge les propositions
        tableProposition.ajax.reload();
    });

    $("#btnAddSelected").click(() => {
        //Ajoute tous les morceaux sélectionnés
        $("input:checked").each(function () {
            ajoute(dataFutur, this.titre);
        });

        updateClient(dataFutur, () => {
            location = "index.html?idClient=" + idClient;
        });
    });

    const tableProposition = $("#tableProposition").DataTable({
        retrieve: true,
        dom: "<'row'<'col-6'i><'col-6 mt-3'f>>" +
            "<'row'<'col-12'tr>>",
        language: {
            url: "https://cdn.datatables.net/plug-ins/1.10.24/i18n/French.json"
        },
        paging: false,
        processing: true,
        order: [[4, 'desc'], [0, 'asc']],
        columns: [
            {
                data: "titre",
                render: function (data, type, row, meta) {
                    return '<button class="btn btn-sm btn-outline-primary"><i class="fas fa-edit"></i></button> ' + data;
                },
                createdCell: function (cell, cellData, rowData, rowIndex, colIndex) {
                    $(cell).find("button").click(() => {
                        currentData = rowData;
                        $("#modalPartition").modal("show");
                    });
                }
            },
            {
                data: "style",
                render: function (data, type, row, meta) {
                    if (type == 'display') {
                        if (styles.includes(data)) {
                            return '<span class="badge bg-success">' + data + '</span>';
                        }
                        else {
                            return '<span class="badge bg-warning text-dark">' + data + '</span>';
                        }

                    }
                    else {
                        return data;
                    }
                },
            },
            {
                data: "niveau",
                className: "text-center",
                render: function (data, type, row, meta) {
                    if (data) {
                        if (type == 'display') {
                            switch (Math.abs(data - niveau)) {
                                case 0: return '<span class="badge bg-success">' + data + '</span>';
                                case 1: return '<span class="badge bg-warning text-dark">' + data + '</span>';
                                default: return '<span class="badge bg-danger">' + data + '</span>';
                            }
                        }
                        else {
                            return data;
                        }
                    }
                    else {
                        return '';
                    }
                },
            },
            {
                data: "favorite",
                searchable: false,
                className: "text-center",
                render: function (data, type, row, meta) {
                    if (type == 'display') {
                        if (data) {
                            return '<i class="fas fa-star text-warning"></i>';
                        }
                        else {
                            return null;
                        }
                    }
                    else {
                        if (data) {
                            return 1;
                        }
                        else {
                            return 0;
                        }
                    }
                },
            },
            {
                data: "pertinence",
                className: "text-center",
            },
            {
                //Coche de selection
                data: "titre",
                orderable: false,
                render: function (data, type, row, meta) {
                    return '<input type="checkbox">'
                },
                createdCell: function (cell, cellData, rowData, rowIndex, colIndex) {
                    $(cell).find("input").change(function () {
                        this.titre = rowData.titre;

                        if ($("input:checked").length == 0) {
                            $("#btnAddSelected").hide();
                            $("button.add").show();
                        }
                        else {
                            $("#btnAddSelected").show();
                            $("button.add").hide();
                        }
                    });
                }
            },
            {
                //Bouton d'ajout direct
                data: "titre",
                orderable: false,
                render: function (data, type, row, meta) {
                    return '<button class="btn btn-sm btn-outline-primary add"><i class="fas fa-plus-circle"></i></button>'
                },
                createdCell: function (cell, cellData, rowData, rowIndex, colIndex) {
                    $(cell).find("button").click(() => {
                        ajoute(dataFutur, rowData.titre);
                        updateClient(dataFutur, () => {
                            location = "index.html?idClient=" + idClient;
                        });
                    });
                }
            },
        ],
        createdRow: function (row, data, dataIndex, cells) {
            if (data.pertinence < 5) {
                $(row).addClass('pertinence-' + data.pertinence);
            }
        },
        //data: dataProposition
        ajax: function (data, callback, settings) {
            if (niveau) {
                //Charge les propositions
                partitions()
                    .then(returnValue => {
                        dataProposition = returnValue
                            .filter(x => !dataFutur.map(x => x.titre).includes(x.titre))
                            .filter(x => !dataEnCours.map(x => x.titre).includes(x.titre))
                            .filter(x => !dataJoue.map(x => x.titre).includes(x.titre))
                            .map(x => ({ ...x, pertinence: pertinence(x) }));
                        callback({ data: dataProposition });
                        tableProposition.columns.adjust().draw();
                    });
            }
        }
    });

    function pertinence(data) {
        var p = 0;
        if (data.niveau == niveau) p++;
        if (Math.abs(data.niveau - niveau) <= 1) p++;
        if (Math.abs(data.niveau - niveau) <= 2) p++;
        if (styles.includes(data.style)) p++;
        if (data.favorite) p++
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

    //Ajoute un titre dans la liste
    function ajoute(data, titre) {
        data.push({ titre: titre });
    }

    //Enregistre dans Airtable
    function updateClient(dataFutur, callback) {
        base('Client').update([{
            id: idClient,
            fields: {
                'Partitions futures': concateneTitre(dataFutur),
            }
        }], callback);
    }

    function onlyUnique(value, index, self) {
        return self.indexOf(value) === index;
    }

    $("#btnAdd").click(function () {
        currentData.titre = "";
        currentData.style = "";
        currentData.niveau = "";
        currentData.favorite = false;

        $("#modalPartition").modal("show");
    });

    function partitions() {
        return callScriptFunction('partitions', []);
    }

    function styles() {
        return callScriptFunction('styles', []);
    }

    function updatePartition(oldTitre, titre, style, niveau, favorite) {
        return callScriptFunction('updatePartition', [oldTitre, titre, style, niveau, favorite]);
    }

    //Liste des styles
    styles()
        .then(returnValue => {
            $("#cboStyle").select2({
                theme: "bootstrap4",
                width: "100%",
                allowClear: true,
                placeholder: "",
                minimumResultsForSearch: Infinity,
                tags: true,
                data: returnValue,
            });
        });

    $("#modalPartition").on("show.bs.modal", () => {
        $("#txtTitre").val(currentData.titre);
        $("#cboStyle").val(currentData.style).trigger("change");
        $("#txtNiveau").val(currentData.niveau);
        $("#chkFavorite").prop("checked", currentData.favorite);

        $("#btnSave").prop("disabled", true);
    });

    $("#txtTitre, #cboStyle, #txtNiveau, #chkFavorite").on("input", enableSave);

    function enableSave() {
        //Valide la saisie
        $("#btnSave").prop("disabled",
            !$("#txtTitre").val()
            || !$("#cboStyle").val()
            || !$("#txtNiveau").val()
            || ($("#txtTitre").val() == currentData.titre
                && $("#cboStyle").val() == currentData.style
                && $("#txtNiveau").val() == currentData.niveau
                && $("#chkFavorite").prop("checked") == currentData.favorite)
        );
    }

    $("#btnSave").click(() => {
        //Enregistre dans Sheet
        const titre = $("#txtTitre").val();
        updatePartition(currentData.titre, titre, $("#cboStyle").val(), $("#txtNiveau").val(), $("#chkFavorite").prop("checked"))
            .then(returnValue => {
                if (!returnValue) {
                    alert("Le nouveau titre existe déjà");
                }
                else {
                    //MAJ le modele
                    tableProposition.ajax.reload();

                    if (currentData.titre && currentData.titre != titre) {
                        //Renomme dans Airtable
                        //Trouve les clients impactés
                        base('Client').select({
                            fields: ["Partitions futures", "Partitions en cours", "Partitions déjà jouées"],
                            filterByFormula: 'FIND("' + currentData.titre + '", CONCATENATE({Partitions futures}, {Partitions en cours}, {Partitions déjà jouées}))>0'
                        }).eachPage(function page(records, fetchNextPage) {
                            if (records.length) {
                                //MAJ les champs impactés
                                var updateData = [];
                                const r = new RegExp('^' + currentData.titre + '$', 'm');
                                records.forEach(record => {
                                    let data = { id: record.id, fields: {} };
                                    ["Partitions futures", "Partitions en cours", "Partitions déjà jouées"].forEach(p => {
                                        if (r.exec(record.get(p))) {
                                            data.fields[p] = record.get(p).replace(r, titre);
                                        }
                                    });
                                    updateData.push(data);
                                });
                                base('Client').update(updateData);

                                fetchNextPage();
                            }
                        });
                    }
                }
            });
    });
}