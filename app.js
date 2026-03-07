const GEOJSON_URL = "https://raw.githubusercontent.com/johan/world.geo.json/master/countries.geo.json";
const TARGET_COUNTRY = "India";
const CLUE_AUDIO_SRC = "./assets/audio/kannada-10s.mp3";
const COPY_FILE_PATH = "./form-copy.txt";

const DEFAULT_COPY = {
  "page.documentTitle": "Wisslr Event Submission",
  "page.eyebrow": "Wisslr",
  "page.title": "Event Submission Form",
  "page.description": "Complete all sections below, then submit.",
  "form.name.title": "Participant",
  "form.name.label": "Full name",
  "form.name.placeholder": "Enter your full name",
  "game.section.title": "Language Guessing Game",
  "game.section.description": "Listen to the clue and click the country where the language is spoken.",
  "game.startButton": "Start / Retry Guess",
  "game.playButton": "Play Audio Clue",
  "game.mapAriaLabel": "World map",
  "game.status.waitingToStart": "Start the language game when you are ready.",
  "game.status.playAndGuess": "Play the clue and click the matching country.",
  "game.status.guessRecorded": "Guess recorded. Continue to the remaining questions.",
  "game.status.mapFailed": "Map data failed to load.",
  "game.feedback.mapLoading": "Loading map data...",
  "game.feedback.mapReady": "Map ready. Start the language game when ready.",
  "game.feedback.mapError": "Could not load country shapes. Refresh after checking internet access.",
  "game.feedback.audioError": "Could not load the audio clue.",
  "game.feedback.audioBlocked": "Audio blocked by browser autoplay policy. Click Play Audio Clue.",
  "game.feedback.startFirst": "Start the language game first.",
  "game.feedback.gameStarted": "Game started. Listen to the clue and select a country.",
  "game.feedback.correct": "Correct. {targetCountry} selected.",
  "game.feedback.incorrect": "{countryName} is not {targetCountry}.",
  "q1.title": "Question 1",
  "q1.field1.label": "Field 1",
  "q1.field1.placeholder": "Enter response for Question 1, Field 1",
  "q1.field2.label": "Field 2",
  "q1.field2.placeholder": "Enter response for Question 1, Field 2",
  "q1.field3.label": "Field 3",
  "q1.field3.placeholder": "Enter response for Question 1, Field 3",
  "q2.title": "Question 2",
  "q2.field1.label": "Field 1",
  "q2.field1.placeholder": "Enter response for Question 2, Field 1",
  "q2.field2.label": "Field 2",
  "q2.field2.placeholder": "Enter response for Question 2, Field 2",
  "q2.field3.label": "Field 3",
  "q2.field3.placeholder": "Enter response for Question 2, Field 3",
  "q3.title": "Final Question",
  "q3.field1.label": "Response",
  "q3.field1.placeholder": "Enter your final response",
  "form.submitButton": "Submit Form",
  "form.preview.title": "Latest Submission Preview",
  "form.preview.empty": "No submission yet.",
  "form.feedback.missingName": "Please enter your name before submitting.",
  "form.feedback.completeGuess": "Please complete the language guessing game before submitting.",
  "form.feedback.submitted": "Submission captured locally. Connect this payload to your backend endpoint.",
  "form.status.submitted": "Submission recorded."
};

const state = {
  started: false,
  canGuess: false,
  guessOutcome: "not_attempted",
  guessCountry: "",
  map: null,
  countryLayer: null,
  clueAudio: null,
  copy: { ...DEFAULT_COPY },
};

const elements = {
  eventForm: document.getElementById("eventForm"),
  participantNameInput: document.getElementById("participantName"),
  startGameButton: document.getElementById("startGameButton"),
  playClueButton: document.getElementById("playClueButton"),
  statusText: document.getElementById("statusText"),
  feedbackText: document.getElementById("feedbackText"),
  languageGuessCountryInput: document.getElementById("languageGuessCountry"),
  languageGuessOutcomeInput: document.getElementById("languageGuessOutcome"),
  submissionOutput: document.getElementById("submissionOutput"),
};

