function onSignOut() { }

function onSignIn() {
    const adresseMaison = "20 rue Gaucher de Rochefort, 45650 Saint-Jean-Le-Blanc, France";

    //Créé le calendrier
    for (let heure = 8; heure < 21; heure += 0.25) {
        let tr = $("<tr/>");
        if (Number.isInteger(heure + .25)) {
            tr.addClass("border-dark");
        }

        let tdHeure = $("<td />");
        if (Number.isInteger(heure)) {
            tdHeure.prop("rowspan", 4);
            tdHeure.addClass("border-dark");
            tdHeure.append(heure + "h");
            tr.append(tdHeure);
        }

        for (let jour = 0; jour < 7; jour++) {
            let tdJour = $("<td/>");
            tdJour.prop("id", "td" + jour + Math.floor(heure) + heure % 1 * 100);
            tdJour.addClass("h border-start");
            tr.append(tdJour);
        }

        $("#calBody").append(tr);
    }

    $("tbody").droppable({
        drop: function (event, ui) {
            //Enregistre le nouveau jour/heure
            var rdv = ui.draggable.prop("rdv");
            rdv.jour = Math.floor((ui.position.left + 50) / 200)
            rdv.heure = 8 + Math.floor((ui.position.top - $("#td080").position().top) / 9) / 4;

            //Affichage
            ui.draggable.css("left", rdv.jour * 200 + 50);
            ui.draggable.css("top", ui.position.top);


            //Recalcule les trajets
            calculeTrajets();
        }
    });

    //Liste des rdvs par jour
    /**
     * @typedef {Object} Rdv
     * @property {number} jour Numéro de jour (0=Lundi, 6=Dimanche)
     * @property {number} heure Heure décimale arrondie au quart d'heure. Ex : 8.25 = 8h15
     * @property {number} duree Durée en heure décimale. Ex : 0.75 = 45 minutes
     * @property {string} client Nom du client
     * @property {string} adresse Adresse du client
     * @property {Object} div
     */
    /** @type{Rdv[]} */
    var rdvs = [];
    var rdvLoaded = false;

    //Cache des informations de trajet
    var trajets = eval(window.localStorage.getItem("trajets")) || [];

    /**
     * Ajoute un rendez-vous sur le calendrier
     * @param {Rdv} rdv Données du RDV
     */
    function ajouteRdv(rdv) {
        rdvs.push(rdv);

        let div = $("<div />");
        div.addClass("rdv");
        div.css("left", $("#j" + rdv.jour).position().left);
        div.css("top", $("#td" + rdv.jour + Math.floor(rdv.heure) + rdv.heure % 1 * 100).position().top);
        div.css("width", $("#td080").css("width"));
        div.css("height", 9 * 4 * rdv.duree);
        div.append(rdv.client);
        div.prop("title", rdv.adresse);

        $("table").append(div);

        div.draggable({
            cursor: "move",
            containment: [50, 36, 200 * 6 + 50, 9 * 13 * 4 + 9],
            snap: "td.h",
            helper: "clone",
            revert: "invalid",
            start: function (event, ui) {
                $(this).addClass("opacity-25")
            },
            stop: function (event, ui) {
                $(this).removeClass("opacity-25")
            }
        });

        //Associe les données du rdv au DIV
        div.prop("rdv", rdv);
        //Et inversement
        rdv.div = div;
    }

    //Ajoute les rdv
    var Airtable = require('airtable');
    var base = new Airtable({ apiKey: 'key5XoJsw8IpLR7OK' }).base('appYxDSaRNTNnDPPI');
    //Charge les clients
    base('Client').select({
        fields: ['Name', 'JourCours', 'HeureCours', 'DureeCours', 'AdresseCours', 'Adresse1', 'Adresse2'],
        filterByFormula: 'AND({Actif}=TRUE(), {JourCours}!="", {HeureCours}!="")'
    }).eachPage(function page(records, fetchNextPage) {
        records.forEach(function (record) {

            let h = moment(record.get('HeureCours'), "HH:mm");
            let rdv = {
                jour: moment().day(record.get('JourCours')).weekday(),
                heure: h.hour() + h.minute() / 60,
                duree: record.get('DureeCours'),
                client: record.get('Name'),
                adresse: isnull(record.get('AdresseCours'), record.get('Adresse1') + ' ' + record.get('Adresse2')),
            }

            ajouteRdv(rdv);

        });
        fetchNextPage();
    }, function done(err) {
        if (err) { console.error(err); return; }

        calculeTrajets();
    });

    function isnull(value, replace) {
        if (value)
            return value;
        else
            return replace;
    }

    function calculeTrajets() {
        //Ordonne les rdv
        rdvs.sort(compareRdv);

        for (let j = 0; j < 7; j++) {
            let adresseDepart = adresseMaison;
            let momentDepart = null;

            rdvs.filter(x => x.jour == j)
                .forEach(rdv => {
                    let momentDestination = moment().weekday(j).hour(rdv.heure).minute((rdv.heure % 1) * 60).second(0).millisecond(0);

                    //Teste si on fait un trajet de retour du cours précédent
                    if (momentDepart && momentDestination.diff(momentDepart, "hour", true) > 1) {
                        //calcule le temps et la distance
                        let trajet = {
                            origine: adresseDepart,
                            destination: adresseMaison,
                            value: null
                        };
                        trouveTrajet(adresseDepart, adresseMaison, trajet)
                            .then(() => {
                                console.log(trajet.origine, trajet.destination, trajet.value.duree);
                                //enregistre le trajet  
                                //distanceTotale += trajet.distance;
                            });
                        adresseDepart = adresseMaison;
                        momentDepart = null;
                    }

                    //Trajet vers le cours
                    let adresseDestination = rdv.adresse;

                    //calcule le temps et la distance
                    {
                        let trajet = {
                            origine: adresseDepart,
                            destination: adresseDestination,
                            value: null
                        };
                        trouveTrajet(adresseDepart, adresseDestination, trajet)
                            .then(() => {
                                console.log(trajet.origine, trajet.destination, trajet.value.duree);
                                //enregistre le trajet  
                                //distanceTotale += trajet.distance;
                            });
                    }

                    //Prépare le prochain cours
                    adresseDepart = adresseDestination;
                    momentDepart = momentDestination.add(rdv.duree, 'hour');
                });

            //Trajet retour
            //calcule le temps et la distance
            {
                let trajet = {
                    origine: adresseDepart,
                    destination: adresseMaison,
                    value: null
                };
                trouveTrajet(adresseDepart, adresseMaison, trajet)
                    .then(() => {
                        console.log(trajet.origine, trajet.destination, trajet.value.duree);
                        //enregistre le trajet  
                        //distanceTotale += trajet.distance;
                    });
            }
        }
    }

    /**
     * Trouve le temps et la distance du trajet mini
     * @param {string} adresseOrigine
     * @param {string} adresseDestination
     * @param {objet} returnValue
     */
    function trouveTrajet(adresseOrigine, adresseDestination, returnValue) {
        return callScriptFunction('trouveTrajetExt', [adresseOrigine, adresseDestination], returnValue);
    }

    //Ordonne les rdv
    function compareRdv(x, y) {
        var ordreJour = x.jour - y.jour;
        if (ordreJour) return ordreJour
        else return x.heure - y.heure;
    }
}