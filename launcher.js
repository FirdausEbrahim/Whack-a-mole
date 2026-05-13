"use strict";

// Variables - form elements
var setupForm = document.getElementById("setupForm");
var playerNameInput = document.getElementById("playerName");
var difficultySelect = document.getElementById("difficulty");
var gameLengthSelect = document.getElementById("gameLength");
var themeRadios = document.querySelectorAll('input[name="theme"]');
var soundCheckbox = document.getElementById("soundEnabled");
var doublePointsCheckbox = document.getElementById("doublePoints");
var bonusMoleCheckbox = document.getElementById("bonusMole");

var openGameBtn = document.getElementById("openGameBtn");
var saveSettingsBtn = document.getElementById("saveSettingsBtn");
var loadSettingsBtn = document.getElementById("loadSettingsBtn");
var resetSettingsBtn = document.getElementById("resetSettingsBtn");

var previewText = document.getElementById("previewText");

// Objects
function LauncherSettings(
  playerName,
  difficulty,
  gameLength,
  theme,
  sound,
  doublePoints,
  bonusMole,
) {
  this.playerName = playerName;
  this.difficulty = difficulty;
  this.gameLength = gameLength;
  this.theme = theme;
  this.sound = sound;
  this.doublePoints = doublePoints;
  this.bonusMole = bonusMole;
}

LauncherSettings.prototype.getSummary = function () {
  return (
    "Player: " +
    this.playerName +
    " | Difficulty: " +
    this.difficulty +
    " | Length: " +
    this.gameLength +
    " seconds" +
    " | Theme: " +
    this.theme +
    " | Sound: " +
    yesOrNo(this.sound) +
    " | Double points: " +
    yesOrNo(this.doublePoints) +
    " | Bonus mole: " +
    yesOrNo(this.bonusMole)
  );
};

LauncherSettings.prototype.toObject = function () {
  return {
    playerName: this.playerName,
    difficulty: this.difficulty,
    gameLength: this.gameLength,
    theme: this.theme,
    sound: this.sound,
    doublePoints: this.doublePoints,
    bonusMole: this.bonusMole,
  };
};

// Arrays
var difficultyList = ["easy", "medium", "hard"];
var themeList = ["classic", "farm", "robots"];
var lengthList = [20, 30, 45];

// Functions
function yesOrNo(value) {
  if (value === true) {
    return "Yes";
  }
  return "No";
}

function getSelectedTheme() {
  var i;

  for (i = 0; i < themeRadios.length; i++) {
    if (themeRadios[i].checked) {
      return themeRadios[i].value;
    }
  }

  return "classic";
}

function getTrimmedName(name) {
  return name.trim();
}

function capitaliseWord(text) {
  if (text.length === 0) {
    return text;
  }

  return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();
}

function readFormValues() {
  var playerName = getTrimmedName(playerNameInput.value);
  var difficulty = difficultySelect.value;
  var gameLength = parseInt(gameLengthSelect.value, 10);
  var theme = getSelectedTheme();
  var sound = soundCheckbox.checked;
  var doublePoints = doublePointsCheckbox.checked;
  var bonusMole = bonusMoleCheckbox.checked;

  return new LauncherSettings(
    playerName,
    difficulty,
    gameLength,
    theme,
    sound,
    doublePoints,
    bonusMole,
  );
}

function validateSettings(settings) {
  if (settings.playerName === "") {
    return false;
  }

  if (settings.playerName.length < 2) {
    return false;
  }

  if (difficultyList.indexOf(settings.difficulty) === -1) {
    return false;
  }

  if (themeList.indexOf(settings.theme) === -1) {
    return false;
  }

  if (lengthList.indexOf(settings.gameLength) === -1) {
    return false;
  }

  return true;
}

function updatePreview() {
  var settings = readFormValues();

  if (settings.playerName === "") {
    previewText.textContent = "Please enter a player name to preview the game.";
  } else {
    previewText.textContent = settings.getSummary();
  }
}

function savePlayerNameCookie(name) {
  document.cookie =
    "playerName=" +
    encodeURIComponent(name) +
    "; max-age=" +
    60 * 60 * 24 * 30 +
    "; path=/";
}

