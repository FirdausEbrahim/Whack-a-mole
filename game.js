// Variables - buttons and text
var startBtn = document.getElementById("startBtn");
var pauseBtn = document.getElementById("pauseBtn");
var saveBtn = document.getElementById("saveBtn");
var loadBtn = document.getElementById("loadBtn");
var resetBtn = document.getElementById("resetBtn");
var backBtn = document.getElementById("backBtn");

var displayPlayer = document.getElementById("displayPlayer");
var displayScore = document.getElementById("displayScore");
var displayHits = document.getElementById("displayHits");
var displayMisses = document.getElementById("displayMisses");
var displayTimeLeft = document.getElementById("displayTimeLeft");
var displayDifficulty = document.getElementById("displayDifficulty");
var displayGameLength = document.getElementById("displayGameLength");
var displayTheme = document.getElementById("displayTheme");
var displayBestScore = document.getElementById("displayBestScore");

var messageArea = document.getElementById("messageArea");
var logArea = document.getElementById("logArea");
var holeButtons = document.querySelectorAll(".mole-hole");
const sound = new Audio('button-click(chosic.com).mp3');


// Arrays
var holes = [];
var moleHistory = [];
var moleTypes = ["normal", "bonus"]
var gameLogs = [];

// Object constructors
function Hole(index, button, moleSpan) {
  this.index = index;
  this.button = button;
  this.moleSpan = moleSpan;
  this.isVisible = false;
  this.moleType = "";
}

Hole.prototype.showMole = function (type, theme) {
  this.isVisible = true;
  this.moleType = type;

  this.moleSpan.textContent = getMoleSymbol(type, theme);
  this.moleSpan.className = "mole up " + theme;

  if (type === "bonus") {
    this.moleSpan.className += " bonus";
  }
};

Hole.prototype.hideMole = function () {
  this.isVisible = false;
  this.moleType = "";
  this.moleSpan.textContent = "";
  this.moleSpan.className = "mole";
};

function GameState(settings) {
  this.playerName = settings.playerName;
  this.difficulty = settings.difficulty;
  this.gameLength = settings.gameLength;
  this.theme = settings.theme;
  this.sound = settings.sound;
  this.doublePoints = settings.doublePoints;
  this.bonusMole = settings.bonusMole;

  this.score = 0;
  this.hits = 0;
  this.misses = 0;
  this.timeLeft = settings.gameLength;
  this.isRunning = false;
  this.isPaused = false;
}

GameState.prototype.addPoints = function (points) {
  this.score = this.score + points;
};

GameState.prototype.addHit = function () {
  this.hits = this.hits + 1;
};

GameState.prototype.addMiss = function () {
  this.misses = this.misses + 1;
};


// Game variables
var gameSettings = getLauncherSettings();
var gameState = new GameState(gameSettings);

var roundTimer = null;
var hideTimer = null;
var countdownTimer = null;
var currentHoleIndex = -1;


// Functions with return values
function getLauncherSettings() {
  var rawSettings = sessionStorage.getItem("launcherSettings");
  var settingsObject;

  if (rawSettings !== null) {
    settingsObject = JSON.parse(rawSettings);
    return settingsObject;
  }

  return {
    playerName: getPlayerNameFromCookie() || "Player 1",
    difficulty: "medium",
    gameLength: 30,
    theme: "classic",
    sound: true,
    doublePoints: false,
    bonusMole: true,
  };
}

function getPlayerNameFromCookie() {
  var allCookies = document.cookie.split(";");
  var i;
  var parts;
  var namePart;
  var valuePart;

  for (i = 0; i < allCookies.length; i++) {
    parts = allCookies[i].trim().split("=");
    namePart = parts[0];
    valuePart = parts.slice(1).join("=");

    if (namePart === "playerName") {
      return decodeURIComponent(valuePart);
    }
  }

  return "";
}

function getBestScoreCookie() {
  var allCookies = document.cookie.split(";");
  var i;
  var parts;
  var namePart;
  var valuePart;

  for (i = 0; i < allCookies.length; i++) {
    parts = allCookies[i].trim().split("=");
    namePart = parts[0];
    valuePart = parts.slice(1).join("=");

    if (namePart === "bestScore") {
      return parseInt(decodeURIComponent(valuePart), 10) || 0;
    }
  }

  return 0;
}

function getMoleSymbol(type, theme) {
  if (theme === "farm") {
    if (type === "bonus") {
      return "🐮";
    }
    return "🐷";
  }

  if (theme === "robots") {
    if (type === "bonus") {
      return "⚡";
    }
    return "🤖";
  }

  if (type === "bonus") {
    return "👑";
  }

  return "🐹";
}

