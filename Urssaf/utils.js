function putInCache(key, value, ttl) {
    const now = new Date()

    // `item` is an object which contains the original value
    // as well as the time when it's supposed to expire
    const item = {
        value: value,
        expiry: now.getTime() + ttl * 1000,
    }
    localStorage.setItem(key, JSON.stringify(item))
}

function getFromCache(key) {
    const itemStr = localStorage.getItem(key)

    // if the item doesn't exist, return null
    if (!itemStr) {
        return null
    }

    const item = JSON.parse(itemStr)
    const now = new Date()

    // compare the expiry time of the item with the current time
    if (now.getTime() > item.expiry) {
        // If the item is expired, delete the item from storage
        // and return null
        localStorage.removeItem(key)
        return null
    }
    return item.value
}

function codeLettreVoie(lettreVoie) {
    switch (lettreVoie) {
        case "Bis": return "B";
        case "Ter": return "T";
        case "Quater": return "Q";
        case "Quinquiès": return "C";
        default: return "";
    }
}

/**
 * Récupère le code du type de voie
 * @param {string} typeVoie
 */
function codeTypeVoie(typeVoie) {
    switch (typeVoie) {
        case "Allée": return "ALL";
        case "Avenue": return "AV";
        case "Batiment": return "BAT";
        case "Boulevard": return "BD";
        case "Cours": return "C";
        case "Canal": return "CAN";
        case "Chemin": return "CHE";
        case "Chaussée": return "CHS";
        case "Cité": return "CI";
        case "Clos": return "CL";
        case "Cottage": return "COG";
        case "Faubourg": return "FG";
        case "Hameau": return "HAM";
        case "Immeuble": return "IMB";
        case "Impasse": return "IMP";
        case "Lotissement": return "LOT";
        case "Maison": return "MAI";
        case "Montée": return "MTE";
        case "Parc": return "PAR";
        case "Passage": return "PAS";
        case "Pavillon": return "PAV";
        case "Place": return "PL";
        case "Porte": return "POR";
        case "Quai": return "Q";
        case "Quartier": return "QU";
        case "Rue": return "R";
        case "Rampe": return "RAM";
        case "Résidence": return "RES";
        case "Route": return "RTE";
        case "Ruelle": return "RUL";
        case "Sentier": return "SEN";
        case "Square": return "SQ";
        case "Voie": return "VO";
    }
}

/**
 * Décode le statut
 * @param {string} codeStatut
 * @return {string}
 */
function statut(codeStatut) {
    switch (codeStatut) {
        case "10": return "Intégrée";
        case "15": return "Aides calculées";
        case "20": return "En attente de validation";
        case "30": return "Validée";
        case "40": return "Refusée";
        case "50": return "Prélevée";
        case "60": return "En refus de prélèvement";
        case "70": return "Payée";
        case "80": return "En attente d’échanges";
        case "90": return "Clôturée";
        case "100": return "Supprimée";
        case "110": return "Annulée";
        case "120": return "Recouvrée";
        default: return codeStatut;
    }
}

/**
 * Decode le rejet
 * @param {string} codeRejet
 * @return {string}
 */
function infoRejet(codeRejet) {
    switch (codeRejet) {
        case "REGUL_MNT_FACT": return "Erreur sur le montant facturé et/ou sur le tarif indiqué pour la prestation";
        case "REGUL_NB_QTE_FACT": return "Nombre d'heures ou quantités facturées erronées";
        case "REGUL_PRESTA_FACT": return "Erreur sur les prestations facturées";
        case "REGUL_AUTRE": return "Autre";
        case "CONTEST_ERR_FACT": return "La facture comporte une erreur";
        case "CONTEST_FACT_REGLEE": return "La facture a déjà été réglée";
        case "CONTEST_AUTRE": return "Autre";
        case "ANNUL_DBL": return "Demande de paiement en doublon";
        case "ANNUL_ERR_MNT": return "Montant facturé erroné";
        case "ANNUL_ERR_TECH": return "Erreur technique";
        case "ANNUL_AUTRE": return "Autres";
        default: return "Code inconnu.";
    }
}

