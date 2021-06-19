const NB_ANCIEN_COURS = 2;

function onSignIn() {
    const urlParams = new URLSearchParams(window.location.search);
    var idClient = urlParams.get('idClient');
    if (!idClient) {
        //idClient = 'recGMIxbX0mMzLVGS';
        idClient = 'rec0BYexFc3OIKXUO';
    }

    var Airtable = require('airtable');
    var base = new Airtable({ apiKey: 'key5XoJsw8IpLR7OK' }).base('appYxDSaRNTNnDPPI');

    var methodes = [];
    var cours = [];

    var tzo = new Date().getTimezoneOffset();

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

                //Charge les x derniers cours du client
                base('Cours').select({
                    filterByFormula: 'AND({Client}="' + name + '", IS_BEFORE(DATEADD({Date}, ' + tzo.toString() + ', "minutes"), NOW()))',
                    fields: ["Date", ...methodes.map(x => x.titre)],
                    maxRecords: NB_ANCIEN_COURS,
                    sort: [{ field: "Date", direction: "desc" }]
                })
                    .firstPage(function (err, records) {
                        if (err) { console.error(err); return; }
                        records.forEach(function (record) {
                            let c = { date: record.get('Date') };
                            methodes.forEach(x => {
                                c[x.titre] = record.get(x.titre);
                            });
                            cours.unshift(c);
                        });
                        //Complete si besoin
                        while (cours.length < NB_ANCIEN_COURS) cours.unshift({});

                        //Charge le prochain cours
                        base('Cours').select({
                            filterByFormula: 'AND({Client}="' + name + '", IS_AFTER(DATEADD({Date}, ' + tzo.toString() + ', "minutes"), NOW()))',
                            fields: ["Date", ...methodes.map(x => x.titre)],
                            maxRecords: 1,
                            sort: [{ field: "Date", direction: "asc" }]
                        })
                            .firstPage(function (err, records) {
                                if (err) { console.error(err); return; }
                                records.forEach(function (record) {
                                    let c = {
                                        id: record.id,
                                        date: record.get('Date')
                                    };
                                    methodes.forEach(x => {
                                        c[x.titre] = record.get(x.titre);
                                    });
                                    cours.push(c);
                                });
                                //Complete si besoin
                                if (cours.length < NB_ANCIEN_COURS + 1) cours.push({});

                                //Colonne avec les dates des cours
                                for (let i = 0; i < cours.length; i++) {
                                    $("tr").append("<th>" + (cours[i].date && moment(cours[i].date).format("DD/MM/YYYY")) + "</th>");
                                }

                                //Créé les dataTables
                                methodes.forEach(methode => {
                                    let div1 = $("#container > div:nth-child(1)").clone().appendTo("#container").show();
                                    let div2 = div1.children("div");
                                    let btn = div1.children("button").text(methode.titre);
                                    let t = div2.children("table").prop("id", methode.titre);
                                    let data = methode.pieces.map(p => {
                                        let r = new RegExp('^' + p.id + '$', 'm');
                                        let result = {
                                            id: p.id,
                                            lecon: p.lecon,
                                            titre: p.titre
                                        };
                                        //Teste si la leçon est présente
                                        for (let i = 0; i < cours.length; i++) {
                                            result['cours' + i] = r.test(cours[i][methode.titre])
                                        }
                                        return result;
                                    });

                                    //Definition des colonnes des anciens cours
                                    let colonnesCours = [];
                                    for (let i = 0; i < NB_ANCIEN_COURS; i++) {
                                        colonnesCours.push({
                                            data: "cours" + i,
                                            orderable: false,
                                            width: "100px",
                                            className: "dt-center",
                                            render: function (data, type, row, meta) {
                                                let checked = "";
                                                if (data) checked = " checked"
                                                return '<input type="checkbox" disabled' + checked + '/>';
                                            },
                                        })
                                    }

                                    let dt = t.DataTable({
                                        dom: "<'row'<'col-12'tr>>",
                                        paging: true,
                                        scrollY: "400px",
                                        scroller: true,
                                        data: data,
                                        columns: [
                                            {
                                                data: "lecon",
                                                orderable: false,
                                            },
                                            {
                                                data: "titre",
                                                orderable: false,
                                            },
                                            ...colonnesCours,
                                            {
                                                data: "cours" + NB_ANCIEN_COURS,
                                                orderable: false,
                                                width: "100px",
                                                className: "dt-center",
                                                render: function (data, type, row, meta) {
                                                    let checked = "";
                                                    if (data) checked = " checked"
                                                    return '<input type="checkbox"' + checked + '/>';
                                                },
                                                createdCell: function (cell, cellData, rowData, rowIndex, colIndex) {
                                                    $(cell).find("input").click(e => {
                                                        let c = cours[NB_ANCIEN_COURS];
                                                        let tab = (c[methode.titre] && c[methode.titre].split(String.fromCharCode(10)).filter(onlyUnique)) || [];
                                                        if (e.target.checked) {
                                                            //Ajoute la leçon
                                                            tab.push(rowData.id);
                                                        }
                                                        else {
                                                            //Retire la leçon
                                                            tab = tab.filter(id => id != rowData.id);
                                                        }
                                                        c[methode.titre] = tab.join(String.fromCharCode(10));
                                                        //Enregistre
                                                        base('Cours').update([{
                                                            id: c.id,
                                                            fields: {
                                                                [methode.titre]: c[methode.titre],
                                                            }
                                                        }]);
                                                    });
                                                }
                                            },
                                        ]
                                    });

                                    let indexLecon = data.findIndex(d => {
                                        for (let i = 1; i < cours.length; i++) {
                                            if (d['cours' + i]) return true;
                                        }
                                        return false;
                                    });

                                    if (indexLecon > -1) {
                                        //Classe du bouton
                                        btn.removeClass("btn-outline-primary").addClass("btn-primary");
                                        //Affiche la table
                                        div2.show();
                                        dt.columns.adjust();
                                        //Scroll à la bonne postion
                                        dt.scroller.toPosition(indexLecon);
                                    }

                                    //Affiche/cahe la table sur clic du bouton
                                    btn.click(() => {
                                        div2.toggle();
                                        dt.columns.adjust();
                                    });
                                });
                            });
                    });
            });
        });

    function chargeMethodes(returnValue) {
        return callScriptFunction('chargeMethodes', [], returnValue);
    }

    function onlyUnique(value, index, self) {
        return self.indexOf(value) === index;
    }
}

function onSignOut() {
}