const SOUNDS = [
  "sounds/sound1.mp3",
  "sounds/sound2.mp3",
];

const IMG_IDLE = "images/01.jpg";
const IMG_ACTIVE = "images/02.jpg";

const COUNTER_NAMESPACE = "awmc-dlx";
const COUNTER_KEY = "total-clicks";
const COUNTER_GET = `https://abacus.jasoncameron.dev/get/${COUNTER_NAMESPACE}/${COUNTER_KEY}`;
const COUNTER_HIT = `https://abacus.jasoncameron.dev/hit/${COUNTER_NAMESPACE}/${COUNTER_KEY}`;

const trigger = document.getElementById("trigger");
const centerImage = document.getElementById("centerImage");
const clickCountEl = document.getElementById("clickCount");

const activeAudios = new Set();

function pickRandomSound() {
  const index = Math.floor(Math.random() * SOUNDS.length);
  return SOUNDS[index];
}

function updateImage() {
  centerImage.src = activeAudios.size > 0 ? IMG_ACTIVE : IMG_IDLE;
}

function setCountDisplay(value) {
  clickCountEl.textContent = Number(value).toLocaleString("zh-CN");
}

async function loadGlobalCount() {
  try {
    const res = await fetch(COUNTER_GET);
    const data = await res.json();
    if (typeof data.value === "number") {
      setCountDisplay(data.value);
    }
  } catch {
    clickCountEl.textContent = "—";
  }
}

async function incrementGlobalCount() {
  try {
    const res = await fetch(COUNTER_HIT);
    const data = await res.json();
    if (typeof data.value === "number") {
      setCountDisplay(data.value);
    }
  } catch {
    /* 网络失败时不打断音效播放 */
  }
}

function playRandomSound() {
  incrementGlobalCount();

  const src = pickRandomSound();
  const audio = new Audio(src);

  activeAudios.add(audio);
  updateImage();

  const finish = () => {
    activeAudios.delete(audio);
    updateImage();
  };

  audio.addEventListener("ended", finish, { once: true });
  audio.addEventListener("error", () => {
    console.warn("无法播放:", src);
    finish();
  }, { once: true });

  audio.play().catch(finish);
}

loadGlobalCount();

trigger.addEventListener("click", playRandomSound);

document.addEventListener("keydown", (e) => {
  if (e.code === "Space" && !e.repeat) {
    e.preventDefault();
    playRandomSound();
  }
});
