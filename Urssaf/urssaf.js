//Test
// const urssaf_hostname = "https://api-edi.urssaf.fr";
// const ursaff_client_id = "09a14828-81e8-41be-b2b9-e3eadc1892fd";
// const ursaff_client_secret = "90c773dd-8cae-4194-b32e-d99e918a44e2";

//Prod
const urssaf_hostname = "https://api.urssaf.fr";
const ursaff_client_id = "3d1f5f18-4ca9-4e54-adee-64ed75fd114f";
const ursaff_client_secret = "fed5ce01-f64f-4c7c-9bd9-a8f696678207";
const ursaff_scope = "homeplus.tiersprestations";

var Airtable = require('airtable');
var base = new Airtable({ apiKey: 'pat46BvQIm5vUxUCs.f2a3d86527e0ffe5583ce682abf934aae0d2fd3fb9ebb017eb89e6ca47647341' }).base('appYxDSaRNTNnDPPI');

const MOYEN_PAIEMENT_URSSAF = "Avance Immédiate";

/**
 * Obtient le jeton d'accès aux services
 */
async function getAccessToken() {
    //Regarde d'abord dans le cache
    var token = getFromCache("urssaf_token");
    if (token) return token;

    //Pas dans le cache : demande un token
    return fetch(
        urssaf_hostname + "/api/oauth/v1/token",
        {
            method: "post",
            headers: {
                Authorization: "Basic " + btoa(ursaff_client_id + ":" + ursaff_client_secret),
                "Content-Type": "application/x-www-form-urlencoded"
            },
            body: "grant_type=client_credentials&scope=" + ursaff_scope,
        }).then(response => response.json())
        .then(content => {
            console.log(content);

            //Met le token en cache
            putInCache("urssaf_token", content.access_token, content.expires_in)

            return content.access_token;
        });
}

function inscrireClient(token, idClient) {
    //Charge le client
    base('Client').find(idClient, function (err, client) {
        if (err) { console.error(err); return; }

        //Prépare les données
        const civilite = (client.get("Titre") == "M." ? "1" : "2");

        var codeDepartementNaissance;
        var communeNaissance;

        if (client.get("PaysNaissance") == "France") {
            const codeCommuneNaissanceEntier = client.get("CodeCommuneNaissance").padStart(6, "0");
            codeDepartementNaissance = codeCommuneNaissanceEntier.substring(0, 3);
            const codeCommuneNaissance = codeCommuneNaissanceEntier.substring(3, 6);
            communeNaissance = {
                codeCommune: codeCommuneNaissance,
                libelleCommune: client.get("LibelleCommuneNaissance"),
            }
        }

        const nom = client.get("Nom").normalize("NFD").replace(/[\u0300-\u036f]/g, "").toUpperCase();
        const nomNaissance = client.get("NomNaissance") && client.get("NomNaissance").normalize("NFD").replace(/[\u0300-\u036f]/g, "").toUpperCase();
        const prenom = client.get("Prenom").normalize("NFD").replace(/[\u0300-\u036f]/g, "");

        /**@type InputParticulierDTO*/
        const inputParticulier = {
            civilite: civilite,
            nomNaissance: (nomNaissance || nom),
            nomUsage: nom,
            prenoms: prenom,
            dateNaissance: moment(client.get("DateNaissance")).format("YYYY-MM-DD") + "T00:00:00.000Z",
            lieuNaissance: {
                codePaysNaissance: codeInseePays(client.get("PaysNaissance")),
                departementNaissance: codeDepartementNaissance,
                communeNaissance: communeNaissance,
            },
            numeroTelephonePortable: client.get("Telephone"),
            adresseMail: client.get("Mail"),
            adressePostale: {
                numeroVoie: client.get("NumeroVoie"),
                lettreVoie: codeLettreVoie(client.get("LettreVoie")),
                codeTypeVoie: codeTypeVoie(client.get("TypeVoie")),
                libelleVoie: client.get("LibelleVoie"),
                complement: client.get("Complement"),
                lieuDit: client.get("LieuDit"),
                libelleCommune: client.get("LibelleCommune"),
                codeCommune: client.get("CodeCommune"),
                codePostal: client.get("CodePostal"),
                codePays: "99100",
            },
            coordonneeBancaire: {
                bic: client.get("Bic"),
                iban: client.get("Iban"),
                titulaire: client.get("Titulaire"),
            },
        };

        console.log(JSON.stringify(inputParticulier));

        fetch(
            urssaf_hostname + "/atp/v1/tiersPrestations/particulier",
            {
                method: "post",
                headers: {
                    "Content-Type": "application/json",
                    Accept: "application/json",
                    Authorization: "Bearer " + token,
                },
                body: JSON.stringify(inputParticulier),
            }).then(response => response.json())
            .then(
                /**@param {OutputParticulierDTO} output*/
                output => {
                    console.log(output);

                    //Enregistre l'ID et la date
                    if (output && output.idClient) {
                        base('Client').update([{
                            id: idClient,
                            fields: {
                                IdUrssaf: output.idClient,
                                DateUrssaf: moment().format("YYYY-MM-DD"),
                                MoyenPaiement: MOYEN_PAIEMENT_URSSAF,
                            }
                        }]);

                        document.writeln("Inscription OK");
                    }
                    else {
                        document.writeln("Erreur lors de l'inscription");
                    }
                });
    });
}

