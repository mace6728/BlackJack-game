const fs = require('fs');
const path = require('path');
const { JSDOM } = require('jsdom');

// Mock localStorage
class LocalStorageMock {
  constructor() {
    this.store = {};
  }

  clear() {
    this.store = {};
  }

  getItem(key) {
    return this.store[key] || null;
  }

  setItem(key, value) {
    this.store[key] = String(value);
  }

  removeItem(key) {
    delete this.store[key];
  }
}

global.localStorage = new LocalStorageMock();

// Load the HTML file and script
const html = fs.readFileSync(path.resolve(__dirname, '../index.html'), 'utf8');
const script = fs.readFileSync(path.resolve(__dirname, 'script.js'), 'utf8');

let window, document, elements;

beforeEach(() => {
  const dom = new JSDOM(html, { runScripts: "dangerously", url: "http://localhost:5500/" });
  window = dom.window;
  document = window.document;

  // Mock the elements
  elements = {
    dealerCards: document.getElementById("dealer-cards"),
    playerCards: document.getElementById("player-cards"),
    dealerScore: document.getElementById("dealer-score"),
    playerScore: document.getElementById("player-score"),
    playerChips: document.getElementById("player-chips"),
    hitButton: document.getElementById("hit-button"),
    standButton: document.getElementById("stand-button"),
    newGameButton: document.getElementById("new-game-button"),
    placeBetButton: document.getElementById("place-bet-button"),
    betAmountInput: document.getElementById("bet-amount"),
    historyTableBody: document.getElementById("history-table").querySelector("tbody"),
  };

  // Mock the global variables
  window.deck = [];
  window.dealerHand = [];
  window.playerHand = [];
  window.playerChipsAmount = 100;
  window.currentBet = 0;
  window.gameHistory = [];

  // Execute the script
  const scriptEl = document.createElement('script');
  scriptEl.textContent = script;
  document.body.appendChild(scriptEl);
});

test('initializeGame should reset the game state', () => {
  // Call the initializeGame function
  window.initializeGame();

  // Check if the game state is reset
  expect(window.deck.length).toBe(52);
  expect(window.dealerHand.length).toBe(0);
  expect(window.playerHand.length).toBe(0);
  expect(window.currentBet).toBe(0);
  expect(elements.playerChips.textContent).toBe('Chips: 100');
});