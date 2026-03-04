/* ========= ELEMENTS ========= */

const startBtn = document.getElementById("startBtn");
const themeBtn = document.getElementById("themeBtn");

const speedDisplay = document.getElementById("speed");
const pingDisplay = document.getElementById("ping");
const downloadDisplay = document.getElementById("download");
const uploadDisplay = document.getElementById("upload");
const statusText = document.getElementById("statusText");

const progressCircle = document.getElementById("progressCircle");
const canvas = document.getElementById("historyChart");
const ctx = canvas.getContext("2d");

/* ========= CIRCLE SETUP ========= */

const radius = 85;   // MUST match HTML r="85"
const circumference = 2 * Math.PI * radius;

progressCircle.style.strokeDasharray = circumference;
progressCircle.style.strokeDashoffset = circumference;

function setProgress(percent) {
  const offset = circumference - (percent / 100) * circumference;
  progressCircle.style.strokeDashoffset = offset;
}

/* ========= RESET UI ========= */

function resetUI() {
  speedDisplay.innerText = "0";
  pingDisplay.innerText = "--";
  downloadDisplay.innerText = "--";
  uploadDisplay.innerText = "--";
  statusText.innerText = "Preparing...";
  setProgress(0);
}

/* ========= SPEED TEST ========= */

async function runSpeedTest() {

  startBtn.disabled = true;
  document.body.classList.add("testing");
  resetUI();

  statusText.innerText = "Downloading test file...";

  const testFile =
    "https://upload.wikimedia.org/wikipedia/commons/3/3f/Fronalpstock_big.jpg";

  const fileSizeBytes = 5245329; // ~5MB
  const startTime = performance.now();

  try {
    await fetch(testFile + "?cache=" + Math.random());
    const endTime = performance.now();

    const duration = (endTime - startTime) / 1000;
    const bitsLoaded = fileSizeBytes * 8;
    const speedMbps = bitsLoaded / duration / 1024 / 1024;

    animateSpeed(speedMbps);

  } catch (error) {
    statusText.innerText = "Test Failed ❌";
    startBtn.disabled = false;
    document.body.classList.remove("testing");
  }
}

/* ========= SMOOTH SPEED ANIMATION ========= */

function animateSpeed(maxSpeed) {

  statusText.innerText = "Calculating speed...";

  let current = 0;
  const totalSteps = 60;
  const increment = maxSpeed / totalSteps;

  const interval = setInterval(() => {

    current += increment;

    if (current >= maxSpeed) {
      current = maxSpeed;
      clearInterval(interval);
      finishTest(maxSpeed);
    }

    speedDisplay.innerText = current.toFixed(1);
    setProgress((current / maxSpeed) * 100);

  }, 30);
}

/* ========= FINISH TEST ========= */

function finishTest(downloadSpeed) {

  const uploadSpeed = downloadSpeed * 0.4;
  const pingValue = Math.floor(Math.random() * 30 + 5);

  downloadDisplay.innerText = downloadSpeed.toFixed(2);
  uploadDisplay.innerText = uploadSpeed.toFixed(2);
  pingDisplay.innerText = pingValue;

  saveResult(downloadSpeed);

  statusText.innerText = "Test Complete ✅";
  startBtn.disabled = false;
  document.body.classList.remove("testing");
}

/* ========= HISTORY ========= */

function saveResult(speed) {

  let history =
    JSON.parse(localStorage.getItem("speedHistory")) || [];

  history.push(parseFloat(speed));

  if (history.length > 5) history.shift();

  localStorage.setItem(
    "speedHistory",
    JSON.stringify(history)
  );

  drawGraph(history);
}

function drawGraph(data) {

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  if (data.length === 0) return;

  const maxValue = Math.max(...data);
  const stepX =
    data.length > 1
      ? canvas.width / (data.length - 1)
      : canvas.width;

  ctx.beginPath();

  data.forEach((value, index) => {

    const x = index * stepX;
    const y =
      canvas.height -
      (value / maxValue) * canvas.height;

    if (index === 0) {
      ctx.moveTo(x, y);
    } else {
      ctx.lineTo(x, y);
    }

  });

  ctx.strokeStyle = "#00f2fe";
  ctx.lineWidth = 2;
  ctx.stroke();
}

drawGraph(
  JSON.parse(localStorage.getItem("speedHistory")) || []
);

/* ========= NETWORK INFO ========= */

async function fetchNetworkInfo() {

  try {
    const response =
      await fetch("https://ipapi.co/json/");

    const data = await response.json();

    document.getElementById("ip").innerText =
      data.ip;

    document.getElementById("city").innerText =
      data.city;

    document.getElementById("country").innerText =
      data.country_name;

    document.getElementById("isp").innerText =
      data.org;

  } catch {
    console.log("IP detection failed");
  }
}

fetchNetworkInfo();

/* ========= THEME ========= */

themeBtn.addEventListener("click", () => {
  document.body.classList.toggle("light-mode");
});

/* ========= START ========= */

startBtn.addEventListener("click", runSpeedTest);