/**
 * Vérifier le statut d'un client auprès de l'URSSAF
 * @param {string} token
 * @param {string} idClient
 */
function statutClient(token, idClient) {
    //Charge le client
    base('Client').find(idClient, function (err, record) {
        if (err) { console.error(err); return; }
        console.log(record);

        const idUrssaf = record.get("IdUrssaf");
        console.log(idUrssaf);

        fetch(
            urssaf_hostname + "/atp/v1/tiersPrestations/particulier?idClient=" + idUrssaf,
            {
                method: "get",
                headers: {
                    Accept: "application/json",
                    Authorization: "Bearer " + token,
                },
            }).then(response => response.json())
            .then(
                /**@param {OutputParticulierSimpleDTO} output*/
                output => {
                    console.log(output);
                    //Affiche les informations de statut
                    if (output && output.idClient && output.statut.code) {
                        document.writeln(output.statut.code + " " + output.statut.description + " " + output.statut.etat);
                    }
                    else {
                        document.writeln("Erreur lors de la récupération du statut");
                    }
                });
    });
}

function transmettreDemandePaiements(token, idFacture) {
    //Charge la facture
    base('Facture').find(idFacture, function (err, recordFacture) {
        const facture = {
            Client: recordFacture.get("Client"),
            Numero: recordFacture.get("Numero"),
            Date: recordFacture.get("Date"),
            Montant: recordFacture.get("Montant"),
        };

        //Charge le client
        base('Client').select({
            fields: ["IdUrssaf", "DateNaissance"],
            filterByFormula: '{NomFacture} = "' + facture.Client[0] + '"',
            maxRecords: 1
        }).firstPage((err, clients) => {
            console.log(clients);
            clients.forEach(recordClient => {
                const client = {
                    IdUrssaf: recordClient.get("IdUrssaf"),
                    DateNaissance: recordClient.get("DateNaissance"),
                };
                console.log(client);
                //Charge les cours
                var cours = [];
                base('Cours').select({
                    fields: ["Date", "Prix", "Service"],
                    filterByFormula: "{NumeroFacture}=" + facture.Numero,
                    sort: [{ field: "Date", direction: "asc" }]
                }).eachPage(function page(records, fetchNextPage) {
                    records.forEach(record => {
                        cours.push({
                            Date: record.get("Date"),
                            Prix: record.get("Prix"),
                            Service: record.get("Service"),
                        });
                    });
                    fetchNextPage();
                }).then(() => {
                    console.log(cours);
                    /**@type InputDemandePaiement*/
                    var inputDemandePaiement = {
                        idTiersFacturation: "clairebajard.violon",
                        idClient: client.IdUrssaf,
                        dateNaissanceClient: moment(client.DateNaissance).format("YYYY-MM-DD") + "T00:00:00.000Z",
                        numFactureTiers: facture.Numero,
                        dateFacture: facture.Date + "T00:00:00.000Z",
                        dateDebutEmploi: cours[0].Date,
                        dateFinEmploi: cours[cours.length - 1].Date,
                        mntFactureTTC: facture.Montant,
                        mntFactureHT: facture.Montant,
                        inputPrestations: cours.map(c => {
                            /**@type InputPrestation*/
                            let prestation = {
                                codeNature: "100",
                                quantite: 1,
                                unite: "FORFAIT",
                                mntUnitaireTTC: c.Prix,
                                mntPrestationTTC: c.Prix,
                                mntPrestationHT: c.Prix,
                                mntPrestationTVA: 0,
                                complement1: moment(airtableToDate(c.Date)).format("DD/MM/YYYY HH:mm"),
                                complement2: "SAP852330992",
                            };
                            return prestation;
                        })
                    };

                    console.log(JSON.stringify([inputDemandePaiement]));

                    fetch(
                        urssaf_hostname + "/atp/v1/tiersPrestations/demandePaiement",
                        {
                            method: "post",
                            headers: {
                                "Content-Type": "application/json",
                                Accept: "application/json",
                                Authorization: "Bearer " + token,
                            },
                            body: JSON.stringify([inputDemandePaiement]),
                        }).then(response => response.json())
                        .then(
                            /**@param {OutputDemandePaiement} output*/
                            output => {
                                console.log(output);

                                if (output && output.length > 0 && output[0].idDemandePaiement) {
                                    base('Facture').update([{
                                        id: idFacture,
                                        fields: {
                                            IdUrssaf: output[0].idDemandePaiement,
                                            StatutUrssaf: statut(output[0].statut),
                                        }
                                    }]);
                                }

                                if (output && output.length > 0 && output[0].idDemandePaiement) {
                                    document.writeln("Facture transmise OK");
                                }
                                else {
                                    document.writeln(JSON.stringify(output));
                                }
                            });
                });
            });
        });
    });
}

