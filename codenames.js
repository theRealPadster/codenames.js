/**
 * TODO:
 * - can i just use a 1D array and split it up visually in the UI?
 *   - this would be easier to loop through and count items, etc.
 *   - it also would still retain all the card information...
 *
 * - add a coin flip for which team goes first if it's even
 * - add an answer key
 * - add responsive layout
 * - restructure clues to have an array of red and blue,
 *     and display them in separate lists
 *
 */

// Define rows and columns
const rows = 5;
const cols = 5;

// These are automatic
// TODO: cleaner way of accessing how many of each colour are left in gameState?
const TOTAL = rows * cols;
let NUM_REDS = Math.floor(TOTAL/3);
let NUM_BLUES = Math.floor(TOTAL/3);
const NUM_OPEN = Math.floor(TOTAL/3) - 1;
const NUM_ASSASSIN = 1;
const NUM_EXTRA = TOTAL - NUM_REDS - NUM_BLUES - NUM_OPEN - NUM_ASSASSIN;
let whoGoesFirst = '';
if (NUM_EXTRA) {
  if (Math.random() >= 0.5) {
    NUM_REDS++;
    whoGoesFirst = 'r';
  } else {
    NUM_BLUES++;
    whoGoesFirst = 'b';
  }
}

const words = generateWordsArray(rows, cols);
const key = generateKeyArray(rows, cols);
const board = generateBoard(key, words);

// TODO: make it follow this structure somehow?
let clues = {
  red: [],
  blue: [],
};
clues = [{
  color: whoGoesFirst,
  word: 'fish',
  number: 1,
}];


let gameState = {
  turn: whoGoesFirst,
  remainingGuesses: Number.MAX_SAFE_INTEGER,
  remainingReds: NUM_REDS,
  remainingBlues: NUM_BLUES,
}

console.log(board);

let data = {
  board, clues, gameState
}
const vm = new Vue({
  el: '#app',
  data: data,
  methods: {
    flipCard(card) {
      card.flipped = !card.flipped;
      this.gameState.remainingGuesses--;
      if (card.colour == 'r') {
        this.gameState.remainingReds--;
      } else if (card.colour == 'b') {
        this.gameState.remainingBlues--;
      } else if (card.colour == 'x') {
        // TODO: just call some win function instead of making the other team have 0
        if (this.gameState.turn == 'r') {
          this.gameState.remainingBlues = 0;
        } else if (this.gameState.turn == 'b') {
          this.gameState.remainingReds = 0;
        }
      }

      this.checkWinner();

      if (card.colour != this.gameState.turn) {
        this.gameState.remainingGuesses = 0;
      }
      if (this.gameState.remainingGuesses < 1) {
        this.endTurn();
      }
    },
    addClue() {
      // TODO: make this just use params
      this.clues.push({
        colour: this.gameState.turn,
        word: this.clues[0].word,
        number: this.clues[0].number,
      });

      // TODO: why was this a string concatenation?
      this.gameState.remainingGuesses = parseInt(this.clues[0].number) + 1;

      this.clues[0] = {
        color: this.gameState.turn == 'r' ? 'b' : 'r',
        word: '',
        number: 1,
      }
    },
    endTurn() {
      if (this.gameState.turn == 'r') {
        this.gameState.turn = 'b';
      } else {
        this.gameState.turn = 'r';
      }
    },
    checkWinner() {
      let winner = null;
      if (this.gameState.remainingBlues < 1) {
        winner = 'b';
      } else if (this.gameState.remainingReds < 1) {
        winner = 'r';
      }

      if (winner) {
        alert(`${winner} wins!`);
      }
      return winner;
    },
    endGame() {
      // TODO: reveal all, disable all controls?
    }
  },
  computed: {
    // Don't show the 0-index (pending) clue
    filteredClues: function() {
      return this.clues.slice(1);
    }
  }
});

//#region Functions

function generateWordsArray(rows, cols) {
  let wordsInOrder = [];
  for (let i = 0; i < rows * cols; i++) {
      wordsInOrder[wordsInOrder.length] = i + 1;
  }

  let array = [];
  for (let row = 0; row < rows; row++) {
      let wipRow = [];
      for (let col = 0; col < cols; col++) {
          let pos = Math.floor(Math.random() * (wordsInOrder.length));
          val = wordsInOrder[pos];
          wordsInOrder.splice(pos,1);
          wipRow[col] = val;
      }
      array[row] = wipRow;
  }
  return array;
}

function generateKeyArray(rows, cols) {
  console.log(TOTAL, NUM_REDS, NUM_BLUES, NUM_OPEN, NUM_ASSASSIN);

  let cardsInOrder = ['x'];
  for (let i = 0; i < NUM_REDS; i++) {
    cardsInOrder[cardsInOrder.length] = 'r';
  }
  for (let i = 0; i < NUM_BLUES; i++) {
    cardsInOrder[cardsInOrder.length] = 'b';
  }
  for (let i = 0; i < NUM_OPEN; i++) {
    cardsInOrder[cardsInOrder.length] = 'o';
  }

  let key = [];

  for (let row = 0; row < rows; row++) {
    let wip = [];
    for (let col = 0; col < cols; col++) {
      let val = undefined;
      if (cardsInOrder.length > 0) {
        let pos = Math.floor(Math.random() * (cardsInOrder.length));
        val = cardsInOrder[pos];
        cardsInOrder.splice(pos,1);
      }

      wip[col] = val;
    }
    key[row] = wip;
  }

  return key;
}

function generateBoard(key, words) {
  let board = [];

  for (let row = 0; row < key.length; row++) {
    board[row] = [];
    for (let col = 0; col < key[0].length; col++) {
      board[row][col] = {
        word: words[row][col],
        colour: key[row][col],
        flipped: false,
      }
    }
  }

  return board;
}

//#endregion
