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

let player1Game = [
	0, 0, 0,
	0, 0, 0,
	0, 0, 0
];

let player2Game = [
	0, 0, 0,
	0, 0, 0,
	0, 0, 0
];

let player1Name = "";
let player2Name = "";

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
	res.sendFile(__dirname + '/index.html');
	console.log("A user has been sent chat.html");
});

// access '/index' (landing page) brings you to index.html 
app.get('/index', function (req, res) {
	res.sendFile(__dirname + '/chat.html');
	console.log("A user has been sent chat.html");
});

// POST method route
app.post('/sendMessage', function (req, res) {
	// retrieve user's message stored in parsable format
	let userMessage = JSON.stringify(req.body.message);
	// display user's message in the server console
	console.log("***** User: " + userMessage);
});

// get number of players on server
let players = 0;
io.on('connection', function (socket) {
	players++;

	// decrement player count, and broadcast the number of players to all clients
	socket.on('disconnect', function () {
		players--;
		// automatically send the player count on user connection if user already connected
		io.sockets.emit('getPlayerCount', {
			playerCount: players
		});
		if(players < 2) {
			player1Name = player2Name;
		}
	});
	// set player names when number of players are valid
	if(players === 1) {
		console.log("p1 conected");
		player1Name = socket.id;
	} else if(players === 2) {
		console.log("p2 conected");
		player2Name = socket.id;
	}

	// reset server side game
	if(players < 2) {
		player1Game = [
			0, 0, 0,
			0, 0, 0,
			0, 0, 0
		];
		player2Game = [
			0, 0, 0,
			0, 0, 0,
			0, 0, 0
		];
	}

	// get player count on request
	socket.on('getPlayerCount', function () {
		io.sockets.emit('getPlayerCount', {
			playerCount: players
		});
	});
	
	// intercept user sending message to server
	socket.on('msg', function (data) {
		console.log(data);
		console.log(player1Name);
		console.log(player2Name);

		//Send message to everyone
		io.sockets.emit('broadcast', data);
		// add marked position to personal game board
		switch(data.user) {
			case player1Name: {
				console.log("player1");
				player1Game[data.cell] = 1;
				break;
			}
			case player2Name: {
				console.log("player2");
				player2Game[data.cell] = 1;
				break;
			}
		}

		console.log(player1Game);
		console.log(player2Game);
	});
});


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