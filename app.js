const GEOJSON_URL = "https://raw.githubusercontent.com/johan/world.geo.json/master/countries.geo.json";
const TARGET_COUNTRY = "India";
const CLUE_AUDIO_SRC = "./assets/audio/kannada-10s.mp3";
const COPY_FILE_PATH = "./form-copy.txt";
const ANSWER_KEY_FILE_PATH = "./acceptable-answers.txt";

const DEFAULT_COPY = {
  "page.documentTitle": "Wisslr Event Submission",
  "page.eyebrow": "Wisslr",
  "page.title": "Event Submission Form",
  "page.description": "Complete all sections below, then submit.",
  "wizard.progress": "Step {current} of {total}",
  "wizard.backButton": "Back",
  "wizard.nextButton": "Next",
  "wizard.feedback.completeFields": "Please complete all fields on this page.",
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
  "q1.title": "Phono Inventory - Physical Set 1",
  "q1.field1.label": "Country",
  "q1.field1.placeholder": "Enter country",
  "q1.field2.label": "Language",
  "q1.field2.placeholder": "Enter language",
  "q1.field3.label": "Language Family",
  "q1.field3.placeholder": "Enter language family",
  "q2.title": "Phono Inventory - Physical Set 2",
  "q2.field1.label": "Country",
  "q2.field1.placeholder": "Enter country",
  "q2.field2.label": "Language",
  "q2.field2.placeholder": "Enter language",
  "q2.field3.label": "Language Family",
  "q2.field3.placeholder": "Enter language family",
  "q3.title": "Scavenger Hunt",
  "q3.field1.label": "Author's name of the 4th listed reference of the LAST presentation in the program sheet",
  "q3.field1.placeholder": "Enter author name",
  "q3.field2.label": "Which velar IPA symbol is written on page 7 of the program sheet?",
  "q3.field2.placeholder": "Enter symbol or description",
  "form.submitButton": "Submit Form",
  "form.preview.title": "Latest Submission Preview",
  "form.preview.empty": "No submission yet.",
  "form.feedback.missingName": "Please enter your name before continuing.",
  "form.feedback.completeGuess": "Please complete the language guessing game before continuing.",
  "form.feedback.submittedAllCorrect": "Submission captured. All keyed answers matched.",
  "form.feedback.submittedWithMismatches": "Submission captured. Some keyed answers did not match.",
  "form.status.submitted": "Submission recorded.",
};

const DEFAULT_ANSWER_KEY = {
  q1Field1: ["canada", "alaska", "usa", "us", "america"],
  q1Field2: ["tlingit", "klingkit", "lingit"],
  q1Field3: ["na-dene", "athabaskan"],
  q2Field1: ["usa", "hawaii", "hawai'i", "hawaiÃƒÂ¢Ã¢â€šÂ¬Ã¢â€žÂ¢i", "us", "america"],
  q2Field2: ["olelo hawai'i", "olelo hawaii", "olelo hawaiÃƒÂ¢Ã¢â€šÂ¬Ã¢â€žÂ¢i"],
  q2Field3: ["austronesian", "oceanic", "polynesian"],
  q3Field1: ["alba", "alba o.", "o. alba"],
  q3Field2: ["\u014B", "nasal"],
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
  answerKey: { ...DEFAULT_ANSWER_KEY },
  currentStepIndex: 0,
};

const elements = {
  eventForm: document.getElementById("eventForm"),
  wizardSteps: Array.from(document.querySelectorAll(".form-step")),
  stepCounter: document.getElementById("stepCounter"),
  backStepButton: document.getElementById("backStepButton"),
  nextStepButton: document.getElementById("nextStepButton"),
  submitFormButton: document.getElementById("submitFormButton"),
  participantNameInput: document.getElementById("participantName"),
  startGameButton: document.getElementById("startGameButton"),
  playClueButton: document.getElementById("playClueButton"),
  statusText: document.getElementById("statusText"),
  feedbackText: document.getElementById("feedbackText"),
  formFeedback: document.getElementById("formFeedback"),
  languageGuessCountryInput: document.getElementById("languageGuessCountry"),
  languageGuessOutcomeInput: document.getElementById("languageGuessOutcome"),
  submissionOutput: document.getElementById("submissionOutput"),
  submissionPreview: document.getElementById("submissionPreview"),
  q1Field1Input: document.getElementById("q1Field1"),
  q1Field2Input: document.getElementById("q1Field2"),
  q1Field3Input: document.getElementById("q1Field3"),
  q2Field1Input: document.getElementById("q2Field1"),
  q2Field2Input: document.getElementById("q2Field2"),
  q2Field3Input: document.getElementById("q2Field3"),
  q3Field1Input: document.getElementById("q3Field1"),
  q3Field2Input: document.getElementById("q3Field2"),
};

