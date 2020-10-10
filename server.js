// import expressJS
const express = require('express');
// initialize expressJS
const app = express();
// import http with an expressJS Server
const http = require('http').Server(app);
// able to parse POST request from the client
const bodyParser = require('body-parser')
// allow broadcast of selection
var io = require('socket.io')(http);

// eliminate CORS (Cross origin request) issue/non-https
const cors = require('cors');
// get operating system library to display server information
const os = require('os');
// import library that gets server's IPv4 address
const localIpV4Address = require("local-ipv4-address");

// holds the list of players, and scores with JSON format:
/*
playerList[someUserName] = {
	wins: 0,
	loss: 0,
	draw: 0
};
*/
let playerList = {

}


// possbilities that will win the game
const winCondition = [
	[
		1, 1, 1,
		0, 0, 0,
		0, 0, 0
	],
	[
		0, 0, 0,
		1, 1, 1,
		0, 0, 0
	],
	[
		0, 0, 0,
		0, 0, 0,
		1, 1, 1,
	],
	[
		1, 0, 0,
		1, 0, 0,
		1, 0, 0
	],
	[
		0, 1, 0,
		0, 1, 0,
		0, 1, 0
	],
	[
		0, 0, 1,
		0, 0, 1,
		0, 0, 1
	],
	[
		1, 0, 0,
		0, 1, 0,
		0, 0, 1
	],
	[
		0, 0, 1,
		0, 1, 0,
		1, 0, 0
	]
];

// denoting the value that winnings games
const winningValue = 1;
// initial starting board
let defaultGame = function () {
	return [
		0, 0, 0,
		0, 0, 0,
		0, 0, 0
	];
}

// initial starting board for player 1
let player1Game = defaultGame();

// initial starting board for player 2
let player2Game = defaultGame();


// userID tracking with JSON format on player name capture:
/*
playerMatch[player2UserID] = {
	userName: someUserName
};
*/
let playerMatch = {

};

// userID tracking
let player1UserID;
let player2UserID;

let player1UserName;
let player2UserName;

// to optimize logic callback until minimumWinningMoves reached
let messageCount = 0;
// a player can win after a minimum of 5 moves have been made
// (i.e. 2 moves player A, 3 moves player B) 
let minimumWinningMoves = 5;
// draw at 9 total moves from both players
let maximumDrawMoves = 9;
// get number of players on server
let players = 0;
let minPlayers = 1;
let maxPlayers = 2;

// allow Cross Origin Requests
app.use(cors());
// to support JSON-encoded bodies
app.use(bodyParser.json());
// to support URL-encoded bodies
app.use(bodyParser.urlencoded({ extended: true }));
// to support JSON-encoded bodies
app.use(express.json());
// to support URL-encoded bodies
app.use(express.urlencoded({ extended: true }));

// server allows the client to use assets directory as a mime type text/html
app.use('/assets', express.static('assets'));

// access '/' (landing page) brings you to index.html 
app.get('/', function (req, res) {
	// allow only 2 players at a time to the game
	if (players <= 1) {
		console.log(players);
		res.sendFile(__dirname + '/index.html');
		console.log("A user has been sent chat.html");
	}
});

