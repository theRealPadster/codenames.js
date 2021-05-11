/**
 * TODO:
 * - can i just use a 1D array and split it up visually in the UI?
 *   - this would be easier to loop through and count items, etc.
 *   - it also would still retain all the card information...
 *
 * - Disable clue submit button from when it's clicked until the current team's turn is over
 * - add a coin flip for which team goes first if it's even
 * - add responsive layout
 * - add in 0 and infinite clue number functionality
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

// TODO: load the words from a file
// There is some weird EMCAScript module syntax that IE doesn't support but I couldn't figure it out
// Require doesn't work in plain old browser js
// Fetch needs it to be on a server (annoying for local development)
//   - maybe just upload once and reference from the github pages url?
// Or I can use the Papa Parse for CSV, but fetch might be enough
// fetch('words.js').then(results => console.log(results));
// const test = require('./words.js');
console.log(words);

// TODO: make it follow this structure somehow?
let clues = {
  pending: {
    word: 'fish',
    number: 1,
  },
  red: [],
  blue: [],
};

let gameState = {
  turn: whoGoesFirst,
  remainingGuesses: Number.MAX_SAFE_INTEGER,
  remainingReds: NUM_REDS,
  remainingBlues: NUM_BLUES,
};

console.log(board);

let data = {
  board, clues, gameState, showAnswers: true
};
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
    // TODO: make this just use params
    addClue() {
      if (this.gameState.turn == 'r') {
        this.clues.red.push(this.clues.pending);
      } else {
        this.clues.blue.push(this.clues.pending);
      }

      // TODO: why was this a string concatenation?
      this.gameState.remainingGuesses = parseInt(this.clues.pending.number) + 1;

      this.clues.pending = {
        word: '',
        number: 1,
      };
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
      this.showAnswers = true;
    },
    toggleAnswerKey() {
      this.showAnswers = !this.showAnswers;
    },
    copyAnswerKey() {
      generateCanvas(this.board);
    }
  },
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
      let val = wordsInOrder[pos];
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
      };
    }
  }

  return board;
}

function generateCanvas(key) {
  const canvas = document.getElementById('myCanvas');
  const CANVAS_WIDTH = canvas.width;
  const CANVAS_HEIGHT = canvas.height;
  const CELL_WIDTH = CANVAS_WIDTH / cols;
  const CELL_HEIGHT = CANVAS_HEIGHT / rows;
  const ctx = canvas.getContext('2d');

  for (let row = 0; row < rows; row++) {
    const startY = row * CELL_HEIGHT;

    for (let col = 0; col < cols; col++) {
      const startX = col * CELL_WIDTH;

      switch (key[row][col].colour) {
        case 'r':
          ctx.fillStyle = '#ee474b';
          break;
        case 'b':
          ctx.fillStyle = '#3094b7';
          break;
        case 'o':
          ctx.fillStyle = '#d8cc98';
          break;
        case 'x':
          ctx.fillStyle = '#393834';
          break;
      }

      ctx.fillRect(startX, startY, CELL_WIDTH, CELL_HEIGHT);
      ctx.beginPath();
      ctx.rect(startX, startY, CELL_WIDTH, CELL_HEIGHT);
      ctx.stroke();

    }
  }

  canvas.toBlob(function(blob) {
    const item = new ClipboardItem({ 'image/png': blob });
    navigator.clipboard.write([item]);
  });
}

//#endregion