function getRandomNumber(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function getDifficultySettings(difficulty) {
  if (difficulty === "easy") {
    return {
      speed: 5000,
      visibleTime: 5500,
    };
  }

  if (difficulty === "hard") {
    return {
      speed: 2500,
      visibleTime: 3000,
    };
  }

  return {
    speed: 4000,
    visibleTime: 4500,
  };
}

function getRandomHoleIndex() {
  return getRandomNumber(0, holes.length - 1);
}

function getMoleType() {
  if (gameState.bonusMole === true) {
    if (Math.random() < 0.2) {
      return moleTypes[1];
    }
  }

  return moleTypes[0];
}

function getPoints(type) {
  var points = 1;

  if (type === "bonus") {
    points = 3;
  }

  if (gameState.doublePoints === true) {
    points = points * 2;
  }
whackMole();
 return points;
}

//whack a mole sound effect

function whackMole() {
  sound.currentTime = 0; 
  sound.play();

  console.log("Test")
}

// Functions with parameters
function setCookie(name, value, days) {
  document.cookie =
    name +
    "=" +
    encodeURIComponent(value) +
    "; max-age=" +
    days * 24 * 60 * 60 +
    "; path=/";
}

function setMessage(text) {
  messageArea.textContent = text;
}

function addLog(text) {
  gameLogs.push(text);
  displayLogs();
  console.log(text);
}

function displayLogs() {
  var i;
  var logText = "";

  for (i = 0; i < gameLogs.length; i++) {
    logText = logText + gameLogs[i] + "\n";
  }

  logArea.textContent = logText;
}

function saveGameStateToSession() {
  var savedState = {
    score: gameState.score,
    hits: gameState.hits,
    misses: gameState.misses,
    timeLeft: gameState.timeLeft,
    isRunning: gameState.isRunning,
    isPaused: gameState.isPaused,
    currentHoleIndex: currentHoleIndex,
    holeType: currentHoleIndex >= 0 ? holes[currentHoleIndex].moleType : "",
  };

  sessionStorage.setItem("savedGameState", JSON.stringify(savedState));
}

function updateDisplay() {
  displayPlayer.textContent = gameState.playerName;
  displayScore.textContent = gameState.score;
  displayHits.textContent = gameState.hits;
  displayMisses.textContent = gameState.misses;
  displayTimeLeft.textContent = gameState.timeLeft + " s";
  displayDifficulty.textContent = gameState.difficulty;
  displayGameLength.textContent = gameState.gameLength + " s";
  displayTheme.textContent = gameState.theme;
  displayBestScore.textContent = getBestScoreCookie();
}

function hideAllMoles() {
  var i;

  for (i = 0; i < holes.length; i++) {
    holes[i].hideMole();
  }

  currentHoleIndex = -1;
}

function showRandomMole() {
  var difficultyObject;
  var holeIndex;
  var hole;
  var moleType;

  if (gameState.isRunning === false || gameState.isPaused === true) {
    return;
  }

  difficultyObject = getDifficultySettings(gameState.difficulty);

  hideAllMoles();

  holeIndex = getRandomHoleIndex();
  hole = holes[holeIndex];
  moleType = getMoleType();

  hole.showMole(moleType, gameState.theme);
  currentHoleIndex = holeIndex;

  moleHistory.push({
    hole: holeIndex,
    type: moleType,
    time: new Date().toLocaleTimeString(),
  });

  hideTimer = setTimeout(function () {
    if (currentHoleIndex >= 0) {
      holes[currentHoleIndex].hideMole();
      currentHoleIndex = -1;
    }
  }, difficultyObject.visibleTime);
}

function startRoundLoop() {
  var difficultyObject = getDifficultySettings(gameState.difficulty);

  roundTimer = setInterval(function () {
    showRandomMole();
  }, difficultyObject.speed);
}

function startCountdown() {
  countdownTimer = setInterval(function () {
    if (gameState.isPaused === true) {
      return;
    }

    gameState.timeLeft = gameState.timeLeft - 1;
    updateDisplay();

    if (gameState.timeLeft <= 0) {
      endGame();
    }
  }, 1000);
}

function clearTimers() {
  clearInterval(roundTimer);
  clearInterval(countdownTimer);
  clearTimeout(hideTimer);
}

function endGame() {
  var bestScore = getBestScoreCookie();

  clearTimers();
  hideAllMoles();
  gameState.isRunning = false;
  gameState.isPaused = false;

  if (gameState.score > bestScore) {
    setCookie("bestScore", gameState.score, 30);
    displayBestScore.textContent = gameState.score;
  }

  saveGameStateToSession();
  setMessage("Game over. Your final score: " + gameState.score);
  addLog("Game over. Your final score = " + gameState.score);

  alert("Game over! Your final score: " + gameState.score);
}

function startGame() {
  clearTimers();
  hideAllMoles();
gameLogs = [];
displayLogs();

  gameState.score = 0;
  gameState.hits = 0;
  gameState.misses = 0;
  gameState.timeLeft = gameState.gameLength;
  gameState.isRunning = true;
  gameState.isPaused = false;

  updateDisplay();
  setMessage("Game started. Click the moles.");
  addLog("Game started for " + gameState.playerName + ".");

  showRandomMole();
  startRoundLoop();
  startCountdown();
}

function pauseResumeGame() {
  if (gameState.isRunning === false) {
    alert("Start the game first.");
    return;
  }

  gameState.isPaused = !gameState.isPaused;

  if (gameState.isPaused === true) {
    setMessage("Game paused.");
    addLog("Game paused.");
  } else {
    setMessage("Game resumed.");
    addLog("Game resumed.");
  }

  saveGameStateToSession();
}

function saveGame() {
  saveGameStateToSession();
  alert("Game state saved.");
}

function loadGame() {
  var rawGameState = sessionStorage.getItem("savedGameState");
  var savedState;

  if (rawGameState === null) {
    alert("No saved game found.");
    return;
  }

  savedState = JSON.parse(rawGameState);

  clearTimers();
  hideAllMoles();

  gameState.score = savedState.score;
  gameState.hits = savedState.hits;
  gameState.misses = savedState.misses;
  gameState.timeLeft = savedState.timeLeft;
  gameState.isRunning = savedState.isRunning;
  gameState.isPaused = savedState.isPaused;

  updateDisplay();

  if (savedState.currentHoleIndex >= 0) {
    holes[savedState.currentHoleIndex].showMole(
      savedState.holeType,
      gameState.theme,
    );
    currentHoleIndex = savedState.currentHoleIndex;
  }
}

function resetGame() {
  var userConfirmed = confirm("Do you want to reset the game?");

  if (userConfirmed === false) {
    return;
  }

  clearTimers();
  hideAllMoles();
  gameLogs = [];
displayLogs();

  gameState.score = 0;
  gameState.hits = 0;
  gameState.misses = 0;
  gameState.timeLeft = gameState.gameLength;
  gameState.isRunning = false;
  gameState.isPaused = false;

  sessionStorage.removeItem("savedGameState");

  updateDisplay();
  setMessage("Game reset. Click Start Game when ready.");
  addLog("Game reset.");
}

function goBackToSettings() {
  window.location.href = "index.html";
}

function clickHole(event) {
  var clickedIndex = parseInt(
    event.currentTarget.getAttribute("data-index"),
    10,
  );
  var selectedHole = holes[clickedIndex];
  var points;

  if (gameState.isRunning === false) {
    alert("Please start the game first.");
    return;
  }

  if (gameState.isPaused === true) {
    alert("The game is paused.");
    return;
  }

  if (selectedHole.isVisible === true) {
    points = getPoints(selectedHole.moleType);

    gameState.addPoints(points);
    gameState.addHit();

    selectedHole.hideMole();
    currentHoleIndex = -1;
  } else {
    gameState.addMiss();
  }

  updateDisplay();
  saveGameStateToSession();
}

function createHoleObjects() {
  var i;
  var moleSpan;

  for (i = 0; i < holeButtons.length; i++) {
    moleSpan = holeButtons[i].querySelector(".mole");
    holes.push(new Hole(i, holeButtons[i], moleSpan));
  }
}

function addEvents() {
  var i;

  startBtn.addEventListener("click", startGame);
  pauseBtn.addEventListener("click", pauseResumeGame);
  saveBtn.addEventListener("click", saveGame);
  loadBtn.addEventListener("click", loadGame);
  resetBtn.addEventListener("click", resetGame);
  backBtn.addEventListener("click", goBackToSettings);

  for (i = 0; i < holes.length; i++) {
    holes[i].button.addEventListener("click", clickHole);
  }
}

function startPage() {
  createHoleObjects();
  addEvents();
  updateDisplay();
  
}

startPage();
