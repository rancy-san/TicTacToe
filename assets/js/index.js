var connectionIP = "localhost";
var connectionPort = "3000";
var xhr = new XMLHttpRequest();
var socket = io();
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
                // check if cell has content
                if (!gameCell[gameCellLength].innerText) {
                    // add X or O
                    gameCell[gameCellLength].innerText = "X";
                    gameCell[gameCellLength].style.cursor = "default";
                    gameCell[gameCellLength].style.backgroundColor = "#F3F3F3";
                    sendMessage(gameCell[gameCellLength].innerText, gameCellLength);
                }
            });
        })(gameCellLength);
    }
}
function sendMessage(msg, cellIndex) {
    socket.emit('msg', { message: msg, cell: cellIndex, user: "someUser" });
}
function updateGame() {
    socket.on('broadcast', function (data) {
        console.log(data);
    });
}
// wait for DOM to load before getting elements
window.onload = function () {
    DOMLoad();
    updateGame();
};
