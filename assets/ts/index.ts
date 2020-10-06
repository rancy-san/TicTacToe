let connectionIP = "localhost";
let connectionPort = "3000";
let xhr = new XMLHttpRequest();
var socket = io();

/* load and assignment DOM elements */
function DOMLoad() {
    // get cells
    let gameCell: HTMLCollection = document.getElementsByClassName("gameCell");
    // get length to iterate cells
    let gameCellLength = gameCell.length;

    // add event to each cell
    while (gameCellLength--) {
        (function (gameCellLength) {
            gameCell[gameCellLength].addEventListener("mousedown", function () {
                // check if cell has content
                if (!(<HTMLElement>gameCell[gameCellLength]).innerText) {
                    // add X or O
                    (<HTMLElement>gameCell[gameCellLength]).innerText = "X";
                    (<HTMLElement>gameCell[gameCellLength]).style.cursor = "default";
                    (<HTMLElement>gameCell[gameCellLength]).style.backgroundColor = "#F3F3F3";
                    sendMessage((<HTMLElement>gameCell[gameCellLength]).innerText, gameCellLength);
                }
            });
        })(gameCellLength);
    }
}

function sendMessage(msg:String, cellIndex:number) {
    socket.emit('msg', {message: msg, cell: cellIndex, user: "someUser"});
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
}