var rows = 5;
var cols = 5;

var words = generateWordsArray();
var key = generateKeyArray();

var count = key.reduce(function(n, val) {
    for (var col = 0; col < val.length; col++) {
        if ('r' == val[col])
            n++;
    }
    return n;
}, 0);
var whoGoesFirst = count === 9 ? "r" : "b";

var gameState = {
    turn: whoGoesFirst,
    allocatedGuesses: null,
    usedGuesses: 0
};

var board = makeBoard(words, key);

drawBoard(board);
wassup();

generateKeyTable();

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

function generateKeyArray() {
    //TODO - maybe eventually use math to pick number of each based on grid size
    var cardsInOrder = ["x"];
    for (var i = 0; i < 8; i++) {
        cardsInOrder[cardsInOrder.length] = "r";
    }
    for (var i = 0; i < 8; i++) {
        cardsInOrder[cardsInOrder.length] = "b";
    }
    for (var i = 0; i < 7; i++) {
        cardsInOrder[cardsInOrder.length] = "o";
    }

    var key = [];

    for (var row = 0; row < rows; row++) {
        var wip = [];
        for (var col = 0; col < cols; col++) {
            var val = undefined;
            if (cardsInOrder.length > 0) {
                var pos = Math.floor(Math.random() * (cardsInOrder.length));
                val = cardsInOrder[pos];
                cardsInOrder.splice(pos,1);
            }
            else {
                val = Math.random() >= 0.5 ? "r" : "b";
            }

            wip[col] = val;
        }
        key[row] = wip;
    }

    return key;
}

function getRow(element) {
    return element.id.split("-")[1];
}

function getCol(element) {
    return element.id.split("-")[2];
}

function getCard(thisVar) {
    return board[getRow(thisVar)][getCol(thisVar)];
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
                btn.className = "card";
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
    if (gameState.allocatedGuesses == null) {
        alert("No clue yet.");
        return;
    }
    else if (gameState.usedGuesses >= gameState.allocatedGuesses) {
        alert("All guesses used. Should be the other person's turn now...");
        return;
    }

    var card = getCard(this);

    //if assassin
    if (card.colour == "x") {
        alert("Assassin! Game over!!");
        return;
    }

    //if hasn't been flipped, show colour
    if (!card.isFlipped) {
        this.className = "card " + card.colour;
    }
    else {
        this.className = "card";
    }
    card.isFlipped = !card.isFlipped;

    gameState.usedGuesses++;

    //if they picked the wrong colour (other team or civilian)
    if (card.colour != gameState.turn) {
        alert("Ooh, not one of your agents!");
        endTurn();
        return;
    }

    if (gameState.usedGuesses >= gameState.allocatedGuesses)
        endTurn();
    else if (youWon()) {
        alert("You win!");
    }
}

function submitClicked() {
    var clueInput = document.getElementById("clue-input");
    var chunks = clueInput.value.split(" ");
    if (chunks.length != 2) {
        alert("Invalid clue :P");
        // return;
    }
    var clue = chunks[0];
    var number = chunks[1];

    if (clue == "" || number == "") {
        alert("You need a valid clue and number :P");
        return;
    }
    else if (isNaN(parseInt(number))) {
        alert("\"" + number + "\" is not a valid number :P");
        return;
    }

    var clueHeading = document.getElementById("clue-heading");
    clueHeading.innerHTML = "";

    var clueSpan = makeElement("span", clue, "");
    var numberSpan = makeElement("span", " " + number, "");

    document.getElementById("clue-heading").appendChild(clueSpan);
    document.getElementById("clue-heading").appendChild(numberSpan);

    var clueLi = makeElement("li", clue + " " + number, "clue " + gameState.turn);
    document.getElementById("clue-log").appendChild(clueLi);

    gameState.clue = clue;
    gameState.allocatedGuesses = parseInt(number) + 1; //TODO - add 0 and unlimited
    gameState.usedGuesses = 0;

    clueInput.value = "";

    document.getElementById("clue-heading").className = gameState.turn;
}

function endTurn() {
    if (gameState.usedGuesses < 1) {
        alert("You need to guess at least once!");
        return;
    }

    gameState.turn = gameState.turn == "r" ? "b" : "r";
    gameState.allocatedGuesses = null;
    gameState.usedGuesses = 0;
    gameState.clue = null;

    var msg = gameState.turn == "r" ? "Red's turn" : "Blue's turn";
    document.getElementById("clue-heading").innerHTML = msg;
    document.getElementById("clue-heading").className = gameState.turn;
}

function makeElement(tag, innerHTML, classes) {
    var element = document.createElement(tag);
    element.innerHTML = innerHTML;
    element.className = classes;
    return element;
}

function youWon() {
    for (var row = 0; row < board[0].length; row++) {
        for (var col = 0; col < board.length; col++) {
            if (board[row][col].colour == gameState.turn && board[row][col].isFlipped == false)
                return false;
        }
    }
    return true;
}

function deleteBoard() {
    document.getElementById("boardContainer").remove();
}

function wassup() {
    console.log("words:");
    console.log(words);
    console.log("key:");
    console.log(key);
    console.log("whoGoesFirst: " + whoGoesFirst);
    console.log("board[0]:");
    console.log(board[0]);
}

function generateKeyTable() {
    var table = document.createElement("table");
    table.id = "key-map"
    table.className = "hidden";
    for (var row = 0; row < rows; row++) {
        var tr = document.createElement("tr");
        for (var col = 0; col < cols; col++) {
            var td = document.createElement("td");
            td.className = key[row][col];
            td.innerHTML = words[row][col];
            tr.appendChild(td);
        }
        table.appendChild(tr);
    }
    document.getElementById("output").appendChild(table);
}

function toggleKeyMap() {
    var table = document.getElementById("key-map");
    table.className = table.className == "hidden" ? "visible" : "hidden";
}

/*****************************
    FOR NODE VERSION
**********************/

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
