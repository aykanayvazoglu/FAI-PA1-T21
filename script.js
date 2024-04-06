lengthSubmit = () => {
    this.length = parseInt(document.getElementById("length-input").value);

    if (!this.length) {
        alert("Please enter the length!");
    } else {
        this.settings();
        this.generateNumString();
    }
}

generateNumString = () => {
    this.numString = '';

    for (let i = 0; i < this.length; i++) {
        this.numString += Math.floor(Math.random() * 6) + 1;
    }
}

settings = () => {
    this.settingsPage = document.getElementById("game-start");
    this.setupPage = document.getElementById("game-setup");

    this.setupPage.style.display = "none";
    this.settingsPage.style.display = "block";
}

start = () => {
    this.player = document.getElementById("player").value;
    this.algorithm = document.getElementById("algorithm").value;

    this.stage = document.getElementById("game-menu");

    this.stage.style.display = "block";
    this.settingsPage.style.display = "none";

    this.numStringContainer = document.getElementById("numerical-string");
    this.numStringContainer.innerText = this.numString;

    this.userScore = 0;
    this.computerScore = 0;

    this.playerNameContainer = document.getElementById("current-player");
    this.playerNameContainer.innerText = 'Current Player: ' + this.player;

    this.algorithmContainer = document.getElementById("current-algorithm");
    this.algorithmContainer.innerText = 'Algorithm: ' + this.algorithm;
}