function codeInseePays(nomPays) {
    switch (nomPays.toUpperCase()) {
        case "FRANCE": return "99100";

        case "ACORES, MADERE": return "99319";
        case "AFGHANISTAN": return "99212";
        case "AFRIQUE DU SUD": return "99303";
        case "ALASKA": return "99404";
        case "ALBANIE": return "99125";
        case "ALGERIE": return "99352";
        case "ALLEMAGNE": return "99109";
        case "ANDORRE": return "99130";
        case "ANGOLA": return "99395";
        case "ANGUILLA": return "99425";
        case "ANTIGUA-ET-BARBUDA": return "99441";
        case "ANTILLES NEERLANDAISES": return "99431";
        case "ARABIE SAOUDITE": return "99201";
        case "ARGENTINE": return "99415";
        case "ARMENIE": return "99252";
        case "ARUBA": return "99135";
        case "AUSTRALIE": return "99501";
        case "AUTRICHE": return "99110";
        case "AZERBAIDJAN": return "99253";
        case "BAHAMAS": return "99436";
        case "BAHREIN": return "99249";
        case "BANGLADESH": return "99246";
        case "BARBADE": return "99434";
        case "BELGIQUE": return "99131";
        case "BELIZE": return "99429";
        case "BENIN": return "99327";
        case "BERMUDES": return "99425";
        case "BHOUTAN": return "99214";
        case "BIELORUSSIE": return "99148";
        case "BIRMANIE": return "99224";
        case "BOLIVIE": return "99418";
        case "BONAIRE, SAINT EUSTACHE ET SABA": return "99443";
        case "BOSNIE-HERZEGOVINE": return "99118";
        case "BOTSWANA": return "99347";
        case "BOUVET (ILE)": return "99103";
        case "BRESIL": return "99416";
        case "BRUNEI": return "99225";
        case "BULGARIE": return "99111";
        case "BURKINA": return "99331";
        case "BURUNDI": return "99321";
        case "CAIMANES (ILES)": return "99425";
        case "CAMBODGE": return "99234";
        case "CAMEROUN": return "99322";
        case "CAMEROUN ET TOGO": return "99305";
        case "CANADA": return "99401";
        case "CANARIES (ILES)": return "99313";
        case "CAP-VERT": return "99396";
        case "CENTRAFRICAINE (REPUBLIQUE)": return "99323";
        case "CHILI": return "99417";
        case "CHINE": return "99216";
        case "CHRISTMAS (ILE)": return "99501";
        case "CHYPRE": return "99254";
        case "COCOS ou KEELING (ILES)": return "99501";
        case "COLOMBIE": return "99419";
        case "COMORES": return "99397";
        case "CONGO": return "99324";
        case "CONGO (REPUBLIQUE DEMOCRATIQUE)": return "99312";
        case "COOK (ILES)": return "99502";
        case "COREE": return "99237";
        case "COREE (REPUBLIQUE DE)": return "99239";
        case "COREE (REPUBLIQUE POPULAIRE DEMOCRATIQUE DE)": return "99238";
        case "COSTA RICA": return "99406";
        case "COTE D'IVOIRE": return "99326";
        case "CROATIE": return "99119";
        case "CUBA": return "99407";
        case "CURAÇAO": return "99444";
        case "DANEMARK": return "99101";
        case "DJIBOUTI": return "99399";
        case "DOMINICAINE (REPUBLIQUE)": return "99408";
        case "DOMINIQUE": return "99438";
        case "EGYPTE": return "99301";
        case "EL SALVADOR": return "99414";
        case "EMIRATS ARABES UNIS": return "99247";
        case "EQUATEUR": return "99420";
        case "ERYTHREE": return "99317";
        case "ESPAGNE": return "99134";
        case "ESTONIE": return "99106";
        case "ESWATINI": return "99391";
        case "ETATS MALAIS NON FEDERES": return "99228";
        case "ETATS-UNIS": return "99404";
        case "ETHIOPIE": return "99315";
        case "FEROE (ILES)": return "99101";
        case "FIDJI": return "99508";
        case "FINLANDE": return "99105";
        case "GABON": return "99328";
        case "GAMBIE": return "99304";
        case "GEORGIE": return "99255";
        case "GEORGIE DU SUD ET LES ILES SANDWICH DU SUD": return "99427";
        case "GHANA": return "99329";
        case "GIBRALTAR": return "99133";
        case "GOA": return "99223";
        case "GRECE": return "99126";
        case "GRENADE": return "99435";
        case "GROENLAND": return "99430";
        case "GUAM": return "99505";
        case "GUATEMALA": return "99409";
        case "GUERNESEY": return "99132";
        case "GUINEE": return "99330";
        case "GUINEE EQUATORIALE": return "99314";
        case "GUINEE-BISSAU": return "99392";
        case "GUYANA": return "99428";
        case "HAITI": return "99410";
        case "HAWAII (ILES)": return "99504";
        case "HEARD ET MACDONALD (ILES)": return "99501";
        case "HONDURAS": return "99411";
        case "HONG-KONG": return "99230";
        case "HONGRIE": return "99112";
        case "ILES PORTUGAISES DE L'OCEAN INDIEN": return "99320";
        case "INDE": return "99223";
        case "INDONESIE": return "99231";
        case "IRAN": return "99204";
        case "IRAQ": return "99203";
        case "IRLANDE, ou EIRE": return "99136";
        case "ISLANDE": return "99102";
        case "ISRAEL": return "99207";
        case "ITALIE": return "99127";
        case "JAMAIQUE": return "99426";
        case "JAPON": return "99217";
        case "JERSEY": return "99132";
        case "JORDANIE": return "99222";
        case "KAMTCHATKA": return "99211";
        case "KAZAKHSTAN": return "99256";
        case "KENYA": return "99332";
        case "KIRGHIZISTAN": return "99257";
        case "KIRIBATI": return "99513";
        case "KOSOVO": return "99157";
        case "KOWEIT": return "99240";
        case "LABRADOR": return "99403";
        case "LAOS": return "99241";
        case "LESOTHO": return "99348";
        case "LETTONIE": return "99107";
        case "LIBAN": return "99205";
        case "LIBERIA": return "99302";
        case "LIBYE": return "99316";
        case "LIECHTENSTEIN": return "99113";
        case "LITUANIE": return "99108";
        case "LUXEMBOURG": return "99137";
        case "MACAO": return "99232";
        case "MACEDOINE DU NORD": return "99156";
        case "MADAGASCAR": return "99333";
        case "MALAISIE": return "99227";
        case "MALAWI": return "99334";
        case "MALDIVES": return "99229";
        case "MALI": return "99335";
        case "MALOUINES, OU FALKLAND (ILES)": return "99427";
        case "MALTE": return "99144";
        case "MAN (ILE)": return "99132";
        case "MANDCHOURIE": return "99218";
        case "MARIANNES DU NORD (ILES)": return "99505";
        case "MAROC": return "99350";
        case "MARSHALL (ILES)": return "99515";
        case "MAURICE": return "99390";
        case "MAURITANIE": return "99336";
        case "MEXIQUE": return "99405";
        case "MICRONESIE (ETATS FEDERES DE)": return "99516";
        case "MOLDAVIE": return "99151";
        case "MONACO": return "99138";
        case "MONGOLIE": return "99242";
        case "MONTENEGRO": return "99120";
        case "MONTSERRAT": return "99425";
        case "MOZAMBIQUE": return "99393";
        case "NAMIBIE": return "99311";
        case "NAURU": return "99507";
        case "NEPAL": return "99215";
        case "NICARAGUA": return "99412";
        case "NIGER": return "99337";
        case "NIGERIA": return "99338";
        case "NIUE": return "99502";
        case "NORFOLK (ILE)": return "99501";
        case "NORVEGE": return "99103";
        case "NOUVELLE-ZELANDE": return "99502";
        case "OCEAN INDIEN (TERRITOIRE BRITANNIQUE DE L')": return "99308";
        case "OMAN": return "99250";
        case "OUGANDA": return "99339";
        case "OUZBEKISTAN": return "99258";
        case "PAKISTAN": return "99213";
        case "PALAOS (ILES)": return "99517";
        case "PALESTINE (Etat de)": return "99261";
        case "PANAMA": return "99413";
        case "PAPOUASIE-NOUVELLE-GUINEE": return "99510";
        case "PARAGUAY": return "99421";
        case "PAYS-BAS": return "99135";
        case "PEROU": return "99422";
        case "PHILIPPINES": return "99220";
        case "PITCAIRN (ILE)": return "99503";
        case "POLOGNE": return "99122";
        case "PORTO RICO": return "99432";
        case "PORTUGAL": return "99139";
        case "POSSESSIONS BRITANNIQUES AU PROCHE-ORIENT": return "99221";
        case "PRESIDES": return "99313";
        case "PROVINCES ESPAGNOLES D'AFRIQUE": return "99313";
        case "QATAR": return "99248";
        case "REPUBLIQUE DEMOCRATIQUE ALLEMANDE": return "99141";
        case "REPUBLIQUE FEDERALE D'ALLEMAGNE": return "99142";
        case "ROUMANIE": return "99114";
        case "ROYAUME-UNI": return "99132";
        case "RUSSIE": return "99123";
        case "RWANDA": return "99340";
        case "SAHARA OCCIDENTAL": return "99389";
        case "SAINT-CHRISTOPHE-ET-NIEVES": return "99442";
        case "SAINT-MARIN": return "99128";
        case "SAINT-MARTIN (PARTIE NEERLANDAISE)": return "99445";
        case "SAINT-VINCENT-ET-LES GRENADINES": return "99440";
        case "SAINTE HELENE, ASCENSION ET TRISTAN DA CUNHA": return "99306";
        case "SAINTE-LUCIE": return "99439";
        case "SALOMON (ILES)": return "99512";
        case "SAMOA AMERICAINES": return "99505";
        case "SAMOA OCCIDENTALES": return "99506";
        case "SAO TOME-ET-PRINCIPE": return "99394";
        case "SENEGAL": return "99341";
        case "SERBIE": return "99121";
        case "SEYCHELLES": return "99398";
        case "SIBERIE": return "99209";
        case "SIERRA LEONE": return "99342";
        case "SINGAPOUR": return "99226";
        case "SLOVAQUIE": return "99117";
        case "SLOVENIE": return "99145";
        case "SOMALIE": return "99318";
        case "SOUDAN": return "99343";
        case "SOUDAN ANGLO-EGYPTIEN, KENYA, OUGANDA": return "99307";
        case "SOUDAN DU SUD": return "99349";
        case "SRI LANKA": return "99235";
        case "SUEDE": return "99104";
        case "SUISSE": return "99140";
        case "SURINAME": return "99437";
        case "SVALBARD et ILE JAN MAYEN": return "99103";
        case "SYRIE": return "99206";
        case "TADJIKISTAN": return "99259";
        case "TAIWAN": return "99236";
        case "TANGER": return "99325";
        case "TANZANIE": return "99309";
        case "TCHAD": return "99344";
        case "TCHECOSLOVAQUIE": return "99115";
        case "TCHEQUIE": return "99116";
        case "TERR. DES ETATS-UNIS D'AMERIQUE EN AMERIQUE": return "99432";
        case "TERR. DES ETATS-UNIS D'AMERIQUE EN OCEANIE": return "99505";
        case "TERR. DU ROYAUME-UNI DANS L'ATLANTIQUE SUD": return "99427";
        case "TERRE-NEUVE": return "99402";
        case "TERRITOIRES DU ROYAUME-UNI AUX ANTILLES": return "99425";
        case "THAILANDE": return "99219";
        case "TIMOR ORIENTAL": return "99262";
        case "TOGO": return "99345";
        case "TOKELAU": return "99502";
        case "TONGA": return "99509";
        case "TRINITE-ET-TOBAGO": return "99433";
        case "TUNISIE": return "99351";
        case "TURKESTAN RUSSE": return "99210";
        case "TURKMENISTAN": return "99260";
        case "TURKS ET CAIQUES (ILES)": return "99425";
        case "TURQUIE": return "99208";
        case "TURQUIE D'EUROPE": return "99124";
        case "TUVALU": return "99511";
        case "UKRAINE": return "99155";
        case "URUGUAY": return "99423";
        case "VANUATU": return "99514";
        case "VATICAN, ou SAINT-SIEGE": return "99129";
        case "VENEZUELA": return "99424";
        case "VIERGES BRITANNIQUES (ILES)": return "99425";
        case "VIERGES DES ETATS-UNIS (ILES)": return "99432";
        case "VIET NAM": return "99243";
        case "VIET NAM DU NORD": return "99244";
        case "VIET NAM DU SUD": return "99245";
        case "YEMEN": return "99251";
        case "YEMEN (REPUBLIQUE ARABE DU)": return "99202";
        case "YEMEN DEMOCRATIQUE": return "99233";
        case "ZAMBIE": return "99346";
        case "ZANZIBAR": return "99308";
        case "ZIMBABWE": return "99310";
    }
}

