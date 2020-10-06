/* load and assignment DOM elements */
function DOMLoad() {
    // get cells
    var gameCell = document.getElementsByClassName("gameCell");
    // get length to iterate cells
    var gameCellLength = gameCell.length;
    // add event to each cell
    while (gameCellLength--) {
        (function (gameCellLength) {
            gameCell[gameCellLength].addEventListener("mousedown", function () {
                if (!gameCell[gameCellLength].innerText) {
                    gameCell[gameCellLength].innerText = "X";
                }
            });
        })(gameCellLength);
    }
}
window.onload = function () {
    DOMLoad();
};
