var fs = require('fs');

var wordsFilePath = process.argv[2];
var wordsGridFile = readGridFile(wordsFilePath);
var words = writeArray(wordsGridFile, []);

var keyFilePath = process.argv[3];
var keyGridFile = readGridFile(keyFilePath);
var count = keyGridFile.reduce(function(n, val) {
    if ('r' == val)
        n++;
    return n;
}, 0);
var whoGoesFirst = count === 9 ? "r" : "b";
var key = writeArray(keyGridFile, []);

var board = makeBoard(words, key);

drawBoard(board);

console.log("words:");
console.log(words);
console.log("key:");
console.log(key);
console.log("whoGoesFirst: " + whoGoesFirst);
console.log("board:");
console.log(board[0]);

/**************************
    FUNCTIONS
************************/

function drawBoard(board) {
    for (var row = 0; row < board[0].length; row++) {
        var wipRow = [];
        for (var col = 0; col < board[0].length; col++) { //TODO - possible expansion to different #cols?
            // wipRow[col] = "";
            var btn = win.document.createElement("button");
            var text = win.document.createTextNode((board[row][col]).word);
            btn.appendChild(text);
            win.document.body.appendChild(btn);
        }

        document.body.appendChild(document.createElement("br"));
        // board[row] = wipRow;
    };
}

//TODO - save flip state and team turn for full game state
//TODO - change what's passed in here, doesn't seem very modular, seems to grab a bunch of stuff from global...
function makeBoard(words, key) {
    if (wordsGridFile[0] != keyGridFile[0] || wordsGridFile[1] != keyGridFile[1]) {
        console.error("Invalid key grid for word grid!!");
        console.error(wordsGridFile[0] + "!=" + keyGridFile[0] + " || " + wordsGridFile[1] + "!=" + keyGridFile[1]);
        return;
    }

    var board = []

    for (var row = 0; row < wordsGridFile[0]; row++) {
        var wipRow = [];
        for (var col = 0; col < wordsGridFile[1]; col++) {
            wipRow[col] = {
                "word": words[row][col],
                "colour": key[row][col],
                "isFlipped": false
            };
        }
        board[row] = wipRow;
    };

    return board;
}

function writeArray(data, array) {
    for (var row = 0; row < data[0]; row++) {
        var wipRow = [];
        for (var col = 0; col < data[1]; col++) {
            wipRow[col] = data.pop();
        }
        array[row] = wipRow;
    }

    return array;
}

function readGridFile(path) {
    var input = fs.readFileSync(path, 'utf8');
    var splitted = input.split("\n");
    splitted.pop(); //remove final newline?
    return splitted;
}
