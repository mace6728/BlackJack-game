document.addEventListener("DOMContentLoaded", () => {
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
    // New elements for insurance
    insuranceSection: document.getElementById("insurance-section"),
    maxInsurance: document.getElementById("max-insurance"),
    insuranceAmountInput: document.getElementById("insurance-amount"),
    placeInsuranceButton: document.getElementById("place-insurance-button"),
    skipInsuranceButton: document.getElementById("skip-insurance-button"),
    insuranceBetDisplay: document.getElementById("insurance-bet"),
    currentBetDisplay: document.getElementById("current-bet"),
  };

  const buttons = {
    splitButton: document.getElementById("splitButton"),
    doubleDownButton: document.getElementById("doubleDownButton"),
    resetHistoryButton: document.getElementById("resetHistoryButton"),
    restartGameButton: document.getElementById("restartGameButton"),
  };

  buttons.splitButton.addEventListener("click", splitHand);
  buttons.doubleDownButton.addEventListener("click", doubleDown);
  buttons.resetHistoryButton.addEventListener("click", resetHistory);
  buttons.restartGameButton.addEventListener("click", restartGame);

  let deck = [];
  let dealerHand = [];
  let playerHand = [];
  let playerChipsAmount = 100;
  let currentBet = 0;
  let gameHistory = [];
  let insuranceBet = 0;
  let split = false;
  buttons.restartGameButton.disabled = true;

  function initializeGame() {
    deck = createDeck();
    dealerHand = [];
    playerHand = [];
    currentBet = 0;
    updateChips();
    updateScores();
    updateCards();
    toggleButtonsGame(true);
    toggleButtonsBet(false);
  }

  window.initializeGame = initializeGame;

  function createDeck() {
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

  function dealCard(hand) {
    const card = deck.pop();
    hand.push(card);
    return card;
  }

  function calculateScore(hand) {
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

  function updateScores() {
    elements.dealerScore.textContent = calculateScore(dealerHand);
    elements.playerScore.textContent = calculateScore(playerHand);
    saveGame();
  }

  function updateCards() {
    elements.dealerCards.innerHTML = "";
    elements.playerCards.innerHTML = "";
    dealerHand.forEach((card) => appendCardImage(elements.dealerCards, card));
    playerHand.forEach((card) => appendCardImage(elements.playerCards, card));
    saveGame();
  }

  function appendCardImage(container, card) {
    const img = document.createElement("img");
    img.src = `images/row-${card.suit}-column-${card.value}.png`;
    container.appendChild(img);
  }

  function removeCardImage(container, card) {
    containerElement.removeChild(cardElement);
  }

  function updateChips() {
    elements.playerChips.textContent = `Chips: ${playerChipsAmount}`;
    saveGame();
  }

  function endGame(result) {
    toggleButtonsBet(true);
    toggleButtonsGame(true);
    gameHistory.push({
      result,
      playerScore: calculateScore(playerHand),
      dealerScore: calculateScore(dealerHand),
    });

    if (result === "Blackjack") {
      playerChipsAmount += currentBet * 2.5;
    } else if (result === "Win") {
      playerChipsAmount += currentBet * 2;
    } else if (result === "Draw") {
      playerChipsAmount += currentBet;
    }
    updateChips();
    if (playerChipsAmount <= 0) {
      alert("Game Over! You have no more chips.");
      toggleButtonsBet(true);
      toggleButtonsGame(true);
      buttons.resetHistoryButton.disabled = true;
      buttons.restartGameButton.disabled = false;
      elements.newGameButton.disabled = true;
    }
    updateHistory();
    saveGame();
  }

  function updateHistory() {
    elements.historyTableBody.innerHTML = "";
    gameHistory.forEach((game, index) => {
      const row = document.createElement("tr");
      row.innerHTML = `
        <td>${index + 1}</td>
        <td>${game.result}</td>
        <td>${game.playerScore}</td>
        <td>${game.dealerScore}</td>
      `;
      elements.historyTableBody.appendChild(row);
    });
    saveGame();
  }

  function saveGame() {
    const gameData = {
      playerChipsAmount,
      currentBet,
      insuranceBet,
      gameHistory,
      playerHand,
      dealerHand,

    };
    localStorage.setItem('blackjackGameData', JSON.stringify(gameData));
  }
  
  function loadGame() {
    const savedData = localStorage.getItem('blackjackGameData');
    if (savedData) {
      const gameData = JSON.parse(savedData);
      playerChipsAmount = gameData.playerChipsAmount;
      currentBet = gameData.currentBet;
      insuranceBet = gameData.insuranceBet;
      gameHistory = gameData.gameHistory;
    }
  }

  function splitHand() {
    if (
      playerHand.length === 2 &&
      playerHand[0].value === playerHand[1].value &&
      playerChipsAmount >= currentBet
    ) {
      // Deduct additional bet amount
      playerChipsAmount -= currentBet;
      split = true;
      updateChips();
      
      // Create the second hand
      const secondHand = [playerHand.pop()];
      playerHand.forEach((card) => removeCardImageCardImage(elements.playerCards, card));
      dealCard(playerHand);
      dealCard(secondHand);

      // Handle both hands separately (this requires additional logic)

      // Disable buttons after action
      buttons.doubleDownButton.disabled = true;
      buttons.splitButton.disabled = true;
    }
  }

  function doubleDown() {
    if (playerHand.length === 2 && playerChipsAmount >= currentBet) {
      // Deduct additional bet amount
      playerChipsAmount -= currentBet;
      currentBet *= 2;
      updateChips();

      // Deal one final card to the player
      dealCard(playerHand);
      updateScores();
      updateCards();

      // Disable buttons after action
      buttons.doubleDownButton.disabled = true;
      buttons.splitButton.disabled = true;

      if (calculateScore(playerHand) > 21) {
        endGame("Lose");
      }

      // Player must stand after double down
      elements.standButton.click();
    }
  }

  function toggleButtonsBet(disabled) {
    elements.placeBetButton.disabled = disabled;
    elements.betAmountInput.disabled = disabled;
  }

  function toggleButtonsGame(disabled) {
    elements.hitButton.disabled = disabled;
    elements.standButton.disabled = disabled;
    buttons.doubleDownButton.disabled = disabled;
    buttons.splitButton.disabled = disabled;
    // buttons.resetHistoryButton.disabled = disabled;
    // elements.newGameButton.disabled = disabled;
  }

  elements.hitButton.addEventListener("click", () => {
    dealCard(playerHand);
    updateScores();
    updateCards();

    // Disable buttons after action
    buttons.doubleDownButton.disabled = true;
    buttons.splitButton.disabled = true;

    if (calculateScore(playerHand) > 21) {
      endGame("Lose");
    }
  });

  elements.standButton.addEventListener("click", () => {
    buttons.doubleDownButton.disabled = true;
    buttons.splitButton.disabled = true;
    while (calculateScore(dealerHand) < 17) {
      dealCard(dealerHand);
    }
    updateScores();
    updateCards();
    const playerScore = calculateScore(playerHand);
    const dealerScore = calculateScore(dealerHand);
    if (dealerScore > 21 || playerScore > dealerScore) {
      endGame("Win");
    } else if (playerScore < dealerScore) {
      endGame("Lose");
    } else {
      endGame("Draw");
    }
  });

  elements.newGameButton.addEventListener("click", initializeGame);

  elements.placeBetButton.addEventListener("click", () => {
    const betAmount = parseInt(elements.betAmountInput.value);
    if (betAmount > 0 && betAmount <= playerChipsAmount) {
      currentBet = betAmount;
      playerChipsAmount -= betAmount;
      updateChips();
      updateCurrentBet();
      toggleButtonsBet(true);
      toggleButtonsGame(false);
      if(!split) {
        dealCard(playerHand);
      }
      dealCard(playerHand);
      dealCard(dealerHand);
      updateScores();
      updateCards();

      // Check for player blackjack
      if (calculateScore(playerHand) === 21 && playerHand.length === 2) {
        endGame("Blackjack");
      }

      // Offer insurance if dealer's upcard is an Ace
      if (dealerHand[0].value === "1") {
        offerInsurance();
      } else {
        // Ensure game buttons are enabled if no insurance is offered
        toggleButtonsGame(false);
      }

      // Enable or disable Double Down and Split buttons
      checkDoubleDownSplit();
    }
    saveGame();
  });

  function updateCurrentBet() {
    elements.currentBetDisplay.textContent = `Current Bet: ${currentBet}`;
  }


  function checkDoubleDownSplit() {
    // Enable Double Down if player has exactly two cards and enough chips
    if (playerHand.length === 2 && playerChipsAmount >= currentBet) {
      buttons.doubleDownButton.disabled = false;
    } else {
      buttons.doubleDownButton.disabled = true;
    }

    // Enable Split if player has two cards of the same value and enough chips
    if (
      playerHand.length === 2 &&
      playerHand[0].value === playerHand[1].value &&
      playerChipsAmount >= currentBet
    ) {
      buttons.splitButton.disabled = false;
    } else {
      buttons.splitButton.disabled = true;
    }
  }

  function offerInsurance() {
    const maxInsurance = currentBet / 2;
    elements.maxInsurance.textContent = maxInsurance;
    elements.insuranceAmountInput.value = '';
    elements.insuranceAmountInput.max = maxInsurance;
    elements.insuranceSection.style.display = 'flex';
    elements.insuranceSection.style.flexDirection = 'column';
  
    // Disable game buttons while insurance is being offered
    toggleButtonsGame(true);
  
    elements.placeInsuranceButton.onclick = () => {
      const insuranceAmount = parseInt(elements.insuranceAmountInput.value);
      if (
        insuranceAmount > 0 &&
        insuranceAmount <= maxInsurance &&
        insuranceAmount <= playerChipsAmount
      ) {
        insuranceBet = insuranceAmount;
        playerChipsAmount -= insuranceBet;
        updateChips();
        updateInsuranceBet(); // Update display
      } else {
        insuranceBet = 0;
        updateInsuranceBet(); // Update display
      }
      elements.insuranceSection.style.display = 'none';
      // Re-enable game buttons
      toggleButtonsGame(false);
    };
  
    elements.skipInsuranceButton.onclick = () => {
      insuranceBet = 0;
      updateInsuranceBet(); // Update display
      elements.insuranceSection.style.display = 'none';
      // Re-enable game buttons
      toggleButtonsGame(false);
    };

    saveGame();
  }

    function updateInsuranceBet() {
      elements.insuranceBetDisplay.textContent = `Insurance Bet: ${insuranceBet}`;
    }

    elements.skipInsuranceButton.onclick = () => {
      insuranceBet = 0;
      elements.insuranceSection.style.display = "none";
      // Re-enable game buttons
      toggleButtonsGame(false);
    };
  

  function resetHistory() {
    localStorage.clear();
    gameHistory = [];
    elements.historyTableBody.innerHTML = "";
    saveGame();
  }

  function restartGame() {
    playerChipsAmount = 100;
    localStorage.clear();
    updateChips();
    updateHistory();
    toggleButtonsBet(false);
    toggleButtonsGame(true);

    resetHistory();
    saveGame();
  }

  loadGame();
  initializeGame();
});
