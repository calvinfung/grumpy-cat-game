// Tracks user turn
let isUserTurn = false;

// Get the canvas and context
const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

// Create a new image object
const image = new Image();
image.src = "assets/face.png"; // Path to your image file

// Create audio objects
const meowSound = new Audio("assets/cat-meow.mp3");
const buttonPressSound = new Audio("assets/button-press.mp3");
const victorySound = new Audio("assets/victory.mp3");
const chimeSound = new Audio("assets/chime.mp3");
const gameOverSound = new Audio("assets/game-over.mp3");

// Define possible actions
const actions = ["P", "G", "T"];
let sequence = [];
let userSequence = [];
let currentRound = 0;
const maxRounds = 3;

// Draw the image on the canvas when it has loaded
image.onload = () => {
  drawCat();
  initializeGame();
};

function drawCat() {
  // Get canvas dimensions
  const canvasWidth = canvas.width;
  const canvasHeight = canvas.height;

  // Desired dimensions for the image
  const desiredWidth = 300; // Set the desired width of the image
  const desiredHeight = 300; // Set the desired height of the image

  // Calculate position to center the image
  const x = (canvasWidth - desiredWidth) / 2;
  const y = (canvasHeight - desiredHeight) / 2;

  // Draw the image with the specified width and height
  ctx.drawImage(image, x, y, desiredWidth, desiredHeight);
}

function initializeGame() {
  document.getElementById("message").textContent =
    "Tap Grumpy Cat's nose to start!";
  document.getElementById("nose-button").style.display = "block";
  document.getElementById("buttons").style.display = "none";
}

function startGame() {
  sequence = [];

  isUserTurn = false;
  document.getElementById("nose-button").style.display = "none";
  document.getElementById("buttons").style.display = "flex";

  // Play the meow sound
  meowSound
    .play()
    .then(() => {
      // Start the countdown after the meow sound plays
      countdown(3, nextRound);
    })
    .catch((error) => {
      console.error("Error playing sound:", error);
      // If there's an error playing the sound, start the countdown anyway
      countdown(3, nextRound);
    });
}

function nextRound() {
  if (currentRound < maxRounds) {
    currentRound++;

    // Generate a new sequence for the initial 3 rounds
    if (currentRound <= 3) {
      sequence = [];
      for (let i = 0; i < 3; i++) {
        sequence.push(actions[Math.floor(Math.random() * actions.length)]);
      }
    } else {
      // Add one more action to the sequence for subsequent rounds
      sequence.push(actions[Math.floor(Math.random() * actions.length)]);
    }

    displaySequence();
  } else {
    endGame(true);
  }
}

function countdown(seconds, callback) {
  if (seconds > 0) {
    document.getElementById("message").textContent = seconds.toString();
    chimeSound
      .play()
      .then(() => {
        setTimeout(() => countdown(seconds - 1, callback), 2000);
      })
      .catch((error) => {
        console.error("Error playing sound:", error);
        // Continue the countdown even if there is an error playing the sound
        setTimeout(() => countdown(seconds - 1, callback), 2000);
      });
  } else {
    document.getElementById("message").textContent = "Watch the sequence!";
    setTimeout(callback, 1000);
  }
}

function displaySequence() {
  let index = 0;
  document.getElementById("message").textContent = "Watch the sequence!";

  function animateAction() {
    if (index < sequence.length) {
      showAction(sequence[index]);

      // Schedule the next action
      setTimeout(() => {
        // Clear the highlight
        clearHighlight();

        // Wait a bit before the next action
        setTimeout(() => {
          index++;
          animateAction();
        }, 250); // 250ms gap between actions
      }, 500); // Action displayed for 500ms
    } else {
      setTimeout(startUserTurn, 500);
    }
  }

  animateAction();
}

function showAction(action) {
  let actionText = "";
  switch (action) {
    case "P":
      actionText = "Play";
      break;
    case "G":
      actionText = "Give treat";
      break;
    case "T":
      actionText = "Pet";
      break;
  }

  document.getElementById("message").textContent = actionText;
  highlightButton(action);

  // Play the button press sound
  buttonPressSound.currentTime = 0; // Reset the audio to the beginning
  buttonPressSound
    .play()
    .catch((error) => console.error("Error playing button sound:", error));
}

function highlightButton(action) {
  const buttonIndex = action === "T" ? 0 : action === "P" ? 1 : 2;
  const button = document.querySelectorAll(".game-button")[buttonIndex];
  button.classList.add("highlight");
}

function clearHighlight() {
  document.querySelectorAll(".game-button").forEach((button) => {
    button.classList.remove("highlight");
  });
}

function startUserTurn() {
  userSequence = [];
  isUserTurn = true;
  document.getElementById("message").textContent =
    "Your turn! Repeat the sequence.";
}

function handleUserInput(action) {
  userSequence.push(action);
  if (userSequence.length === sequence.length) {
    checkSequence();
  }
}

function checkSequence() {
  isUserTurn = false; // Reset the flag
  if (userSequence.join("") === sequence.join("")) {
    if (currentRound === maxRounds) {
      endGame(true);
    } else {
      document.getElementById("message").textContent = "Correct! Next round...";
      setTimeout(nextRound, 1500);
    }
  } else {
    endGame(false);
  }
}

// Modify your button click handlers:
document.querySelectorAll(".game-button").forEach((button) => {
  button.addEventListener("click", function () {
    // Only process input if it's the user's turn
    if (isUserTurn) {
      let action =
        this.dataset.value === "1"
          ? "T"
          : this.dataset.value === "2"
          ? "P"
          : "G";

      // Play the button press sound and highlight effect
      buttonPressSound.currentTime = 0;
      buttonPressSound
        .play()
        .catch((error) => console.error("Error playing button sound:", error));

      this.classList.add("highlight");
      setTimeout(() => {
        this.classList.remove("highlight");
      }, 250);

      handleUserInput(action);
    }
    // If it's not the user's turn, do nothing
  });
});

function endGame(won) {
  if (won) {
    document.getElementById("message").textContent =
      "Congratulations! You've completed all rounds!";
    victorySound
      .play()
      .catch((error) => console.error("Error playing victory sound:", error));
  } else {
    document.getElementById(
      "message"
    ).textContent = `Game over! You reached round ${currentRound}. Tap Grumpy Cat's nose to start again!`;
    gameOverSound
      .play()
      .catch((error) => console.error("Error playing victory sound:", error));
  }
  document.getElementById("nose-button").style.display = "block";
  document.getElementById("buttons").style.display = "none";
  isUserTurn = false; // Ensure user can't interact with game buttons
}

// Add event listener for the cat's nose
document.getElementById("nose-button").addEventListener("click", startGame);

// The game will initialize after the image loads
