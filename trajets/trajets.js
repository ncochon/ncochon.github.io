function onSignOut() { }

$(function () {
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

    //Ajoute les rdv
    let div = $("<div />");
    div.addClass("rdv");
    div.css("left", $("#colLundi").position().left);
    div.css("top", $("#td080").position().top);
    div.css("width", $("#td080").css("width"));
    div.css("height", 9 * 4);
    div.append("XXX");

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

    $("tbody").droppable({
        drop: function (event, ui) { 
            console.log(ui);

            ui.draggable.css("left", Math.floor((ui.position.left+50)/200)*200+50);
            ui.draggable.css("top", ui.position.top);
        }
    });
});