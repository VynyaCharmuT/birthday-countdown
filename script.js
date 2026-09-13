const TARGET = new Date("2026-09-17T00:00:00");

const countdownView = document.getElementById("countdownView");
const birthdayView = document.getElementById("birthdayView");
const beforeView = document.getElementById("beforeView");
const daysEl = document.getElementById("days");
const hoursEl = document.getElementById("hours");
const minutesEl = document.getElementById("minutes");
const secondsEl = document.getElementById("seconds");
const headline = document.getElementById("headline");
const subline = document.getElementById("subline");

function pad(n) {
  return String(Math.max(0, n)).padStart(2, "0");
}

function showCountdown(diff) {
  countdownView.classList.remove("hidden");
  birthdayView.classList.add("hidden");
  beforeView.classList.add("hidden");
  document.body.classList.remove("birthday-mode");

  const totalSeconds = Math.floor(diff / 1000);
  const days = Math.floor(totalSeconds / 86400);
  const hours = Math.floor((totalSeconds % 86400) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  daysEl.textContent = pad(days);
  hoursEl.textContent = pad(hours);
  minutesEl.textContent = pad(minutes);
  secondsEl.textContent = pad(seconds);

  if (days >= 3) {
    headline.innerHTML = '3 days more until your day <span>♡</span>';
    subline.textContent = "3 days more... something special is getting closer.";
  } else if (days === 2) {
    headline.innerHTML = '2 days more until your day <span>♡</span>';
    subline.textContent = "2 days more... getting closer, birthday boy.";
  } else if (days === 1) {
    headline.innerHTML = '1 day more until your day <span>♡</span>';
    subline.textContent = "1 day more... tomorrow is all yours.";
  } else {
    headline.innerHTML = 'It\'s almost your day <span>♡</span>';
    subline.textContent = "counting every little second until you.";
  }
}

function makeConfetti() {
  const box = document.getElementById("confetti");
  box.innerHTML = "";
  for (let i = 0; i < 75; i++) {
    const piece = document.createElement("i");
    piece.style.left = Math.random() * 100 + "%";
    piece.style.setProperty("--x", (Math.random() * 180 - 90) + "px");
    piece.style.animationDelay = (Math.random() * 1.8) + "s";
    piece.style.animationDuration = (3.5 + Math.random() * 2.2) + "s";
    box.appendChild(piece);
  }
  setTimeout(() => box.innerHTML = "", 7500);
}

let celebrated = false;

function showBirthday() {
  countdownView.classList.add("hidden");
  beforeView.classList.add("hidden");
  birthdayView.classList.remove("hidden");
  document.body.classList.add("birthday-mode");

  if (!celebrated) {
    celebrated = true;
    makeConfetti();
  }
}

function update() {
  const now = new Date();

  // The countdown is visible immediately and runs continuously until
  // midnight at the start of September 17, 2026.
  if (now >= TARGET) {
    showBirthday();
  } else {
    showCountdown(TARGET - now);
  }
}

update();
setInterval(update, 1000);
