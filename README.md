## Tic Tac Toe - BRNKL

### Description

This Tic Tac Toe web-application was created for the BRNKL coding assessment.
This prototype application allows two users on different computers or web browser to play against each other, and also allows both players to restart the game.

The players must register their usernames prior to playing against each other so that their score may be registered within the server.  A list of current and past player names are displayed on the screen showing their win, loss, and draw score.

### Front-End

 Within the 'assets' folder, there contains the prototype for the front-end of the web application. Built using TypeScript as per BRNKL specifications, and limited CSS to have a slightly more forward approach to using the application. The JS folder is the path for the TypeScript code transpilation. The front-end sends positional data of the game board interaction, and awaits for the server's response from the opponent's interaction with the Tic Tac Toe board. The client also displays the game visually.

### Back-End
Within the root directory of the project, and coded using JavaScript within the NodeJS environment. The game data is stored directly on the server, and can be in later development stages sent to a low memory database such as Redis to match the web application's low memory consumption. The back-end receives data from the players, and send data back to the players. Data consists of the location of each player's clicks on the Tic Tac Toe board, the player's scores, and the end game result. The server calculates the game's outcome by cycling through the only possible 8 winning outcomes after a game's fifth total move.

### Use
NodeJS must be installed to run this web application.
Once installed...

#### Server
Open 'Command Prompt', or 'Terminal', and navigate to this project and execute 'npm install' to install all libraries necessary for the server to run.
Once libraries have been installed, execute 'node server.js' . A server IP address will display.

#### Client
Players playing this game on the same device as the server can open up their browser and navigate to either 'localhost:3000' or the IP address displayed on the server.
Players playing on the same network as the server on a different device than the server will need to have the IP address in their JS file (sent out by the server to the client) changed to the server's IP as displayed in the server console output on startup. The player must also open their browser and navigate to the server's IP address.