const REQUIRED_ELEMENT_KEYS = [
  "eventForm",
  "stepCounter",
  "backStepButton",
  "nextStepButton",
  "submitFormButton",
  "participantNameInput",
  "startGameButton",
  "playClueButton",
  "statusText",
  "feedbackText",
  "formFeedback",
  "languageGuessCountryInput",
  "languageGuessOutcomeInput",
  "submissionOutput",
  "submissionPreview",
  "q1Field1Input",
  "q1Field2Input",
  "q1Field3Input",
  "q2Field1Input",
  "q2Field2Input",
  "q2Field3Input",
  "q3Field1Input",
  "q3Field2Input",
];

function hasRequiredElements() {
  const missing = REQUIRED_ELEMENT_KEYS.filter((key) => !elements[key]);
  if (missing.length === 0 && elements.wizardSteps.length === 5) {
    return true;
  }

  const missingMessage = missing.length > 0 ? `Missing expected elements: ${missing.join(", ")}. ` : "";
  const stepsMessage = elements.wizardSteps.length === 5 ? "" : "Expected 5 wizard steps. ";

  console.error(
    `Wisslr UI failed to initialize. ${missingMessage}${stepsMessage}` +
      "Hard-refresh the page and restart the local server to clear stale assets."
  );
  return false;
}

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

