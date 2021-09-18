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

    /**
     * Liste des rdvs par jour
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

    /**
     * Liste des trajets
     * @typedef {Object} Trajet
     * @property {number} jour Numéro de jour (0=Lundi, 6=Dimanche)
     * @property {number} heure Heure décimale arrondie au quart d'heure. Ex : 8.25 = 8h15
     * @property {number} duree Durée en heure décimale. Ex : 0.25 = 15 minutes
     * @property {Object} div
     */
    /** @type{Trajet[]} */
    var trajets = []

    //Cache des informations de trajet
    //var cachetrajets = eval(window.localStorage.getItem("trajets")) || [];

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
            let adresseOrigine = adresseMaison;
            let momentFinCoursPrecedent = null;

            rdvs.filter(x => x.jour == j)
                .forEach(rdv => {
                    let momentDebutCours = moment().weekday(j).hour(rdv.heure).minute((rdv.heure % 1) * 60).second(0).millisecond(0);

                    //Teste si on fait un trajet de retour du cours précédent
                    if (momentFinCoursPrecedent && momentDebutCours.diff(momentFinCoursPrecedent, "hour", true) > 1) {
                        //calcule le temps et la distance
                        let trajet = {
                            origine: adresseOrigine,
                            destination: adresseMaison,
                            jour: j,
                            heure: momentFinCoursPrecedent.hour() + momentFinCoursPrecedent.minute() / 60,
                            type: "D",//Départ
                            value: null
                        };
                        trouveTrajet(adresseOrigine, adresseMaison, trajet)
                            .then(t => {
                                //enregistre le trajet  
                                ajouteTrajet({ ...trajet, duree: t.duree, distance: t.distance });
                            });
                        adresseOrigine = adresseMaison;
                        momentFinCoursPrecedent = null;
                    }

                    //Trajet vers le cours
                    let adresseDestination = rdv.adresse;

                    //calcule le temps et la distance
                    {
                        let trajet = {
                            origine: adresseOrigine,
                            destination: adresseDestination,
                            jour: j,
                            heure: momentDebutCours.hour() + momentDebutCours.minute() / 60,
                            type: "A",//Arrivée
                            value: null
                        };
                        trouveTrajet(adresseOrigine, adresseDestination, trajet)
                            .then(t => {
                                //enregistre le trajet  
                                ajouteTrajet({ ...trajet, duree: t.duree, distance: t.distance });
                            });
                    }

                    //Prépare le prochain cours
                    adresseOrigine = adresseDestination;
                    momentFinCoursPrecedent = momentDebutCours.add(rdv.duree, 'hour');
                });

            //Trajet retour
            if (momentFinCoursPrecedent) {
                //calcule le temps et la distance
                let trajet = {
                    origine: adresseOrigine,
                    destination: adresseMaison,
                    jour: j,
                    heure: momentFinCoursPrecedent.hour() + momentFinCoursPrecedent.minute() / 60,
                    type: "D",
                    value: null
                };
                trouveTrajet(adresseOrigine, adresseMaison, trajet)
                    .then(t => {
                        //enregistre le trajet  
                        ajouteTrajet({ ...trajet, duree: t.duree, distance: t.distance });
                    });
            }
        }
    }

    /**
     * Trouve le temps et la distance du trajet mini
     * @param {string} adresseOrigine
     * @param {string} adresseDestination
     */
    function trouveTrajet(adresseOrigine, adresseDestination) {
        //Interroge d'abord le cache
        var trajet = window.localStorage.getItem("trajet_" + adresseOrigine + "_" + adresseDestination);
        if (trajet) {
            return Promise.resolve(JSON.parse(trajet));
        }
        else {
            //Iterroge Google Maps
            return callScriptFunction('trouveTrajetExt', [adresseOrigine, adresseDestination]).then(
                trajet => {
                    if (trajet) {
                        //Met en cache
                        window.localStorage.setItem("trajet_" + adresseOrigine + "_" + adresseDestination, JSON.stringify(trajet));
                        return trajet;
                    }
                    else {
                        return {
                            duree: 15,
                            distance: 15,
                        }
                    }
                }
            );
        }
    }

    //Ordonne les rdv
    function compareRdv(x, y) {
        var ordreJour = x.jour - y.jour;
        if (ordreJour) return ordreJour
        else return x.heure - y.heure;
    }

    /**
     * Ajoute le trajet à la liste
     * @param {Trajet} trajet 
     */
    function ajouteTrajet(trajet) {
        //console.log(trajet);
        trajets.push(trajet);

        let div = $("<div />");
        div.addClass("trajet");
        div.css("left", $("#j" + trajet.jour).position().left);
        div.css("width", $("#td080").css("width"));

        var diff;
        if (trajet.type == "D") {
            diff = 0;
        }
        else {
            diff = trajet.duree * 9 * 4 / 60;
        }

        div.css("top", $("#td" + trajet.jour + Math.floor(trajet.heure) + trajet.heure % 1 * 100).position().top - diff);
        div.css("height", 9 * 4 * trajet.duree / 60);

        //div.append(trajet.duree + " - " + trajet.distance);

        $("table").append(div);
    }
}