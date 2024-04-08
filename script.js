lengthSubmit = () => {
    this.length = parseInt(document.getElementById("length-input").value);

    if (!this.length) {
        alert("Please enter the length!");
    } else {
        this.settings();
        this.generateNumString();
    }
};

generateNumString = () => {
    this.numString = '';

    for (let i = 0; i < this.length; i++) {
        this.numString += Math.floor(Math.random() * 6) + 1;
    }
};

settings = () => {
    this.settingsPage = document.getElementById("game-start");
    this.setupPage = document.getElementById("game-setup");

    this.setupPage.style.display = "none";
    this.settingsPage.style.display = "block";
};

start = () => {
    this.player = document.getElementById("player").value;
    this.algorithm = document.getElementById("algorithm").value;

    this.stage = document.getElementById("game-menu");

    this.stage.style.display = "block";
    this.settingsPage.style.display = "none";

    this.numStringUi = document.getElementById("numerical-string");
    this.numStringUi.innerText = this.numString;

    this.userScore = 0;
    this.computerScore = 0;

    this.currentPlayerUi = document.getElementById("current-player");
    this.currentPlayerUi.innerText = this.player;

    this.currentAlgorithmUi = document.getElementById("current-algorithm");
    this.currentAlgorithmUi.innerText = this.algorithm;

    this.userScoreUi = document.getElementById('user-score');
    this.userScoreUi.innerText = this.userScore;

    this.computerScoreUi = document.getElementById('computer-score');
    this.computerScoreUi.innerText = this.computerScore;

    this.switchTurn(this.player);
};

makeMove = () => {
    const actionsContainer = document.getElementById("numerical-string-actions");
    actionsContainer.innerHTML = '';

    for (let i = 0; i < this.numString.length - 1; i += 2) {
        const button = document.createElement("button");
        button.textContent = `Sum ${this.numString[i]} + ${this.numString[i + 1]}`;
        button.onclick = () => this.sumPair(i);
        actionsContainer.appendChild(button);
    }

    if (this.numString.length % 2 !== 0) {
        const deleteButton = document.createElement("button");
        deleteButton.textContent = "Delete Last Number";
        deleteButton.onclick = () => this.deleteNumber();
        actionsContainer.appendChild(deleteButton);
    }
}

sumPair = (index) => {
    if (index < 0 || index >= this.numString.length - 1) {
        alert("Invalid pair selected");
        return;
    }

    let pairSum = parseInt(this.numString[index]) + parseInt(this.numString[index + 1]);
    if (pairSum > 6) pairSum = pairSum - 6;

    this.numString = this.numString.substring(0, index) + pairSum + this.numString.substring(index + 2);

    if (this.player === "User") {
        this.userScore++;
    } else {
        this.computerScore++;
    }

    if (this.numString.length <= 1) {
        this.end();
    } else {
        this.updateUi();
        let nextPlayer = this.player === "User" ? "Computer" : "User";
        this.switchTurn(nextPlayer);
    }
}

deleteNumber = () => {
    if (this.numString.length >= 1) {
        this.numString = this.numString.slice(0, -1);

        if (this.player === "User") {
            this.userScore--;
        } else {
            this.computerScore--;
        }

        this.updateUi();
    }

    if (this.numString.length <= 1) {
        this.end();
    } else {
        this.updateUi();
        let nextPlayer = this.player === "User" ? "Computer" : "User";
        this.switchTurn(nextPlayer);
    }
}


end = () => {
    let winner = this.userScore > this.computerScore ? 'User' : 'Computer';
    if (this.userScore === this.computerScore) {
        winner = 'It\'s a draw';
    } else {
        winner = `${winner} win!`;
    }


    const actionsContainer = document.getElementById("numerical-string-actions");
    actionsContainer.innerHTML = ''

    const newGameButton = document.getElementById("start-new-game-btn");
    newGameButton.style.display = 'block';
    newGameButton.onclick = () => location.reload();

    this.updateStatusMessage('Game over! Win: ' + winner);

    this.currentPlayerUi.innerText = this.player;
    this.userScoreUi.innerText = this.userScore;
    this.computerScoreUi.innerText = this.computerScore;
    this.numStringUi.innerText = this.numString;
}

updateUi = () => {
    this.currentPlayerUi.innerText = this.player;
    this.userScoreUi.innerText = this.userScore;
    this.computerScoreUi.innerText = this.computerScore;
    this.numStringUi.innerText = this.numString;

    const actionsContainer = document.getElementById("numerical-string-actions");
    actionsContainer.innerHTML = '';

    for (let i = 0; i < this.numString.length - 1; i += 2) {
        const button = document.createElement("button");
        button.textContent = `Sum ${this.numString[i]} + ${this.numString[i + 1]}`;
        button.onclick = () => this.sumPair(i);
        button.disabled = !this.isUser;
        actionsContainer.appendChild(button);
    }

    if (this.numString.length % 2 !== 0) {
        const deleteButton = document.createElement("button");
        deleteButton.textContent = "Delete Last Number";
        deleteButton.onclick = () => this.deleteNumber();
        deleteButton.disabled = !this.isUser;
        actionsContainer.appendChild(deleteButton);
    }
}

