var connectionIP = "localhost";
var connectionPort = "3000";
var xhr = new XMLHttpRequest();
var socket = io.connect(connectionIP + ":" + connectionPort);
var player = "someUser";
var playerID;
/* load and assignment DOM elements */
function loadGame() {
    // get cells
    var gameCell = document.getElementsByClassName("gameCell");
    // get length to iterate cells
    var gameCellLength = gameCell.length;
    socket.on('connect', function () {
        playerID = socket.id;
    });
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
/*
    Send message tot he server contents containing the message (X or O),
    the cell that the content is in, and the user.
*/
function sendMessage(msg, cellIndex) {
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
        document.getElementsByClassName("gameCell")[data.cell].innerText = data.message;
    });
    // get player count and start game when 2 players connect
    socket.on('getPlayerCount', function (data) {
        // start game
        if (data.playerCount > 1) {
            // display game
            var gameCellContainer = document.getElementById("gameCellContainer").style.display = "block";
        }
        else if (data.playerCount < 2) {
            // close the game
            var gameCellContainer = document.getElementById("gameCellContainer").style.display = "none";
            // reset game
            resetGame();
        }
        console.log(data.playerCount);
    });
    socket.on('gameover', function (data) {
        console.log("OK");
        var gameStatus = data.gameStatus;
        console.log("server ID: " + data.player);
        console.log("client ID: " + playerID);
        if (gameStatus === "win") {
            if (data.player === playerID) {
                console.log("You win!");
            }
        }
        else if (gameStatus === "draw")
            console.log("Draw.");
        else
            console.log("You lose.");
    });
}
function resetGame() {
    // get cells
    var gameCell = document.getElementsByClassName("gameCell");
    // get length to iterate cells
    var gameCellLength = gameCell.length;
    // reset game cell style and contents
    while (gameCellLength--) {
        gameCell[gameCellLength].innerText = "";
        gameCell[gameCellLength].style.backgroundColor = "#FFFFFF";
        gameCell[gameCellLength].style.cursor = "default";
    }
}
// wait for DOM to load before getting elements
window.onload = function () {
    loadGame();
    updateGame();
    getPlayerCount();
};