/**
 * @typedef {Object} InputParticulierDTO
 * @property {string} civilite 1 = masculin (Monsieur) ou 2 = féminin (Madame)
 * @property {string} nomNaissance
 * @property {string} nomUsage
 * @property {string} prenoms
 * @property {string} dateNaissance '1980-03-29T00:00:00.000Z'
 * @property {InputLieuNaissanceDTO} lieuNaissance
 * @property {string} numeroTelephonePortable ^(0|\+33)[6-7]([0-9]{2}){4}$
 * @property {string} adresseMail
 * @property {InputAdresseDTO} adressePostale
 * @property {InputCoordonneeBancaireDTO} coordonneeBancaire
 *
 * @typedef {Object} InputLieuNaissanceDTO
 * @property {string} codePaysNaissance '99100' pour la France
 * @property {string} departementNaissance '45' pour Loiret
 * @property {InputCommuneDTO} communeNaissance
 *
 * @typedef {Object} InputCommuneDTO
 * @property {string} codeCommune code INSEE https://public.opendatasoft.com/explore/dataset/correspondance-code-insee-code-postal/table/
 * @property {string} libelleCommune
 *
 * @typedef {Object} InputAdresseDTO
 * @property {string} numeroVoie
 * @property {string} lettreVoie (Facultatif) B pour Bis, T pour Ter, Q pour Quater, C pour Quinquiès
 * @property {string} codeTypeVoie https://portailapi.urssaf.fr/images/Documentation/Documentation-API-TiersPrestation_v1-1-1.pdf
 * @property {string} libelleVoie
 * @property {string} complement (Facultatif)
 * @property {string} lieuDit (Facultatif)
 * @property {string} libelleCommune https://public.opendatasoft.com/explore/dataset/correspondance-code-insee-code-postal/table/
 * @property {string} codeCommune code INSEE https://public.opendatasoft.com/explore/dataset/correspondance-code-insee-code-postal/table/
 * @property {string} codePostal
 * @property {string} codePays
 *
 * @typedef {Object} InputCoordonneeBancaireDTO
 * @property {string} bic BNAPFRPPXXX
 * @property {string} IBAN FR7630006000011234567890189
 * @property {string} titulaire Mme Jeanne Martin
 *
 * @typedef {Object} OutputParticulierDTO
 * @property {string} idClient af0be430-908a-11eb-a8b3-0242ac130003
 *
 * @typedef {Object} InputDemandePaiement
 * @property {string} idTiersFacturation
 * @property {string} idClient
 * @property {string} dateNaissanceClient 1986-11-30T00:00:00Z
 * @property {string} numFactureTiers
 * @property {string} dateFacture 2019-12-01T00:00:00Z
 * @property {string} dateDebutEmploi 2019-11-01T00:00:00Z
 * @property {string} dateFinEmploi 2019-11-30T00:00:00Z
 * @property {number} mntAcompte
 * @property {string} dateVersementAcompte 2019-11-30T00:00:00Z
 * @property {number} mntFactureTTC
 * @property {number} mntFactureHT
 * @property {InputPrestation[]} inputPrestations
 *
 * @typedef {Object} InputPrestation
 * @property {string} codeActivite 100 (ou 100A001 ?)
 * @property {string} codeNature 100A001 (ou 100 ?)
 * @property {number} quantite
 * @property {string} unite HEURE ou FORFAIT
 * @property {number} mntUnitaireTTC
 * @property {number} mntPrestationTTC
 * @property {number} mntPrestationHT
 * @property {number} mntPrestationTVA
 * @property {string} complement1 Contenu informatif concernant cette prestation
 * @property {string} complement2 Numéro SAP (NOVA) : SAP852330992
 *
 * @typedef {Object} OutputDemandePaiement
 * @property {string} idClient
 * @property {string} idDemandePaiement
 * @property {string} numFactureTiers
 * @property {string} statut
 * @property {Erreur[]} errors
 *
 * @typedef {Object} Erreur
 * @property {string} code
 * @property {string} message
 * @property {string} description
 *
 * @typedef {Object} InputRechercheDemandePaiement
 * @property {string[]} idDemandePaiements
 * @property {string} dateDebut 2020-11-01T00:00:00Z
 * @property {string} dateFin 2021-01-31T00:00:00Z
 *
 * @typedef {Object} OutputRechercheDemandePaiement
 * @property {Erreur[]} Errors
 * @property {InfoDemandePaiement[]} infoDemandePaiements
 *
 * @typedef {Object} InfoDemandePaiement
 * @property {string} idDemandePaiement
 * @property {InputDemandePaiement} demandePaiement
 * @property {Statut} statut
 * @property {InfoRejet} infoRejet
 * @property {InfoVirement} infoVirement
 *
 * @typedef {Object} Statut
 * @property {string} code
 * @property {string} libelle
 *
 * @typedef {Object} InfoRejet
 * @property {string} code
 * @property {string} commentaire
 *
 * @typedef {Object} InfoVirement
 * @property {number} mntVirement
 * @property {string} dateVirement 2019-12-05 T00:00:00Z
 */

/**
 * Transforme une date/heure provenant d'airtable en Date JS
 * @param {string} dateAirtable
 * @return {Date}
 */
function airtableToDate(dateAirtable) {
    return new Date(dateAirtable.replace('Z', ''));
}