heuristicFunction = () => {
    const scoreDifference = this.computerScore - this.userScore;
    const stringLengthPenalty = this.numString.length;
    return scoreDifference - stringLengthPenalty;
}

minimax = (numString, depth, isMaximizingPlayer) => {
    if (depth === 0 || numString.length <= 1) {
        return heuristicFunction(numString); 
    }

    let bestMove = { eval: isMaximizingPlayer ? -Infinity : +Infinity };

   
    for (let i = 0; i <= numString.length - 2; i += 2) {
        let newNumString = applyMove(numString, i);
        let eval = minimax(newNumString, depth - 1, !isMaximizingPlayer);

        if (isMaximizingPlayer) {
            if (eval > bestMove.eval) bestMove = { index: i, eval };
        } else {
            if (eval < bestMove.eval) bestMove = { index: i, eval };
        }
    }

    if (numString.length % 2 !== 0) {
        let newNumString = numString.slice(0, -1); 
        let eval = minimax(newNumString, depth - 1, !isMaximizingPlayer);

        if ((isMaximizingPlayer && eval > bestMove.eval) || (!isMaximizingPlayer && eval < bestMove.eval)) {
            bestMove = { deleteLast: true, eval };
        }
    }

    return depth === 3 ? bestMove : bestMove.eval;
}

alphaBeta = (numString, depth, alpha, beta, isMaximizingPlayer) => {
    if (depth === 0 || numString.length <= 1) {
        return { eval: heuristicFunction(numString) };
    }

    let bestMove = isMaximizingPlayer ? { eval: -Infinity } : { eval: +Infinity };

    for (let i = 0; i <= numString.length - 2; i += 2) {
        let newNumString = applyMove(numString, i);
        let result = alphaBeta(newNumString, depth - 1, alpha, beta, !isMaximizingPlayer);
        let eval = result.eval;

        if (isMaximizingPlayer) {
            if (eval > bestMove.eval) {
                bestMove = { index: i, eval };
                alpha = Math.max(alpha, eval);
            }
        } else {
            if (eval < bestMove.eval) {
                bestMove = { index: i, eval };
                beta = Math.min(beta, eval);
            }
        }
        if (beta <= alpha) break; 
    }

    if (numString.length % 2 !== 0) {
        let newNumString = applyMove(numString, 0, true);
        let result = alphaBeta(newNumString, depth - 1, alpha, beta, !isMaximizingPlayer);
        let eval = result.eval;

        if ((isMaximizingPlayer && eval > bestMove.eval) || (!isMaximizingPlayer && eval < bestMove.eval)) {
            bestMove = { deleteLast: true, eval };
        }
    }

    return depth === 3 ? bestMove : { eval: bestMove.eval };
}

computerMove = () => {
    let bestAction;
    if (this.algorithm === "Minimax") {
        bestAction = minimax(this.numString, 3, true);
    } else {
        bestAction = alphaBeta(this.numString, 3, -Infinity, +Infinity, true);
    }

    if (bestAction.hasOwnProperty('index')) {
        this.numString = applyMove(this.numString, bestAction.index)
        this.computerScore++;
    } else if (bestAction.deleteLast) {
        this.numString = applyMove(this.numString, 0, true)
        this.computerScore--;
    }

    this.updateUi();

    if (this.numString.length <= 1) {
        this.end();
    } else {

        setTimeout(() => {
            this.switchTurn("User");
        }, 1000);
    }
};

applyMove = (numString, index, deleteLast = false) => {
    if (deleteLast) {
        return numString.slice(0, -1);
    } else {
        let pairSum = parseInt(numString[index]) + parseInt(numString[index + 1]);
        pairSum = pairSum > 6 ? pairSum - 6 : pairSum;
        return numString.substring(0, index) + pairSum + numString.substring(index + 2);
    }
}

switchTurn = (nextPlayer) => {
    this.player = nextPlayer;

    if (this.player === "User") {
        this.updateStatusMessage("User move.");
        this.isUser = true;
    } else {
        this.updateStatusMessage("Computer move. Please wait...");
        this.isUser = false;
        setTimeout(() => this.computerMove(), 2000);
    }

    this.updateUi();
};

updateStatusMessage = (message) => {
    const statusMessageEl = document.getElementById('status-message');
    statusMessageEl.innerText = message;
};