function transmettreFactures(token) {
    //Charge les factures
    base('Facture').select({
        fields: [],
        filterByFormula: "AND({Client}!='',{MoyenPaiement}='" + MOYEN_PAIEMENT_URSSAF + "',{IdUrssaf}='')"
    }).eachPage(function page(records, fetchNextPage) {
        if (records.length) {
            records.forEach(f => {
                transmettreDemandePaiements(token, f.id);
            });

            fetchNextPage();
        }
        else{
            document.writeln("Aucune facture à traiter");
        }
    });
}

function majInfoDemandePaiements(token, idFacture) {
    //Charge la facture
    base('Facture').find(idFacture, function (err, record) {
        const idUrssaf = record.get("IdUrssaf");
        console.log(idUrssaf);

        /**@type InputRechercheDemandePaiement*/
        var inputRechercheDemandePaiement = {
            idDemandePaiements: [idUrssaf],
        }

        console.log(inputRechercheDemandePaiement);

        fetch(
            urssaf_hostname + "/atp/v1/tiersPrestations/demandePaiement/rechercher",
            {
                method: "post",
                headers: {
                    "Content-Type": "application/json",
                    Accept: "application/json",
                    Authorization: "Bearer " + token,
                },
                body: JSON.stringify(inputRechercheDemandePaiement),
            }).then(response => response.json())
            .then(
                /**@param {OutputRechercheDemandePaiement} output*/
                output => {
                    console.log(output);

                    if (output && output.infoDemandePaiements.length > 0 && output.infoDemandePaiements[0] && output.infoDemandePaiements[0].statut) {
                        const info = output.infoDemandePaiements[0];

                        var dateVirementEstPassee = false;
                        if (info.infoVirement && info.infoVirement.dateVirement) {
                            dateVirementEstPassee = moment().isSameOrAfter(info.infoVirement.dateVirement, "day");
                        }

                        //Enregistre le statut
                        base('Facture').update([{
                            id: idFacture,
                            fields: {
                                StatutUrssaf: statut(info.statut.code),
                                Paye: ((info.statut.code == '70') && dateVirementEstPassee),
                                DateEncaissement: (info.statut.code == '70') ? moment(info.infoVirement.dateVirement).format("YYYY-MM-DD") : undefined,
                            }
                        }]);
                    }

                    //Affiche du résultat
                    if (!output.infoDemandePaiements) {
                        //Pas d'info : affiche le JSON
                        console.log(JSON.stringify(output));
                    }

                    const info = output.infoDemandePaiements[0];
                    var txt = "Statut : " + statut(info.statut.code) + "\n";

                    if (info.infoRejet) {
                        txt += "Rejet : " + info.infoRejet.code + " - " + infoRejet(info.infoRejet.code) + "\n";
                        txt += "Commentaire client : " + info.infoRejet.commentaire + "\"n";
                    }

                    if (info.infoVirement) {
                        txt += "Virement : ";
                        if (info.infoVirement.mntVirement) {
                            txt += info.infoVirement.mntVirement + "€ ";
                        }
                        if (info.infoVirement.dateVirement) {
                            txt += "le " + moment(info.infoVirement.dateVirement).format("DD/MM/YYYY");
                        }
                    }

                    document.writeln(record.get("Client") + " Facture " + record.get("Numero"));
                    document.writeln(txt);
                    document.writeln("<br/>");
                });
    });
}

function traitementUrssaf(token) {
    //MAJ le statut des factures
    base('Facture').select({
        fields: [],
        filterByFormula: "AND({IdUrssaf}!='', {Paye}=FALSE())"
    }).eachPage(function page(records, fetchNextPage) {
        if (records.length) {
            records.forEach(f => {
                majInfoDemandePaiements(token, f.id);
            });

            fetchNextPage();
        }
        else{
            document.writeln("Aucune facture à traiter");
        }
    });
}

getAccessToken().then(token => {
    //Client
    // - Inscrire + IdClient
    // - Statut + IdClient

    //Facture
    // - Transmettre + IdFacture
    // - MAJ Statut + IdFacture
    
    //Toutes les factures
    // - Transmettre
    // - MAJ Statut

    const urlParams = new URLSearchParams(window.location.search);
    const method = urlParams.get('method');
    const idClient = urlParams.get('idClient');
    const idFacture = urlParams.get('idFacture');
    switch (method) {
        //Client
        case "inscrireClient": inscrireClient(token, idClient); break;
        case "statutClient": statutClient(token, idClient); break;
        //Facture
        case "transmettreDemandePaiements": transmettreDemandePaiements(token, idFacture); break;
        case "majInfoDemandePaiements": majInfoDemandePaiements(token, idFacture); break;
        //Toutes les factures
        case "transmettreFactures": transmettreFactures(token); break;
        case "majStatutFactures": majStatutFactures(token); break;
        default: console.log("méthode inconnue : " + method);
    }
});