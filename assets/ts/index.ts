/* load and assignment DOM elements */
function DOMLoad() {
    // get cells
    let gameCell:HTMLCollection = document.getElementsByClassName("gameCell");
    // get length to iterate cells
    let gameCellLength = gameCell.length;

    // add event to each cell
    while (gameCellLength--) {
        (function (gameCellLength) {
            gameCell[gameCellLength].addEventListener("mousedown", function () {
                // check if cell has content
                if(!(<HTMLElement>gameCell[gameCellLength]).innerText) {
                    // add X or O
                    (<HTMLElement>gameCell[gameCellLength]).innerText = "X";
                }
            });
        })(gameCellLength);
    }
}

// wait for DOM to load before getting elements
window.onload = function () {
    DOMLoad();
}