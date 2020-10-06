var connectionIP = "localhost";
var connectionPort = "3000";
var xhr = new XMLHttpRequest();
var socket = io.connect(connectionIP + ":" + connectionPort);
var playerName = "someUser";
var playerID;
/* load and assignment DOM elements */
function loadGame() {
    var DOM = document.body;
    DOM.style.display = "none";
    // get cells
    var gameCell = document.getElementsByClassName("gameCell");
    // get length to iterate cells
    var gameCellLength = gameCell.length;
    socket.on('connect', function () {
        playerID = socket.id;
        DOM.style.display = "block";
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
    // listen for user score
    socket.on('getUserScore', function (data) {
        // get player list
        var playerList = data.playerList;
        // get keys from JSON list
        var playerKeys = Object.keys(playerList);
        // get length of JSON list
        var playerListLength = playerKeys.length;
        // store the element that will display the player list & score
        var playerScoreContainer = document.getElementById("playerScoreContainer");
        // reset player list
        playerScoreContainer.innerHTML = "";
        console.log(playerKeys);
        // get player list
        while (playerListLength--) {
            // create elements to store list
            var playerListName = document.createElement("DIV");
            var playerListScore = document.createElement("DIV");
            playerListName.innerText = playerKeys[playerListLength];
            playerListScore.innerText = JSON.stringify(playerList[playerKeys[playerListLength]]);
            playerListScore.style.fontSize = "15px";
            playerScoreContainer.appendChild(playerListName);
            playerScoreContainer.appendChild(playerListScore);
        }
    });
}
/*
    Send message tot he server contents containing the message (X or O),
    the cell that the content is in, and the user.
*/
function sendMessage(msg, cellIndex) {
    socket.emit('msg', {
        message: msg,
        cell: cellIndex,
        user: socket.id
    });
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
        //(<HTMLElement>document.getElementsByClassName("gameCell")[data.cell]).innerText = data.message;
        // use O instead of opponent's X
        document.getElementsByClassName("gameCell")[data.cell].innerText = "O";
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
        var gameStatusText = document.getElementById("gameStatusText");
        console.log("server ID: " + data.player);
        console.log("client ID: " + playerID);
        var gameCellContainer = document.getElementById("gameCellContainer").style.display = "none";
        console.log(gameStatus);
        if (gameStatus === "win") {
            if (data.player === playerID) {
                gameStatusText.innerText = "Yes, you won!";
            }
        }
        else if (gameStatus === "draw") {
            gameStatusText.innerText = "Draw!";
        }
        else {
            gameStatusText.innerText = "No, you lost!";
        }
        resetGame();
    });
    socket.on('resetGame', function () {
        resetGame();
    });
}
function resetGame() {
    // get cells
    var gameCell = document.getElementsByClassName("gameCell");
    // get length to iterate cells
    var gameCellLength = gameCell.length;
    // reset game cell style and contents client side
    while (gameCellLength--) {
        gameCell[gameCellLength].innerText = "";
        gameCell[gameCellLength].style.backgroundColor = "#FFFFFF";
        gameCell[gameCellLength].style.cursor = "default";
    }
}
function addEventCaptureUserNameInput() {
    // input and button container
    var playerNameContainer = document.getElementById("playerNameContainer");
    // input element
    var playerNameInput = document.querySelector("#playerNameInput");
    // button to send username information
    var playerNameButton = document.getElementById("playerNameButton");
    // submit typed player name
    playerNameButton.addEventListener("mousedown", function () {
        playerNameContainer.style.display = "none";
        playerName = playerNameInput.value;
        socket.emit('userData', {
            userName: playerName,
            userID: playerID
        });
        socket.emit('getUserScore', function (data) {
            console.log(data);
        });
    });
}
function addEventReplayGame() {
    var gameStatusRetryButton = document.getElementById("gameStatusRetryButton");
    gameStatusRetryButton.addEventListener("mousedown", function () {
        var gameCellContainer = document.getElementById("gameCellContainer").style.display = "block";
        var gameStatusText = document.getElementById("gameStatusText").innerText = "Did you win?";
        console.log("Resetting game please wait...");
        socket.emit("resetGame");
    });
}
// wait for DOM to load before getting elements
window.onload = function () {
    loadGame();
    addEventCaptureUserNameInput();
    updateGame();
    getPlayerCount();
    addEventReplayGame();
};
