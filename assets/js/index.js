var connectionIP = "localhost";
// use server's IP running on that machine to play across other devices
//let connectionIP = "http://192.168.0.19";
var connectionPort = "3000";
var xhr = new XMLHttpRequest();
var socket = io.connect(connectionIP + ":" + connectionPort);
// player's name before manual input
var playerName;
// generate a unique ID
var playerID;
/* load and assignment DOM elements */
function loadGame() {
    var DOM = document.body;
    DOM.style.display = "none";
    // get cells
    var gameCell = document.getElementsByClassName("gameCell");
    // get length to iterate cells
    var gameCellLength = gameCell.length;
    // ensure that the server connection is valid before booting up the game display
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
                    var gameCellContainerBlocker = document.getElementById("gameCellContainerBlocker");
                    // add X or O
                    gameCell[gameCellLength].innerText = "X";
                    gameCell[gameCellLength].style.cursor = "default";
                    gameCell[gameCellLength].style.backgroundColor = "#F3F3F3";
                    sendMessage(gameCell[gameCellLength].innerText, gameCellLength);
                    // disable client side clicking until opponent has made a turn
                    gameCellContainerBlocker.style.display = "block";
                }
            });
        })(gameCellLength);
    }
    // listen for user score and display the list of scores of all players
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
        // loop through list of players fast
        while (playerListLength--) {
            // create element to store players' name
            var playerListName = document.createElement("DIV");
            // create element to store the score of players
            var playerListScore = document.createElement("DIV");
            // set the text of the new DIV for the player's name
            playerListName.innerText = playerKeys[playerListLength];
            // change from JSON obj to string as the score
            playerListScore.innerText = JSON.stringify(playerList[playerKeys[playerListLength]]);
            // readable font-size
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
function sendMessage(msg, cellIndex) {
    // send to the server the value of the game board selected, the cell index selected, and the user's unique ID.
    socket.emit('msg', {
        message: msg,
        cell: cellIndex,
        user: socket.id
    });
}
/*
    get the number of players currently in the lobby
*/
function getPlayerCount() {
    socket.emit('getPlayerCount');
}
/*
    Update the game when receiving server data from the other client.
    Opponent is always O, and current user is X.
    User waits in a lobby for another player to connect.
    Game resets if other player leaves.
    Wait for server to send Win/Loss/Draw result to the user.
    Displays Win/Loss/Draw result on screen.
*/
function updateGame() {
    // store player count as a means to greenlight gameActive request
    var playerCount;
    // store whether the game should be active or not given from the server
    var gameActive = false;
    // update board with player selected cells
    socket.on('broadcast', function (data) {
        var gameCellContainerBlocker = document.getElementById("gameCellContainerBlocker");
        // use O instead of opponent's X
        document.getElementsByClassName("gameCell")[data.cell].innerText = "O";
        // allow user to perform move
        gameCellContainerBlocker.style.display = "none";
    });
    socket.on('gameActive', function (data) {
        gameActive = data.gameActive;
        console.log(gameActive);
        // start game
        if (playerCount > 1 && gameActive) {
            // display game
            var gameCellContainer = document.getElementById("gameCellContainer").style.display = "block";
        }
    });
    // wait for player count and start game when 2 players connect from the server
    socket.on('getPlayerCount', function (data) {
        playerCount = data.playerCount;
        console.log("Players Connected: " + playerCount);
        if (playerCount < 2) {
            // close the game
            var gameCellContainer = document.getElementById("gameCellContainer").style.display = "none";
            // reset game
            resetGame();
        }
    });
    // wait for end game results from the server
    socket.on('gameover', function (data) {
        // game data status is from the server (win/loss/draw) 
        var gameStatus = data.gameStatus;
        // text on the DOM showing the result to the user
        var gameStatusText = document.getElementById("gameStatusText");
        // hide the game when the game is over
        var gameCellContainer = document.getElementById("gameCellContainer").style.display = "none";
        // check if game result is a win
        if (gameStatus === "win") {
            // if the current player is the winner, change text to the winning text
            if (data.player === playerID) {
                gameStatusText.innerText = "Yes, you won!";
                gameStatusText.style.color = "Green";
            }
        }
        // drawing a game does not require a unique userID to identify who won
        else if (gameStatus === "draw") {
            gameStatusText.innerText = "Draw!";
            gameStatusText.style.color = "Orange";
        }
        // otherwise the current player lost
        else {
            gameStatusText.innerText = "No, you lost!";
            gameStatusText.style.color = "Red";
        }
        // clear game board
        resetGame();
    });
    // wait for the greenlight from the server to reset the game
    socket.on('resetGame', function () {
        resetGame();
    });
    socket.on('error', function (data) {
        switch (data.error) {
            case "userName": {
                // input and button container
                var playerNameContainer = document.getElementById("playerNameContainer");
                playerNameContainer.style.display = "block";
                errorMessage("Error encountered. Please retype your username.");
                break;
            }
            default: {
                errorMessage("Error encountered. Please quit the game and come back.");
            }
        }
    });
}
/*
    Reset the board game by clearing the contents of the cells.
*/
function resetGame() {
    // get cells
    var gameCell = document.getElementsByClassName("gameCell");
    // get length to iterate cells
    var gameCellLength = gameCell.length;
    // reset game cell style and contents client side
    while (gameCellLength--) {
        // clear X and O
        gameCell[gameCellLength].innerText = "";
        // remove highlights
        gameCell[gameCellLength].style.backgroundColor = "#FFFFFF";
        // change cursor type
        gameCell[gameCellLength].style.cursor = "default";
    }
}
/*
    Set client-side error message for the user to see
*/
function errorMessage(errMsg) {
    // sets an error message
    var error = document.getElementById("error");
    // if the error message has been set, display it to the user
    if (errMsg) {
        error.innerText = errMsg;
    }
    // clear error messages
    else {
        // reset error message
        error.innerText = "";
    }
}
/*
    Gives the current player a default username with random numbers to avoid same usernames when a blank name has been entered.
    Player name is set every keypress to avoid sending non-async data prior to sending data to the server.

*/
function addEventCaptureUserNameInput() {
    // input and button container
    var playerNameContainer = document.getElementById("playerNameContainer");
    // input element
    var playerNameInput = document.querySelector("#playerNameInput");
    // button to send username information
    var playerNameButton = document.getElementById("playerNameButton");
    //generate second part of default username to not repeat same name
    var randomPlayerNumber = Math.floor(Math.random() * 10000);
    // default username
    playerName = "anon" + randomPlayerNumber;
    console.log(playerName);
    // submit typed player name
    playerNameButton.addEventListener("mousedown", function () {
        // trim empty space, and make sure it is not an emty string
        var tempUserName = playerNameInput.value.trim();
        // check username has been initialized before sending it to the server
        if (tempUserName != undefined) {
            // make sure it is not empty, otherwise default username is used
            if (tempUserName != "")
                playerName = tempUserName;
            // hide user name input
            playerNameContainer.style.display = "none";
            // empty error messgage
            errorMessage(null);
            // setTimeout to test userName undefined error on server side
            // setTimeout(function () {
            console.log(playerName);
            // send to server username entered, and unique ID associated to username
            socket.emit('userData', {
                userName: playerName,
                userID: playerID
            });
            // request from the server the current scores of all players
            socket.emit('getUserScore');
            //}, 1000);
        }
        else {
            // display error message
            errorMessage("Unable to send user name to server... Please try again.");
        }
    });
}
/*
    Allow the user to reply the game when pressing a play again button.
    Resetting the game will clear the board of the current player and the opponent.
*/
function addEventReplayGame() {
    // HTML element that holds the button
    var gameStatusRetryButton = document.getElementById("gameStatusRetryButton");
    // add mousedown event to the button
    gameStatusRetryButton.addEventListener("mousedown", function () {
        // show the game board to have the players interact with it again
        var gameCellContainer = document.getElementById("gameCellContainer").style.display = "block";
        // reset Win/Loss/Draw message
        var gameStatusText = document.getElementById("gameStatusText");
        gameStatusText.innerText = "Did you win?";
        gameStatusText.style.color = "Black";
        console.log("Resetting game please wait...");
        // tell the server that the client wants to reset the game
        socket.emit("resetGame");
    });
}
// wait for DOM to load before getting elements
window.onload = function () {
    addEventCaptureUserNameInput();
    loadGame();
    updateGame();
    getPlayerCount();
    addEventReplayGame();
};
