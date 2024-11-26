/*
112550043 李知恆 第4次作業 11/17
112550043 LEE CHIH HENG The Fourth Homework 11/17
*/

class BlackjackGame {
  constructor(elements, buttons) {
    this.elements = elements;
    this.buttons = buttons;
    this.deck = [];
    this.dealerHand = [];
    this.playerHand = [];
    this.playerChipsAmount = 100;
    this.currentBet = 0;
    this.gameHistory = [];
    this.insuranceBet = 0;

    this.buttons.restartGameButton.disabled = true;

    this.attachEventListeners();
    this.newGame();
  }

  attachEventListeners() {
    this.buttons.doubleDownButton.addEventListener("click", () =>
      this.doubleDown()
    );
    this.buttons.resetHistoryButton.addEventListener("click", () =>
      this.resetHistory()
    );
    this.buttons.restartGameButton.addEventListener("click", () =>
      this.restartGame()
    );

    this.elements.betAmountInput.addEventListener("input", (e) =>
      this.validateBetInput(e)
    );

    this.elements.hitButton.addEventListener("click", () => this.hit());
    this.elements.standButton.addEventListener("click", () => this.stand());
    this.elements.newGameButton.addEventListener("click", () => this.newGame());
    this.elements.placeBetButton.addEventListener("click", () =>
      this.placeBet()
    );

    this.elements.placeInsuranceButton.addEventListener("click", () =>
      this.placeInsurance()
    );
    this.elements.skipInsuranceButton.addEventListener("click", () =>
      this.skipInsurance()
    );
  }

  newGame() {
    const savedData = this.getGameDataFromCookie();
    if (savedData) {
      this.playerChipsAmount = savedData.playerChipsAmount;
    }
    if(this.playerChipsAmount === 0) {
      this.playerChipsAmount = 100;
    }
    this.resetGameData();
    this.deck = this.createDeck();
    this.updateChips();
    this.updateScores();
    this.updateCards();
    this.updateCurrentBet();
    this.updateInsuranceBet();
    this.updateHistory();
    this.toggleButtonsGame(true);
    this.toggleButtonsBet(false);

    this.elements.betAmountInput.max = this.playerChipsAmount;
    this.elements.betAmountInput.min = 0;
  }

  resetGameData() {
    this.dealerHand = [];
    this.playerHand = [];
    this.currentBet = 0;
    this.insuranceBet = 0;
    this.elements.result.innerHTML = "";
  }

  createDeck() {
    const suits = ["1", "2", "3", "4"];
    const values = [
      "1",
      "2",
      "3",
      "4",
      "5",
      "6",
      "7",
      "8",
      "9",
      "10",
      "11",
      "12",
      "13",
    ];
    return suits
      .flatMap((suit) => values.map((value) => ({ suit, value })))
      .sort(() => Math.random() - 0.5);
  }

  dealCard(hand) {
    const card = this.deck.pop();
    hand.push(card);
    return card;
  }

  calculateScore(hand) {
    let score = 0;
    let aces = 0;
    hand.forEach((card) => {
      if (card.value === "1") {
        aces += 1;
        score += 11;
      } else if (["11", "12", "13"].includes(card.value)) {
        score += 10;
      } else {
        score += parseInt(card.value);
      }
    });
    while (score > 21 && aces > 0) {
      score -= 10;
      aces -= 1;
    }
    return score;
  }

  updateScores() {
    this.elements.dealerScore.textContent = this.calculateScore(
      this.dealerHand
    );
    this.elements.playerScore.textContent = this.calculateScore(
      this.playerHand
    );
  }

  updateCards() {
    this.elements.dealerCards.innerHTML = "";
    this.elements.playerCards.innerHTML = "";
    this.dealerHand.forEach((card) =>
      this.appendCardImage(this.elements.dealerCards, card)
    );
    this.playerHand.forEach((card) =>
      this.appendCardImage(this.elements.playerCards, card)
    );
  }

  appendCardImage(container, card) {
    const img = document.createElement("img");
    img.src = `images/row-${card.suit}-column-${card.value}.png`;
    container.appendChild(img);
  }

  updateChips() {
    this.elements.playerChips.textContent = `Chips: ${this.playerChipsAmount}`;
  }

