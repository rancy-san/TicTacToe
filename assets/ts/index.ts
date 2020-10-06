let connectionIP = "localhost";
// use server's IP running on that machine to play across other devices
//let connectionIP = "http://192.168.0.19";
let connectionPort = "3000";
let xhr = new XMLHttpRequest();
var socket = io.connect(connectionIP + ":" + connectionPort);
let playerName = "someUser";
let playerID;

/* load and assignment DOM elements */
function loadGame() {
    let DOM:HTMLElement = document.body;
    DOM.style.display = "none";

    // get cells
    let gameCell: HTMLCollection = document.getElementsByClassName("gameCell");
    // get length to iterate cells
    let gameCellLength: number = gameCell.length;

    socket.on('connect', () => {
        playerID = socket.id;
        DOM.style.display = "block";
    });

    // add event to each cell
    while (gameCellLength--) {
        (function (gameCellLength) {
            gameCell[gameCellLength].addEventListener("mousedown", function () {
                // check if cell has content
                if (!(<HTMLElement>gameCell[gameCellLength]).innerText) {
                    
                    let gameCellContainerBlocker:HTMLElement = document.getElementById("gameCellContainerBlocker");

                    // add X or O
                    (<HTMLElement>gameCell[gameCellLength]).innerText = "X";
                    (<HTMLElement>gameCell[gameCellLength]).style.cursor = "default";
                    (<HTMLElement>gameCell[gameCellLength]).style.backgroundColor = "#F3F3F3";
                    sendMessage((<HTMLElement>gameCell[gameCellLength]).innerText, gameCellLength);

                    // disable client side clicking until opponent has made a turn
                    gameCellContainerBlocker.style.display = "block";
                }
            });
        })(gameCellLength);
    }

    // listen for user score
    socket.on('getUserScore', function (data) {
        // get player list
        let playerList = data.playerList;
        // get keys from JSON list
        let playerKeys = Object.keys(playerList);
        // get length of JSON list
        let playerListLength = playerKeys.length;
        // store the element that will display the player list & score
        let playerScoreContainer: HTMLElement = document.getElementById("playerScoreContainer");
        // reset player list
        playerScoreContainer.innerHTML = "";
        console.log(playerKeys);

        // get player list
        while (playerListLength--) {

            // create elements to store list
            let playerListName: HTMLElement = document.createElement("DIV");
            let playerListScore: HTMLElement = document.createElement("DIV");

            playerListName.innerText = playerKeys[playerListLength];
            playerListScore.innerText = JSON.stringify(playerList[playerKeys[playerListLength]]);

            playerListScore.style.fontSize = "15px";

            // all player scores to the scoreboard
            playerScoreContainer.appendChild(playerListName);
            playerScoreContainer.appendChild(playerListScore);

        }
    });

}

/* 
    Send message tot he server contents containing the message (X or O), 
    the cell that the content is in, and the user.
*/
function sendMessage(msg: String, cellIndex: number) {
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
        let gameCellContainerBlocker:HTMLElement = document.getElementById("gameCellContainerBlocker");
        //(<HTMLElement>document.getElementsByClassName("gameCell")[data.cell]).innerText = data.message;
        // use O instead of opponent's X
        (<HTMLElement>document.getElementsByClassName("gameCell")[data.cell]).innerText = "O";

        // allow user to perform move
        gameCellContainerBlocker.style.display = "none";
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

    socket.on('gameover', function (data) {
        console.log("OK");
        let gameStatus = data.gameStatus;
        let gameStatusText:HTMLElement = document.getElementById("gameStatusText");

        console.log("server ID: " + data.player);
        console.log("client ID: " + playerID);

        let gameCellContainer = document.getElementById("gameCellContainer").style.display = "none";

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

    socket.on('resetGame', function() {
        resetGame();
    });
}

function resetGame() {
    // get cells
    let gameCell: HTMLCollection = document.getElementsByClassName("gameCell");
    // get length to iterate cells
    let gameCellLength: number = gameCell.length;

    // reset game cell style and contents client side
    while (gameCellLength--) {
        (<HTMLElement>gameCell[gameCellLength]).innerText = "";
        (<HTMLElement>gameCell[gameCellLength]).style.backgroundColor = "#FFFFFF";
        (<HTMLElement>gameCell[gameCellLength]).style.cursor = "default";
    }
}


function addEventCaptureUserNameInput() {
    // input and button container
    let playerNameContainer: HTMLElement = document.getElementById("playerNameContainer");
    // input element
    let playerNameInput: HTMLInputElement = document.querySelector("#playerNameInput");
    // button to send username information
    let playerNameButton: HTMLElement = document.getElementById("playerNameButton");

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
    let gameStatusRetryButton: HTMLElement = document.getElementById("gameStatusRetryButton");

    gameStatusRetryButton.addEventListener("mousedown", function() {
        let gameCellContainer = document.getElementById("gameCellContainer").style.display = "block";
        let gameStatusText = document.getElementById("gameStatusText").innerText = "Did you win?";

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
}