io.on('connection', function (socket) {
	// increase number of connected players
	players++;

	// decrement player count, and broadcast the number of players to all clients
	socket.on('disconnect', function (data) {
		players--;
		console.log(socket.id);
		// automatically send the player count on user connection if user already connected
		io.sockets.emit('getPlayerCount', {
			playerCount: players
		});

		// reset server side game
		if (players < maxPlayers) {
			// stop game immediately on client side
			socket.emit('gameActive', {
				gameActive: false
			});
			player1UserID = player2UserID;
			resetGame();
		}
	});
	console.log("Player count: " + players);

	// set player names when number of players are valid
	if (players === minPlayers) {
		// player 1 is the first player count
		player1UserID = socket.id;
	} else if (players === maxPlayers) {
		// player 2 is the second player count
		player2UserID = socket.id;
	}

	// reset game on server side, and tell client to reset their game
	socket.on('resetGame', function () {
		console.log("Resetting game...");
		resetGame();

		// send to all clients to reset their game
		io.sockets.emit("resetGame");
	});

	// get player count on request
	socket.on('getPlayerCount', function () {
		io.sockets.emit('getPlayerCount', {
			playerCount: players
		});
	});

	// check if the user already exists on submission of player name
	socket.on('userData', function (data) {
		let validName = false;
		try {
			if (data.userName) {
				validName = true;
			} else {
				io.to(data.userID).emit('error', {
					error: "userName"
				});
			}
		} catch (e) {
			console.log(e.message);
		}

		if (validName) {
			// set player names when number of players are valid
			if (player1UserID == data.userID) {
				player1UserName = data.userName;
				console.log("player1UserName: " + player1UserName);
			} else if (player2UserID == data.userID) {
				player2UserName = data.userName;
				console.log("player2UserName: " + player2UserName);
			}

			// if both names are valid (server has stored it), the game can start
			if (player1UserName && player2UserName) {
				io.sockets.emit('gameActive', {
					gameActive: true
				});
			}


			console.log("Adding user data for: " + data.userName);
			// store username temporarily
			let tempUserName = data.userName;
			// check JSON list, and if user name does not exist then create initial scores for that new player
			if (!playerList.hasOwnProperty(tempUserName)) {
				playerList[tempUserName] = {
					wins: 0,
					loss: 0,
					draw: 0
				};
			}

			// assign the correct username to the correct userID
			// make sure the client1's unique ID is the same as the server's ID for that client
			if (data.userID === player1UserID && !playerMatch.hasOwnProperty(player1UserID)) {
				console.log("Assigning ID: " + player1UserID + " to Player 1: " + tempUserName);
				// player1's user name belongs to that unique ID
				playerMatch[player1UserID] = {
					userName: tempUserName
				};
			}

			// make sure the client2's unique ID is the same as the server's ID for that client
			if (data.userID === player2UserID && !playerMatch.hasOwnProperty(player2UserID)) {
				console.log("Assigning ID: " + player2UserID + " to Player 2: " + tempUserName);
				// player1's user name belongs to that unique ID
				playerMatch[player2UserID] = {
					userName: tempUserName
				};
			}
		}
	});

	socket.on('getUserScore', function () {
		console.log("Sending player score...");
		playerScoreStatus();
	});

	// intercept user sending message to server
	socket.on('msg', function (data) {
		// go up to max messages allowed for the game
		messageCount++;
		console.log(data);

		//Send message to everyone
		socket.broadcast.emit('broadcast', data);
		// add marked position to personal game board
		switch (data.user) {
			case player1UserID: {
				// mark player1's board with index of TRUE position
				player1Game[data.cell] = 1;
				break;
			}
			case player2UserID: {
				// mark player2's board with index of TRUE position
				player2Game[data.cell] = 1;
				break;
			}
		}
		console.log();
		console.log(playerMatch[data.user].userName + "'s Board:");
		console.log(player1Game);
		console.log();
		console.log(playerMatch[data.user].userName + "'s Board:");
		console.log(player2Game);
		console.log();

		// check if winning state
		if (messageCount >= minimumWinningMoves) {
			// used to loop through player's board
			let defaultGameLength = defaultGame().length;
			// used to loop through possible winning boards
			let winConditionLength = winCondition.length;
			// match 3 from one of the possible winning boards
			let winPatternMax = 3;
			// track current possible winning boards' match
			let winPatternCountPlayer1 = 0;
			// track current possible winning boards' match
			let winPatternCountPlayer2 = 0;
			// holds the winner of the game
			let winner;

			// loop through multi dimensional array
			for (let i = 0; i < winConditionLength; i++) {

				// loop through single array
				for (let j = 0; j < defaultGameLength; j++) {

					// check if table of winning combinations is valid
					if ((player1Game[j] === winCondition[i][j]) && (player1Game[j] == winningValue)) {
						//console.log("player1Game[" + j + "]: " + player1Game[j] + "winCondition[" + i + "][" + j + "]: " + winCondition[i][j]);
						winPatternCountPlayer1++;
					}
					// check if table of winning combinations is valid
					if ((player2Game[j] === winCondition[i][j]) && (player2Game[j] == winningValue)) {
						//console.log("player2Game[" + j + "]: " + player2Game[j] + "winCondition[" + i + "][" + j + "]: " + winCondition[i][j]);
						winPatternCountPlayer2++;
					}
					// player won
					if (winPatternCountPlayer1 === winPatternMax) {
						console.log("P1 WINS");
						winner = player1UserID;
						break;
					}
					// player won
					if (winPatternCountPlayer2 === winPatternMax) {
						console.log("P2 WINS");
						winner = player2UserID;
						break;
					}
					// no winners yet
					else if (j === (defaultGameLength - 1)) {
						//console.log("NO WINNERS YET.");

						// reset count for next multiarray check
						winPatternCountPlayer1 = 0;
						winPatternCountPlayer2 = 0;
					}
				}

				// stop checking for winner if one is found
				if (winner) {
					console.log("Winner: " + winner);
					// assign and send winners and losers
					switch (winner) {
						case player1UserID: {
							// increment player1's score
							playerList[playerMatch[player1UserID].userName].wins++;
							// decrease player2's score
							playerList[playerMatch[player2UserID].userName].loss++;

							// send game status to player 1 and player 2
							gameStatus("win", player1UserID);
							gameStatus("lose", player2UserID);
							break;
						}
						case player2UserID: {
							// decrease player1's score
							playerList[playerMatch[player1UserID].userName].loss++;
							// increment player2's score
							playerList[playerMatch[player2UserID].userName].wins++;

							// send game status to player 1 and player 2
							gameStatus("lose", player1UserID);
							gameStatus("win", player2UserID);
						}
					}

					// reset board for next play
					messageCount = 0;
					player1Game = defaultGame();
					player2Game = defaultGame();
					break;
				}
			}
		}
		// check if draw game (draw end at the end of 9 total moves)
		if (messageCount >= maximumDrawMoves) {
			console.log("DRAW GAME");
			// increase draw score for player 1 and 2
			playerList[playerMatch[player1UserID].userName].draw++;
			playerList[playerMatch[player2UserID].userName].draw++;

			// send game status to player 1 and player 2
			gameStatus("draw", player1UserID);
			gameStatus("draw", player2UserID);
		}
	});
});