function parseAnswerKeyFile(rawText) {
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
    const values = trimmed
      .slice(separatorIndex + 1)
      .split("|")
      .map((entry) => entry.trim())
      .filter(Boolean);

    if (key && values.length > 0) {
      parsed[key] = values;
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

async function loadAnswerKey() {
  try {
    const response = await fetch(ANSWER_KEY_FILE_PATH);
    if (!response.ok) {
      throw new Error(`Answer key load failed (${response.status}).`);
    }

    const rawText = await response.text();
    const parsed = parseAnswerKeyFile(rawText);
    state.answerKey = { ...DEFAULT_ANSWER_KEY, ...parsed };
  } catch (error) {
    state.answerKey = { ...DEFAULT_ANSWER_KEY };
    console.warn("Using fallback answer key.", error);
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
  elements.submissionPreview.hidden = true;
}

function normalizeValue(value) {
  return String(value || "")
    .trim()
    .toLowerCase();
}

function normalizeAnswer(value) {
  return String(value || "")
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^\p{L}\p{N}\s]/gu, " ")
    .replace(/\s+/g, " ")
    .trim();
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

function setFormFeedback(text, tone = "") {
  elements.formFeedback.textContent = text;
  elements.formFeedback.classList.remove("win", "lose");
  if (tone) {
    elements.formFeedback.classList.add(tone);
  }
}

function setFormFeedbackByKey(key, tone = "", variables = {}) {
  setFormFeedback(copyText(key, variables), tone);
}

function clearFormFeedback() {
  setFormFeedback("");
}

function setStatusByKey(key, variables = {}) {
  elements.statusText.textContent = copyText(key, variables);
}

function syncGuessFields() {
  elements.languageGuessCountryInput.value = state.guessCountry;
  elements.languageGuessOutcomeInput.value = state.guessOutcome;
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

function updateGameButtons() {
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
  updateGameButtons();
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

function ensureMapInitialized() {
  if (!state.map) {
    createMap();
    loadCountries();
  }

  window.setTimeout(() => {
    if (!state.map) {
      return;
    }

    state.map.invalidateSize();
    if (state.countryLayer) {
      state.map.fitBounds(state.countryLayer.getBounds(), { padding: [12, 12] });
    }
  }, 120);
}

function updateStepCounter() {
  elements.stepCounter.textContent = copyText("wizard.progress", {
    current: state.currentStepIndex + 1,
    total: elements.wizardSteps.length,
  });
}

function updateNavigation() {
  const onFirstStep = state.currentStepIndex === 0;
  const onLastStep = state.currentStepIndex === elements.wizardSteps.length - 1;

  elements.backStepButton.disabled = onFirstStep;
  elements.nextStepButton.hidden = onLastStep;
  elements.submitFormButton.hidden = !onLastStep;
}

function getStepFieldIds(stepIndex) {
  const fieldMap = {
    0: ["participantName"],
    2: ["q1Field1", "q1Field2", "q1Field3"],
    3: ["q2Field1", "q2Field2", "q2Field3"],
    4: ["q3Field1", "q3Field2"],
  };

  return fieldMap[stepIndex] || [];
}

function focusFirstField(stepIndex) {
  const step = elements.wizardSteps[stepIndex];
  const firstInput = step?.querySelector("input:not([type='hidden'])");
  if (firstInput && stepIndex !== 1) {
    firstInput.focus();
  }
}

function showStep(stepIndex) {
  state.currentStepIndex = Math.max(0, Math.min(stepIndex, elements.wizardSteps.length - 1));

  elements.wizardSteps.forEach((step, index) => {
    step.classList.toggle("active", index === state.currentStepIndex);
  });

  updateStepCounter();
  updateNavigation();
  clearFormFeedback();

  if (state.currentStepIndex === 1) {
    ensureMapInitialized();
  }

  focusFirstField(state.currentStepIndex);
}

function validateRequiredFields(fieldIds) {
  for (let index = 0; index < fieldIds.length; index += 1) {
    const field = document.getElementById(fieldIds[index]);
    if (field && !field.value.trim()) {
      setFormFeedbackByKey("wizard.feedback.completeFields", "lose");
      field.focus();
      return false;
    }
  }

  return true;
}

function validateStep(stepIndex) {
  if (stepIndex === 0) {
    if (elements.participantNameInput.value.trim()) {
      return true;
    }

    setFormFeedbackByKey("form.feedback.missingName", "lose");
    elements.participantNameInput.focus();
    return false;
  }

  if (stepIndex === 1) {
    if (state.guessOutcome === "correct" || state.guessOutcome === "incorrect") {
      return true;
    }

    setFormFeedbackByKey("form.feedback.completeGuess", "lose");
    return false;
  }

  return validateRequiredFields(getStepFieldIds(stepIndex));
}

function nextStep() {
  if (!validateStep(state.currentStepIndex)) {
    return;
  }

  showStep(state.currentStepIndex + 1);
}

function previousStep() {
  showStep(state.currentStepIndex - 1);
}

function evaluateAnswers(formData) {
  const fieldIds = Object.keys(state.answerKey);
  let correctCount = 0;
  const results = {};

  fieldIds.forEach((fieldId) => {
    const submitted = String(formData.get(fieldId) || "").trim();
    const normalizedSubmitted = normalizeAnswer(submitted);
    const acceptedValues = state.answerKey[fieldId] || [];
    const normalizedAccepted = acceptedValues.map((value) => normalizeAnswer(value));
    const isCorrect = normalizedAccepted.includes(normalizedSubmitted);

    if (isCorrect) {
      correctCount += 1;
    }

    results[fieldId] = {
      submitted,
      correct: isCorrect,
    };
  });

  return {
    total: fieldIds.length,
    correct: correctCount,
    allCorrect: correctCount === fieldIds.length,
    results,
  };
}

function validateAllSteps() {
  for (let stepIndex = 0; stepIndex < elements.wizardSteps.length; stepIndex += 1) {
    if (!validateStep(stepIndex)) {
      showStep(stepIndex);
      return false;
    }
  }

  return true;
}

function handleSubmit(event) {
  event.preventDefault();

  if (!validateAllSteps()) {
    return;
  }

  const formData = new FormData(elements.eventForm);
  const payload = Object.fromEntries(formData.entries());
  const answerCheck = evaluateAnswers(formData);

  payload.languageGuessTarget = TARGET_COUNTRY;
  payload.submittedAt = new Date().toISOString();
  payload.answerScore = `${answerCheck.correct}/${answerCheck.total}`;
  payload.answersAllCorrect = answerCheck.allCorrect;
  payload.answerCheck = answerCheck.results;

  elements.submissionOutput.textContent = JSON.stringify(payload, null, 2);
  elements.submissionPreview.hidden = false;
  elements.submissionPreview.scrollIntoView({ behavior: "smooth", block: "start" });

  if (answerCheck.allCorrect) {
    setFormFeedbackByKey("form.feedback.submittedAllCorrect", "win");
  } else {
    setFormFeedbackByKey("form.feedback.submittedWithMismatches", "lose");
  }

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

  elements.backStepButton.addEventListener("click", previousStep);
  elements.nextStepButton.addEventListener("click", nextStep);

  elements.eventForm.addEventListener("keydown", (event) => {
    if (event.key !== "Enter" || state.currentStepIndex === elements.wizardSteps.length - 1) {
      return;
    }

    const target = event.target;
    if (!(target instanceof HTMLElement) || target.tagName === "TEXTAREA") {
      return;
    }

    event.preventDefault();
    nextStep();
  });

  elements.eventForm.addEventListener("submit", handleSubmit);
}

async function initialize() {
  if (!hasRequiredElements()) {
    return;
  }

  await loadCopy();
  await loadAnswerKey();
  applyCopyToDom();
  initializeAudio();
  bindEvents();
  updateGameButtons();
  syncGuessFields();
  setStatusByKey("game.status.waitingToStart", { targetCountry: TARGET_COUNTRY });
  showStep(0);
}

initialize();
