

function Player(query) {
  var element = document.querySelector(query);
  var trackWidth = parseInt(element.parentElement.offsetWidth);
  var minLeft = 0 - parseInt(element.offsetWidth / 2);
  var maxLeft = trackWidth - parseInt(element.offsetWidth / 2);

  function getLeft() {
    return parseInt(element.style.left);
  }

  this.getMinLeft = function() {
    return minLeft;
  };

  this.getMaxLeft = function() {
    return maxLeft;
  };

  this.move = function() {
    var left = getLeft();
    var speed = parseInt(element.attributes.getNamedItem("data-speed").value);

    element.style.left = (left + speed) + "px";

    if (getLeft() > maxLeft) {
      this.moveToFinish();
    } else if (getLeft() < minLeft) {
      this.moveToStart();
    }
  };

  this.moveToPercent = function(percent) {
    element.style.left = parseInt(percent * maxLeft) + "px";

    if (percent >= 100) {
      this.moveToFinish();
    } else if (percent <= 0) {
      this.moveToStart();
    }
  };

  this.isFinished = function() {
    return parseInt(element.style.left) >= maxLeft;
  };

  this.moveToStart = function() {
    element.style.left = this.getMinLeft() + "px";
  };

  this.moveToFinish = function() {
    element.style.left = this.getMaxLeft() + "px";
  };

  this.setSpeed = function(speed) {
    return element.attributes.getNamedItem("data-speed").value = speed;
  };
}

var hero = new Player("[data-name='goodGuy']");
var enemy = new Player("[data-name='badGuy']");

var tickPeriod = 500;
var gamesWon = 0;

var wordsToWrite = document.querySelector("#wordsToWrite");
var wordsWritten = document.querySelector("#wordsWritten");
var words = "";
var currentLetter = 0;

function isGameOver() {
  return hero.isFinished() || enemy.isFinished();
}

function tick() {

  hero.move();
  enemy.move();

  if (isGameOver()) {
    document.body.removeEventListener("keydown", handleKeyPress);

    if (hero.isFinished()) {
      gamesWon++;
      showWinPanel();
    } else if (enemy.isFinished()) {
      showLosePanel();
    }
  } else {
    setTimeout(tick, tickPeriod);
  }
}

function showWinPanel() {
  var panel = document.querySelector("#messageContainer");
  var leaderboard = document.querySelector("#messageContainer article section");
  var championForm = document.querySelector("#messageContainer form");
  var header = document.querySelector("#messageContainer h2");

  header.innerText = "You win the boat!";

  panel.classList.add("open");

  setTimeout(function(){
    championForm.classList.remove("closed");
    leaderboard.classList.remove("closed");
  }, 3000);
}

function showLosePanel() {
  var panel = document.querySelector("#messageContainer");
  var leaderboard = document.querySelector("#messageContainer article section");
  var championForm = document.querySelector("#messageContainer form");
  var header = document.querySelector("#messageContainer h2");

  header.innerText = "You lose. Try again.";

  panel.classList.add("open");

  setTimeout(function(){
    leaderboard.classList.remove("closed");
    championForm.classList.add("closed");
  }, 3000);
}

function saveNewChampion(event) {
  event.preventDefault();

  var name = this.elements.namedItem("fullName").value;
  var email = this.elements.namedItem("email").value;

  var champions = document.querySelector("#messageContainer ul");
  var rank = champions.children.length + 1;
  var difficulty = document.querySelector("#navOptions input[type='range']").value;

  var stars = "";
  for (var i = 0; i < difficulty; i++)
    stars += "*";

  if (rank > gamesWon)
    return false;

  var newChampion = document.createElement("li");
  newChampion.innerHTML = "<p>#" + rank + "</p>" +
                          "<p>" + name + " " + stars + "</p>" +
                          "<p><a href='mailto:" + email + "'>" + email + "</a></p>";

  champions.appendChild(newChampion);
}

function setEnemySpeed(speed) {
  enemy.setSpeed(speed * 23);
}

function handleKeyPress(event) {

  var wordsLen = wordsWritten.children.length;
  if (event.keyCode == 16)
    return false;

  if (event.keyCode == 8) {
    event.preventDefault();
    
    if (wordsLen < 1)
      return false;

    wordsWritten.children[wordsLen - 1].remove();
    return false;
  }

  var letter = String.fromCharCode(event.keyCode);

  if (!event.shiftKey && event.keyCode >= 65 && event.keyCode <= 90)   
      letter = String.fromCharCode(event.keyCode + 32);

  if (event.keyCode == 188)
    letter = ",";

  if (event.keyCode == 190)
    letter = ".";

  if (letter == words[wordsLen]) {
    wordsWritten.innerHTML += "<span class='correct'>" + letter + "</span>";
    var correct = document.querySelectorAll("#wordsWritten .correct").length;
    var percent = correct / words.length;
    hero.moveToPercent(percent);
  } else {
    wordsWritten.innerHTML += "<span class='wrong'>" + letter + "</span>";
  }

  return false;
}


function getWords() {
  var phrases = [
      "The quick brown fox stopped being quick once its hunter started wearing chrome.",
      "I must win my dream boat before the snaughty Mr. Snaughtington takes it from me.",
      "I love HTML5 because it is such an amazing platform to develop games in.",
      "People who type fast are more likely to win at this game. Yes, that is true.",
      "For some reason, I think I can have fun while typing, and improving at the same time."];
  var rand = parseInt(Math.random() * phrases.length);

  return phrases[rand];
}

function doOnPlayClicked() {
  var panel = document.querySelector("#messageContainer");
  var leaderboard = document.querySelector("#messageContainer article section");
  var championForm = document.querySelector("#messageContainer form");
  var difficulty = document.querySelector("#navOptions input[type='range']");
  var playBtn = document.querySelector("#mainContainer button[data-intent='play']");

  words = getWords();
  wordsToWrite.innerText = words;
  wordsWritten.innerText = "";

  currentLetter = 0;

  if (playBtn)
    playBtn.remove();

  panel.classList.remove("open");
  leaderboard.classList.add("closed");
  championForm.classList.add("closed");
  
  hero.moveToStart();
  enemy.moveToStart();
  setEnemySpeed(difficulty.value);
  hero.setSpeed(0);

  document.body.addEventListener("keydown", handleKeyPress);
  setTimeout(tick, tickPeriod);
}

function main() {
  // Make options navigation toggle when clicked
  var options = document.querySelector("#navOptions img");
  options.addEventListener("click", function(event) {
    event.preventDefault();

    if (options.parentElement.classList.contains("open"))
      options.parentElement.classList.remove("open");
    else
      options.parentElement.classList.add("open");
  });

  // Update difficulty value when slider changes
  var difficulty = document.querySelector("#navOptions input[type='range']");
  difficulty.addEventListener("change", function(event) {
    event.preventDefault();

    var difficultyIndicator = document.querySelector("#navOptions div p span");
    difficultyIndicator.innerText = this.value;

    setEnemySpeed(this.value);
  });

  // Handle new champion submission
  var newChampionForm = document.querySelector("#messageContainer form");
  newChampionForm.addEventListener("submit", saveNewChampion);

  var playBtn = document.querySelectorAll("button[data-intent='play']");

  for (var i = 0, len = playBtn.length; i < len; i++)
    playBtn[i].addEventListener("click", doOnPlayClicked);
}

main();
