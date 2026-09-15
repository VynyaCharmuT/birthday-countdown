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
    subline.textContent = "1 day moreee... for it to be all yours.";
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


// --- Birthday candle interaction ---
const birthdayCake = document.getElementById("birthdayCake");
const blowButton = document.getElementById("blowButton");
const micStatus = document.getElementById("micStatus");
const wishPrompt = document.getElementById("wishPrompt");
const afterCandle = document.getElementById("afterCandle");
const openWhenButton = document.getElementById("openWhenButton");
const bouquetReveal = document.getElementById("bouquetReveal");

let candlesOut = false;
let listening = false;
let audioContext = null;
let micStream = null;
let analyser = null;
let micAnimation = null;

function candlesBlownOut() {
  if (candlesOut) return;
  candlesOut = true;
  listening = false;
  if (micAnimation) cancelAnimationFrame(micAnimation);
  if (micStream) micStream.getTracks().forEach(track => track.stop());
  if (audioContext && audioContext.state !== "closed") audioContext.close().catch(() => {});

  birthdayCake.classList.add("candles-out");
  wishPrompt.textContent = "wish made... ♡";
  blowButton.classList.add("hidden");
  micStatus.textContent = "the candles are out ✨";
  afterCandle.classList.remove("hidden");
  makeConfetti();
}

async function listenForBlow() {
  if (candlesOut || listening) return;

  // getUserMedia works on HTTPS (including GitHub Pages) and localhost.
  if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
    micStatus.textContent = "microphone isn't available — tap the button again to blow them out ♡";
    return;
  }

  try {
    listening = true;
    micStatus.textContent = "blow gently into your microphone... 💨";
    micStream = await navigator.mediaDevices.getUserMedia({ audio: true });
    audioContext = new (window.AudioContext || window.webkitAudioContext)();
    if (audioContext.state === "suspended") await audioContext.resume();

    const source = audioContext.createMediaStreamSource(micStream);
    analyser = audioContext.createAnalyser();
    analyser.fftSize = 1024;
    analyser.smoothingTimeConstant = 0.55;
    source.connect(analyser);

    const data = new Uint8Array(analyser.fftSize);
    const started = performance.now();
    let loudFrames = 0;

    function check() {
      if (!listening || candlesOut) return;
      analyser.getByteTimeDomainData(data);
      let sum = 0;
      for (let i = 0; i < data.length; i++) {
        const v = (data[i] - 128) / 128;
        sum += v * v;
      }
      const rms = Math.sqrt(sum / data.length);
      if (rms > 0.115) loudFrames += 1;
      else loudFrames = Math.max(0, loudFrames - 1);

      // A short sustained burst is enough to count as a blow.
      if (loudFrames >= 5) {
        candlesBlownOut();
        return;
      }

      if (performance.now() - started > 9000) {
        listening = false;
        if (micStream) micStream.getTracks().forEach(track => track.stop());
        micStatus.textContent = "didn't catch it? tap the button once more and the candles will go out ♡";
        return;
      }
      micAnimation = requestAnimationFrame(check);
    }
    check();
  } catch (error) {
    listening = false;
    if (micStream) micStream.getTracks().forEach(track => track.stop());
    micStatus.textContent = "microphone permission was unavailable — tap the button again to blow them out ♡";
  }
}

blowButton?.addEventListener("click", async () => {
  if (candlesOut) return;
  // First tap asks for microphone permission. If it cannot be used,
  // a second tap acts as the friendly fallback.
  if (!listening && micStatus.textContent.includes("tap the button once more")) {
    candlesBlownOut();
  } else {
    await listenForBlow();
  }
});

openWhenButton?.addEventListener("click", () => {
  bouquetReveal.classList.remove("hidden");
  openWhenButton.classList.add("hidden");
  document.querySelector(".open-teaser")?.classList.add("hidden");
  bouquetReveal.scrollIntoView({ behavior: "smooth", block: "center" });
});
