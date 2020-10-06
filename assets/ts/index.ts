let connectionIP = "localhost";
let connectionPort = "3000";
let xhr = new XMLHttpRequest();
var socket = io.connect(connectionIP+":"+connectionPort);
let player = "someUser";

/* load and assignment DOM elements */
function loadGame() {
    // get cells
    let gameCell: HTMLCollection = document.getElementsByClassName("gameCell");
    // get length to iterate cells
    let gameCellLength:number = gameCell.length;

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

/* 
    Send message tot he server contents containing the message (X or O), 
    the cell that the content is in, and the user.
*/
function sendMessage(msg: String, cellIndex: number) {
    socket.emit('msg', { message: msg, cell: cellIndex, user: socket.id });
}

function getPlayerCount() {
    socket.emit('getPlayerCount');
}

/*
    Update the game when receiving server data from the other client
*/
function updateGame() {
    // update board with player selected cells
    socket.on('broadcast', function (data) {
        (<HTMLElement>document.getElementsByClassName("gameCell")[data.cell]).innerText = data.message;
        console.log(socket.id);
    });
    // get player count and start game when 2 players connect
    socket.on('getPlayerCount', function (data) {
        // start game
        if (data.playerCount > 1) {
            // display game
            let gameCellContainer = document.getElementById("gameCellContainer").style.display = "block";
        } else if (data.playerCount < 2) {
            // close the game
            let gameCellContainer = document.getElementById("gameCellContainer").style.display = "none";
            // reset game
            resetGame();
        }
        console.log(data.playerCount);
    });

}

function resetGame() {
     // get cells
     let gameCell: HTMLCollection = document.getElementsByClassName("gameCell");
     // get length to iterate cells
     let gameCellLength:number = gameCell.length;

     // reset game cell style and contents
     while(gameCellLength--) {
        (<HTMLElement>gameCell[gameCellLength]).innerText = "";
        (<HTMLElement>gameCell[gameCellLength]).style.backgroundColor = "none";
        (<HTMLElement>gameCell[gameCellLength]).style.cursor = "pointer";
     }
}

// wait for DOM to load before getting elements
window.onload = function () {
    loadGame();
    updateGame();
    getPlayerCount();
}