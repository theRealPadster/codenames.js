var rows = 5;
var cols = 5;

var words = generateWordsArray();
var key = [
    ["r","b","o","o","o"],
    ["o","b","x","r","b"],
    ["r","r","r","b","r"],
    ["b","b","o","b","r"],
    ["o","b","r","r","o"]];
var count = key.reduce(function(n, val) {
    for (var col = 0; col < val.length; col++) {
        if ('r' == val[col])
            n++;
    }
    return n;
}, 0);
var whoGoesFirst = count === 9 ? "r" : "b";

var board = makeBoard(words, key);

drawBoard(board);
wassup();

function wassup() {
    console.log("words:");
    console.log(words);
    console.log("key:");
    console.log(key);
    console.log("whoGoesFirst: " + whoGoesFirst);
    console.log("board:");
    console.log(board[0]);
}

/**************************
    FUNCTIONS
************************/

function generateWordsArray() {
    var array = [];
    for (var row = 0; row < rows; row++) {
        var wipRow = [];
        for (var col = 0; col < cols; col++) {
            wipRow[col] = row * cols + col + 1;
        }
        array[row] = wipRow;
    }
    return array;
}

function getRow(element) {
    return element.id.split("-")[1];
}

function getCol(element) {
    return element.id.split("-")[2];
}

function drawBoard(board) {
    var container = document.createElement("div");
    container.id = "boardContainer";
    for (var row = 0; row < board[0].length; row++) {
        var wipRow = [];
        for (var col = 0; col < board.length; col++) {
            var card = board[row][col];
            var btn = document.createElement("button");
            btn.innerHTML = card.word;
            btn.id = "btn-" + row + "-" + col;
            if (card.isFlipped)
                btn.className = "card " + card.colour;
            else
                btn.className = "card u";
            btn.addEventListener ("click", cardClicked);
            container.appendChild(btn);
        }
        container.appendChild(document.createElement("br"));
    };
    document.body.appendChild(container);
}

function flipBoard() {
    var btn = document.getElementById("btnToggle");
    var show = false;
    if (btn.innerHTML == "Hide all") {
        btn.innerHTML = "Show all";
    }
    else {
        show = true;
        btn.innerHTML = "Hide all";
    }

    board.forEach(function(element) {
        element.forEach(function(innerElement) {
            innerElement.isFlipped = show;
        });
    });
    deleteBoard();
    drawBoard(board);
}

function cardClicked() {
    var row = getRow(this);
    var col = getCol(this);
    var card = board[row][col];
    //if hasn't been flipped, show colour
    if (!card.isFlipped) {
        this.className = "card " + card.colour;
    }
    else {
        this.className = "card u";
    }
    card.isFlipped = !card.isFlipped;
}

function deleteBoard() {
    document.getElementById("boardContainer").remove();
}

//TODO - save flip state and team turn for full game state
//TODO - change what's passed in here, doesn't seem very modular, seems to grab a bunch of stuff from global...
function makeBoard(words, key) {
    var board = [];

    for (var row = 0; row < rows; row++) {
        var wipRow = [];
        for (var col = 0; col < cols; col++) {
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