function parseCopyFile(rawText) {
  const parsed = {};

  rawText.split(/\r?\n/).forEach((line) => {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) {
      return;
    }

    const separatorIndex = trimmed.indexOf("=");
    if (separatorIndex < 1) {
      return;
    }

    const key = trimmed.slice(0, separatorIndex).trim();
    const value = trimmed.slice(separatorIndex + 1).trim().replace(/\\n/g, "\n");
    if (key) {
      parsed[key] = value;
    }
  });

  return parsed;
}

async function loadCopy() {
  try {
    const response = await fetch(COPY_FILE_PATH);
    if (!response.ok) {
      throw new Error(`Copy file load failed (${response.status}).`);
    }

    const rawText = await response.text();
    const parsed = parseCopyFile(rawText);
    state.copy = { ...DEFAULT_COPY, ...parsed };
  } catch (error) {
    state.copy = { ...DEFAULT_COPY };
    console.warn("Using fallback copy text.", error);
  }
}

function copyText(key, variables = {}) {
  const template = state.copy[key] || DEFAULT_COPY[key] || key;

  return template.replace(/\{(\w+)\}/g, (match, variable) => {
    if (Object.prototype.hasOwnProperty.call(variables, variable)) {
      return String(variables[variable]);
    }

    return match;
  });
}

function applyCopyToDom() {
  document.title = copyText("page.documentTitle");

  document.querySelectorAll("[data-copy-key]").forEach((node) => {
    const key = node.getAttribute("data-copy-key");
    if (key) {
      node.textContent = copyText(key);
    }
  });

  document.querySelectorAll("[data-copy-placeholder]").forEach((node) => {
    const key = node.getAttribute("data-copy-placeholder");
    if (key) {
      node.setAttribute("placeholder", copyText(key));
    }
  });

  document.querySelectorAll("[data-copy-aria-label]").forEach((node) => {
    const key = node.getAttribute("data-copy-aria-label");
    if (key) {
      node.setAttribute("aria-label", copyText(key));
    }
  });

  elements.submissionOutput.textContent = copyText("form.preview.empty");
}

function normalizeValue(value) {
  return String(value || "")
    .trim()
    .toLowerCase();
}

function getCountryName(feature) {
  const properties = feature?.properties || {};
  const candidates = [
    properties.name,
    properties.NAME,
    properties.admin,
    properties.ADMIN,
    properties.country,
    properties.COUNTRY,
  ];

  const name = candidates.find((entry) => typeof entry === "string" && entry.trim());
  return name || "Unknown country";
}

function getCountryCodes(feature) {
  const properties = feature?.properties || {};
  const codes = [
    feature?.id,
    properties.iso_a3,
    properties.ISO_A3,
    properties.ISO3,
    properties.iso3,
    properties["ISO3166-1-Alpha-3"],
    properties.adm0_a3,
    properties.ADM0_A3,
  ];

  return codes.filter(Boolean).map((code) => normalizeValue(code));
}

function isIndia(feature) {
  const normalizedName = normalizeValue(getCountryName(feature));
  if (normalizedName === "india" || normalizedName === "republic of india") {
    return true;
  }

  return getCountryCodes(feature).includes("ind");
}

function setFeedbackText(text, tone = "") {
  elements.feedbackText.textContent = text;
  elements.feedbackText.classList.remove("win", "lose");
  if (tone) {
    elements.feedbackText.classList.add(tone);
  }
}

function setFeedbackByKey(key, tone = "", variables = {}) {
  setFeedbackText(copyText(key, variables), tone);
}

function setStatusByKey(key, variables = {}) {
  elements.statusText.textContent = copyText(key, variables);
}

function syncGuessFields() {
  elements.languageGuessCountryInput.value = state.guessCountry;
  elements.languageGuessOutcomeInput.value = state.guessOutcome;
}

function updateButtons() {
  elements.playClueButton.disabled = !state.started;
}

function resetGuessRound() {
  state.canGuess = true;
  state.guessOutcome = "in_progress";
  state.guessCountry = "";
  syncGuessFields();
}

function initializeAudio() {
  state.clueAudio = new Audio(CLUE_AUDIO_SRC);
  state.clueAudio.preload = "auto";
  state.clueAudio.addEventListener("error", () => {
    setFeedbackByKey("game.feedback.audioError", "lose");
  });
}