function getCookieValue(cookieName) {
  var allCookies = document.cookie.split(";");
  var i;
  var cookieParts;
  var namePart;
  var valuePart;

  for (i = 0; i < allCookies.length; i++) {
    cookieParts = allCookies[i].trim().split("=");
    namePart = cookieParts[0];
    valuePart = cookieParts.slice(1).join("=");

    if (namePart === cookieName) {
      return decodeURIComponent(valuePart);
    }
  }

  return "";
}

function saveSettings() {
  var settings = readFormValues();

  if (!validateSettings(settings)) {
    alert("Please enter a valid player name before saving.");
    return;
  }

  sessionStorage.setItem(
    "launcherSettings",
    JSON.stringify(settings.toObject()),
  );
  savePlayerNameCookie(settings.playerName);

  console.log("Settings saved:", settings.toObject());
  alert("Settings saved successfully.");
  updatePreview();
}

function loadSettings() {
  var rawSettings = sessionStorage.getItem("launcherSettings");
  var savedPlayerName = getCookieValue("playerName");
  var settingsObject;

  if (rawSettings !== null) {
    settingsObject = JSON.parse(rawSettings);

    playerNameInput.value = settingsObject.playerName;
    difficultySelect.value = settingsObject.difficulty;
    gameLengthSelect.value = String(settingsObject.gameLength);
    soundCheckbox.checked = settingsObject.sound;
    doublePointsCheckbox.checked = settingsObject.doublePoints;
    bonusMoleCheckbox.checked = settingsObject.bonusMole;

    setTheme(settingsObject.theme);

    alert("Saved settings loaded.");
    console.log("Settings loaded:", settingsObject);
  } else if (savedPlayerName !== "") {
    playerNameInput.value = savedPlayerName;
    alert("Only the player name cookie was found, so that value was loaded.");
  } else {
    alert("No saved settings found.");
  }

  updatePreview();
}

function setTheme(theme) {
  var i;

  for (i = 0; i < themeRadios.length; i++) {
    themeRadios[i].checked = themeRadios[i].value === theme;
  }
}

function resetSettings() {
  var userConfirmed = confirm("Are you sure you want to reset all settings?");

  if (!userConfirmed) {
    return;
  }

  playerNameInput.value = "";
  difficultySelect.value = "medium";
  gameLengthSelect.value = "30";
  setTheme("classic");
  soundCheckbox.checked = true;
  doublePointsCheckbox.checked = false;
  bonusMoleCheckbox.checked = true;

  sessionStorage.removeItem("launcherSettings");

  previewText.textContent = "No settings selected yet.";
  console.log("Settings reset.");
  alert("Settings have been reset.");
}

function ensurePlayerName(settings) {
  var enteredName = settings.playerName;
  var promptedName;

  if (enteredName !== "") {
    return enteredName;
  }

  promptedName = prompt("Please enter your player name:", "Player 1");

  if (promptedName === null) {
    return "";
  }

  promptedName = getTrimmedName(promptedName);

  if (promptedName === "") {
    return "";
  }

  return promptedName;
}

function openGameWindow() {
  var settings = readFormValues();
  var finalName = ensurePlayerName(settings);

  if (finalName === "") {
    alert("A player name is required before the game can open.");
    return;
  }

  settings.playerName = finalName;
  playerNameInput.value = finalName;

  if (!validateSettings(settings)) {
    alert("Please complete the launcher form correctly.");
    return;
  }

  sessionStorage.setItem(
    "launcherSettings",
    JSON.stringify(settings.toObject()),
  );
  savePlayerNameCookie(settings.playerName);

  console.log("Opening game with settings:", settings.toObject());

  window.open("game.html", "_blank", "width=1100,height=900");
}

function loadPlayerNameFromCookie() {
  var cookieName = getCookieValue("playerName");

  if (cookieName !== "" && playerNameInput.value.trim() === "") {
    playerNameInput.value = cookieName;
  }
}

// Events
setupForm.addEventListener("input", updatePreview);
difficultySelect.addEventListener("change", updatePreview);
gameLengthSelect.addEventListener("change", updatePreview);

openGameBtn.addEventListener("click", openGameWindow);
saveSettingsBtn.addEventListener("click", saveSettings);
loadSettingsBtn.addEventListener("click", loadSettings);
resetSettingsBtn.addEventListener("click", resetSettings);


// Start-up
loadPlayerNameFromCookie();
updatePreview();