/*
	Reset the game on the server side by resetting each player's board game to default
*/
function resetGame() {
	player1Game = defaultGame();
	player2Game = defaultGame();
	messageCount = 0;

	console.log();
	console.log("Player 1's Board:");
	console.log(player1Game);
	console.log();
	console.log("Player 2's Board:");
	console.log(player2Game);
	console.log();
}
/*
	Send list of player's score to requesting client
*/

function playerScoreStatus() {
	console.log("Sending player score...");
	io.sockets.emit('getUserScore', {
		playerList: playerList
	});
}

/*
	Send game status to the winner and loser given 
	the some game status, and a player name to send to.
*/
function gameStatus(someGameStatus, somePlayerName) {
	console.log("Game over. Sending results...");
	io.to(somePlayerName).emit('gameover', {
		gameStatus: someGameStatus,
		player: somePlayerName,
	});

	// send updated player score to players
	playerScoreStatus();
}


// create server & listen for connections
http.listen(3000, function () {
	// get IPv4 address to display in the server console
	localIpV4Address().then(function (ipAddress) {
		// display IP address of the server
		console.log("This machine '" + os.hostname() + "' is now a local server!");
		console.log("Mobile application ready for testing.");
		console.log("Navigate to " + ipAddress + ":3000 in any modern web browser on mobile");
	});
});