  endGame(result) {
    this.toggleButtonsBet(true);
    this.toggleButtonsGame(true);

    switch (result) {
      case "Blackjack":
        this.playerChipsAmount += this.currentBet * 2.5;
        break;
      case "dealerBlackjack":
        this.playerChipsAmount += this.insuranceBet * 3;
        break;
      case "Win":
        this.playerChipsAmount += this.currentBet * 2;
        break;
      case "Draw":
        this.playerChipsAmount += this.currentBet;
        break;
      case "Lose":
        // No chips added
        break;
      default:
        break;
    }

    this.updateChips();
    this.gameHistory.push({
      result,
      playerScore: this.calculateScore(this.playerHand),
      dealerScore: this.calculateScore(this.dealerHand),
      playerChips: this.playerChipsAmount,
      insurance: this.insuranceBet,
      bet: this.currentBet,
    });

    if (this.playerChipsAmount <= 0) {
      this.elements.restartSection.style.display = "flex";
      this.elements.restartSection.style.flexDirection = "column";
      this.toggleButtonsBet(true);
      this.toggleButtonsGame(true);
      this.buttons.resetHistoryButton.disabled = true;
      this.buttons.restartGameButton.disabled = false;
      this.elements.newGameButton.disabled = true;
    }

    this.updateHistory();
    this.elements.result.innerHTML = result;
    this.storeGameDataInSessionAndLocal();
    this.storeGameDataInCookie();
    this.storeGameDataInDatabase();
  }

  updateHistory() {
    this.elements.historyTableBody.innerHTML = "";
    this.gameHistory.forEach((game, index) => {
      const row = document.createElement("tr");
      row.innerHTML = `
          <td>${index + 1}</td>
          <td><strong>${game.result}</strong></td>
          <td>${game.playerScore}</td>
          <td>${game.dealerScore}</td>
          <td>${game.bet}</td>
          <td>${game.playerChips}</td>
          <td>${game.insurance}</td>
        `;
      this.elements.historyTableBody.appendChild(row);
    });
  }

  serializeGameState() {
    const gameData = {
      playerChipsAmount: this.playerChipsAmount,
      gameHistory: this.gameHistory,
      playerHand: this.playerHand,
      dealerHand: this.dealerHand,
    };
    return JSON.stringify(gameData);
  }

  storeGameDataInSessionAndLocal() {
    const gameData = this.serializeGameState();
    localStorage.setItem("blackjackGameData", JSON.stringify(gameData));
    sessionStorage.setItem("blackjackGameData", JSON.stringify(gameData));
  }

  storeGameDataInCookie() {
    const gameData = this.serializeGameState();
    document.cookie = `gameData=${gameData}; path=/; max-age=86400`;
  }

  getGameDataFromCookie() {
    const cDecoded = decodeURIComponent(document.cookie);
    const cArray = cDecoded.split("; ");
    const gameDataCookie = cArray.find((cookie) =>
      cookie.startsWith("gameData=")
    );
    if (gameDataCookie) {
      return JSON.parse(gameDataCookie.split("=")[1]);
    }
    return null;
  }