function playClueAudio() {
  if (!state.clueAudio) {
    setFeedbackByKey("game.feedback.audioError", "lose");
    return;
  }

  state.clueAudio.pause();
  state.clueAudio.currentTime = 0;

  const playPromise = state.clueAudio.play();
  if (playPromise && typeof playPromise.catch === "function") {
    playPromise.catch((error) => {
      setFeedbackByKey("game.feedback.audioBlocked", "lose");
      console.error(error);
    });
  }
}

function startGame() {
  state.started = true;
  resetGuessRound();
  updateButtons();
  setStatusByKey("game.status.playAndGuess", { targetCountry: TARGET_COUNTRY });
  setFeedbackByKey("game.feedback.gameStarted", "");
  playClueAudio();
}

function handleCountrySelection(feature) {
  if (!state.started) {
    setFeedbackByKey("game.feedback.startFirst", "lose");
    return;
  }

  if (!state.canGuess) {
    return;
  }

  state.canGuess = false;

  const countryName = getCountryName(feature);
  state.guessCountry = countryName;

  if (isIndia(feature)) {
    state.guessOutcome = "correct";
    setFeedbackByKey("game.feedback.correct", "win", {
      targetCountry: TARGET_COUNTRY,
      countryName,
    });
  } else {
    state.guessOutcome = "incorrect";
    setFeedbackByKey("game.feedback.incorrect", "lose", {
      targetCountry: TARGET_COUNTRY,
      countryName,
    });
  }

  syncGuessFields();
  setStatusByKey("game.status.guessRecorded", { targetCountry: TARGET_COUNTRY });
}

function createMap() {
  state.map = L.map("map", {
    minZoom: 2,
    worldCopyJump: true,
  }).setView([20, 0], 2);

  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    maxZoom: 7,
  }).addTo(state.map);
}

async function loadCountries() {
  setFeedbackByKey("game.feedback.mapLoading", "");

  try {
    const response = await fetch(GEOJSON_URL);
    if (!response.ok) {
      throw new Error(`GeoJSON load failed (${response.status}).`);
    }

    const geojson = await response.json();

    state.countryLayer = L.geoJSON(geojson, {
      style: {
        color: "#456788",
        weight: 1,
        fillColor: "#b2c9df",
        fillOpacity: 0.5,
      },
      onEachFeature: (feature, layer) => {
        layer.on("mouseover", () => {
          layer.setStyle({ fillColor: "#ff6b35", fillOpacity: 0.7 });
        });

        layer.on("mouseout", () => {
          state.countryLayer.resetStyle(layer);
        });

        layer.on("click", () => {
          handleCountrySelection(feature);
        });
      },
    }).addTo(state.map);

    state.map.fitBounds(state.countryLayer.getBounds(), { padding: [12, 12] });
    setFeedbackByKey("game.feedback.mapReady", "");
  } catch (error) {
    setFeedbackByKey("game.feedback.mapError", "lose");
    setStatusByKey("game.status.mapFailed");
    console.error(error);
  }
}

function handleSubmit(event) {
  event.preventDefault();

  const participantName = elements.participantNameInput.value.trim();
  if (!participantName) {
    setFeedbackByKey("form.feedback.missingName", "lose");
    elements.participantNameInput.focus();
    return;
  }

  if (state.guessOutcome !== "correct" && state.guessOutcome !== "incorrect") {
    setFeedbackByKey("form.feedback.completeGuess", "lose");
    return;
  }

  const formData = new FormData(elements.eventForm);
  const payload = Object.fromEntries(formData.entries());
  payload.languageGuessTarget = TARGET_COUNTRY;
  payload.submittedAt = new Date().toISOString();

  elements.submissionOutput.textContent = JSON.stringify(payload, null, 2);

  setFeedbackByKey("form.feedback.submitted", "win");
  setStatusByKey("form.status.submitted");
}

function bindEvents() {
  elements.startGameButton.addEventListener("click", startGame);

  elements.playClueButton.addEventListener("click", () => {
    if (!state.started) {
      setFeedbackByKey("game.feedback.startFirst", "lose");
      return;
    }

    playClueAudio();
  });

  elements.eventForm.addEventListener("submit", handleSubmit);
}

async function initialize() {
  await loadCopy();
  applyCopyToDom();
  initializeAudio();
  bindEvents();
  updateButtons();
  syncGuessFields();
  setStatusByKey("game.status.waitingToStart", { targetCountry: TARGET_COUNTRY });
  createMap();
  loadCountries();
}

initialize();