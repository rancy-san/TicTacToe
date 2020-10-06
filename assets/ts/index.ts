let connectionIP = "localhost";
let connectionPort = "3000";
let xhr = new XMLHttpRequest();

/* load and assignment DOM elements */
function DOMLoad() {
    // get cells
    let gameCell:HTMLCollection = document.getElementsByClassName("gameCell");
    // get length to iterate cells
    let gameCellLength = gameCell.length;

    // add event to each cell
    while (gameCellLength--) {
        (function (gameCellLength) {
            gameCell[gameCellLength].addEventListener("mousedown", function () {
                // check if cell has content
                if(!(<HTMLElement>gameCell[gameCellLength]).innerText) {
                    // add X or O
                    (<HTMLElement>gameCell[gameCellLength]).innerText = "X";
                    sendMessage((<HTMLElement>gameCell[gameCellLength]).innerText);
                }
            });
        })(gameCellLength);
    }
}

function sendMessage(message:String) {
    // open connection with server calling specialized function
	xhr.open('POST', 'http://'+connectionIP+":"+connectionPort+'/sendMessage', true);
	// tell the server what type of data that is being sent (i.e. key1=value1&key2=value2)
	xhr.setRequestHeader("Content-type", "application/x-www-form-urlencoded");

	// when AJAX request listener ready, perform action with server response
	xhr.onload = function() {
		// waiting for the server reply until status 200 from the server
		if (xhr.status === 200) {
            console.log("Server responded with OK.");
		}
		// display error message if unsuccessful
		else {
			console.log('Request failed.  Returned status of ' + xhr.status);
		}
	};
	console.log("Sending: " + message);
	// send user's message to the server
	xhr.send("message="+ message);
	// display user's message on the screen
}

// wait for DOM to load before getting elements
window.onload = function () {
    DOMLoad();
}