  async storeGameDataInDatabase() {
    const gameData = this.serializeGameState();
    try {
      const response = await fetch("/save-game", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: gameData,
      });
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
    } catch (error) {
      console.error("There was a problem with the fetch operation:", error);
    }
  }

  toggleButtonsBet(disabled) {
    this.elements.placeBetButton.disabled = disabled;
    this.elements.betAmountInput.disabled = disabled;
  }

  toggleButtonsGame(disabled) {
    this.elements.hitButton.disabled = disabled;
    this.elements.standButton.disabled = disabled;
    this.buttons.doubleDownButton.disabled = disabled;
  }

  hit() {
    this.dealCard(this.playerHand);
    this.updateScores();
    this.updateCards();

    this.buttons.doubleDownButton.disabled = true;

    if (this.calculateScore(this.playerHand) > 21) {
      this.endGame("Lose");
    }
  }

  stand() {
    this.buttons.doubleDownButton.disabled = true;
    while (this.calculateScore(this.dealerHand) < 17) {
      this.dealCard(this.dealerHand);
    }
    this.updateScores();
    this.updateCards();

    const playerScore = this.calculateScore(this.playerHand);
    const dealerScore = this.calculateScore(this.dealerHand);

    if (dealerScore === 21 && this.dealerHand.length === 2) {
      this.endGame("dealerBlackjack");
    } else if (dealerScore > 21 || playerScore > dealerScore) {
      this.endGame("Win");
    } else if (playerScore < dealerScore) {
      this.endGame("Lose");
    } else {
      this.endGame("Draw");
    }
  }

  doubleDown() {
    console.log("Double Down initiated");

    if (
      this.playerHand.length === 2 &&
      this.playerChipsAmount >= this.currentBet
    ) {
      this.playerChipsAmount -= this.currentBet;
      this.currentBet *= 2;
      this.updateChips();
      this.updateCurrentBet();
      this.dealCard(this.playerHand);
      this.updateScores();
      this.updateCards();

      this.buttons.doubleDownButton.disabled = true;

      const playerScore = this.calculateScore(this.playerHand);
      if (playerScore > 21) {
        this.endGame("Lose");
      } else {
        this.stand();
      }
    }
  }

  placeBet() {
    const betAmount = parseInt(this.elements.betAmountInput.value);
    if (betAmount > 0 && betAmount <= this.playerChipsAmount) {
      if (this.currentBet === 0) {
        this.dealerHand = [];
        this.playerHand = [];
        this.dealCard(this.playerHand);
        this.dealCard(this.playerHand);
        this.dealCard(this.dealerHand);
      }
      this.elements.betAmountInput.max = this.playerChipsAmount;
      this.elements.betAmountInput.min = 0;
      this.currentBet += betAmount;
      this.playerChipsAmount -= betAmount;
      this.updateChips();
      this.updateCurrentBet();
      this.updateInsuranceBet();
      this.toggleButtonsBet(true);
      this.toggleButtonsGame(false);
      this.updateScores();
      this.updateCards();

      if (
        this.calculateScore(this.playerHand) === 21 &&
        this.playerHand.length === 2
      ) {
        this.endGame("Blackjack");
      } else if (this.dealerHand[0].value === "1") {
        this.offerInsurance();
      } else {
        this.toggleButtonsGame(false);
        this.checkDoubleDown();
      }
    }
  }

  updateCurrentBet() {
    this.elements.currentBetDisplay.textContent = `Current Bet: ${this.currentBet}`;
  }

  checkDoubleDown() {
    if (
      this.playerHand.length === 2 &&
      this.playerChipsAmount >= this.currentBet
    ) {
      this.buttons.doubleDownButton.disabled = false;
    } else {
      this.buttons.doubleDownButton.disabled = true;
    }
  }

  offerInsurance() {
    const maxInsurance = this.currentBet / 2;
    this.elements.maxInsurance.textContent = maxInsurance;
    this.elements.insuranceAmountInput.value = "";
    this.elements.insuranceAmountInput.max = maxInsurance;
    this.elements.insuranceSection.style.display = "flex";
    this.elements.insuranceSection.style.flexDirection = "column";

    this.toggleButtonsGame(true);

    this.elements.placeInsuranceButton.onclick = () => this.placeInsurance();

    this.elements.skipInsuranceButton.onclick = () => this.skipInsurance();
  }

  placeInsurance() {
    const insuranceAmount = parseInt(this.elements.insuranceAmountInput.value);
    const maxInsurance = this.currentBet / 2;

    if (
      insuranceAmount > 0 &&
      insuranceAmount <= maxInsurance &&
      insuranceAmount <= this.playerChipsAmount
    ) {
      this.insuranceBet = insuranceAmount;
      this.playerChipsAmount -= this.insuranceBet;
      this.updateChips();
    } else {
      this.insuranceBet = 0;
    }
    this.updateInsuranceBet();
    this.elements.insuranceSection.style.display = "none";
    this.toggleButtonsGame(false);
  }

  skipInsurance() {
    this.insuranceBet = 0;
    this.updateInsuranceBet();
    this.elements.insuranceSection.style.display = "none";
    this.toggleButtonsGame(false);
  }

  updateInsuranceBet() {
    this.elements.insuranceBetDisplay.textContent = `Insurance Bet: ${this.insuranceBet}`;
  }

  validateBetInput(event) {
    const input = event.target;
    const max = parseInt(input.max, 10);
    const currentValue = parseInt(input.value, 10);

    if (currentValue > max) {
      input.value = max;
    }

    if (currentValue < 0) {
      input.value = 0;
    }
  }

  resetHistory() {
    localStorage.clear();
    this.gameHistory = [];
    this.elements.historyTableBody.innerHTML = "";
  }

  restartGame() {
    this.elements.restartSection.style.display = "none";
    this.playerChipsAmount = 100;
    localStorage.clear();
    this.resetHistory();
    this.updateChips();
    this.updateHistory();
    this.toggleButtonsBet(false);
    this.toggleButtonsGame(true);
    this.newGame();
    this.elements.newGameButton.disabled = false;
    this.buttons.resetHistoryButton.disabled = false;
  }
}

const elements = {
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
  historyTableBody: document
    .getElementById("history-table")
    .querySelector("tbody"),
  insuranceSection: document.getElementById("insurance-section"),
  restartSection: document.getElementById("restart-section"),
  maxInsurance: document.getElementById("max-insurance"),
  insuranceAmountInput: document.getElementById("insurance-amount"),
  placeInsuranceButton: document.getElementById("place-insurance-button"),
  skipInsuranceButton: document.getElementById("skip-insurance-button"),
  insuranceBetDisplay: document.getElementById("insurance-bet"),
  currentBetDisplay: document.getElementById("current-bet"),
  result: document.getElementById("result"),
};

const buttons = {
  doubleDownButton: document.getElementById("doubleDownButton"),
  resetHistoryButton: document.getElementById("resetHistoryButton"),
  restartGameButton: document.getElementById("restartGameButton"),
};

// Instantiate the game
new BlackjackGame(elements, buttons);
