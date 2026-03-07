const GEOJSON_URL = "https://raw.githubusercontent.com/johan/world.geo.json/master/countries.geo.json";
const TARGET_COUNTRY = "India";
const CLUE_AUDIO_SRC = "./assets/audio/kannada-10s.mp3";
const COPY_FILE_PATH = "./form-copy.txt";
const ANSWER_KEY_FILE_PATH = "./acceptable-answers.txt";
const STORAGE_CONFIG_FILE_PATH = "./storage-config.txt";
const HISTORY_LIMIT = 10;
const LOCAL_STORAGE_KEY = "wisslr_records";

const DEFAULT_COPY = {
  "page.documentTitle": "Wisslr Event Submission",
  "page.eyebrow": "Wisslr",
  "page.title": "Event Submission Form",
  "page.description":
    "Each correct answer = 1 raffle entry.\nOnce you move onto the next page, you will NO LONGER be able to go back - so be sure of your answer before clicking \"Next\"!",
  "page.headerImageAlt": "WUGLIFE mascot image",
  "wizard.progress": "Step {current} of {total}",
  "wizard.nextButton": "Next",
  "wizard.feedback.completeFields": "Please complete all fields on this page.",
  "form.name.title": "Participant",
  "form.name.label": "Full name",
  "form.name.placeholder": "Enter your full name",
  "game.section.title": "LanguaGeo",
  "game.section.description": "Listen to the audio, select a country on the map, answer the language question, then submit your guess.",
  "game.playButton": "Play Audio",
  "game.submitGuessButton": "Submit Map Guess",
  "game.languageQuestionLabel": "What language is it?",
  "game.languageQuestionPlaceholder": "Enter language name",
  "game.mapCountryLabel": "Selected Country",
  "game.mapAriaLabel": "World map",
  "game.status.waitingToStart": "Select a country on the map, then click Submit Map Guess.",
  "game.status.countrySelected": "{countryName} selected. Click Submit Map Guess to lock it.",
  "game.status.mapSubmitted": "Map guess submitted for {countryName}. Enter the language, then click Next.",
  "game.status.guessSubmitted": "Language answer submitted. Click Next to continue.",
  "game.status.mapFailed": "Map data failed to load.",
  "game.feedback.mapLoading": "Loading map data...",
  "game.feedback.mapReady": "Map ready. Select a country.",
  "game.feedback.mapError": "Could not load country shapes. Refresh after checking internet access.",
  "game.feedback.audioError": "Could not load the audio clue.",
  "game.feedback.audioBlocked": "Audio blocked by browser autoplay policy. Click Play Audio.",
  "game.feedback.countrySelected": "Selected: {countryName}.",
  "game.feedback.selectCountryFirst": "Select a country on the map first.",
  "game.feedback.languageRequired": "Answer \"What language is it?\" before continuing.",
  "game.feedback.guessSaved": "Map guess saved.",
  "game.feedback.languageSaved": "Language answer saved.",
  "q1.title": "Phonological Inventory - Set 1",
  "q1.description":
    "Look at the phonological inventory (Set 1) provided IRL. Put in your guesses below. Remember, each correct answer = 1 raffle entry!",
  "q1.field1.label": "Country",
  "q1.field1.placeholder": "Enter country",
  "q1.field2.label": "Language",
  "q1.field2.placeholder": "Enter language",
  "q1.field3.label": "Language Family",
  "q1.field3.placeholder": "Enter language family",
  "q2.title": "Phonological Inventory - Set 2",
  "q2.description":
    "Look at the phonological inventory (Set 2) provided IRL. Put in your guesses below. Remember, each correct answer = 1 raffle entry!",
  "q2.field1.label": "Country",
  "q2.field1.placeholder": "Enter country",
  "q2.field2.label": "Language",
  "q2.field2.placeholder": "Enter language",
  "q2.field3.label": "Language Family",
  "q2.field3.placeholder": "Enter language family",
  "q3.title": "WISSLR 2026 Program Sheet Scavenger Hunt",
  "q3.field1.label": "The last name of the author of the 4th listed reference of the LAST presentation in the program sheet",
  "q3.field1.placeholder": "Enter author name",
  "q3.field2.label": "Which velar IPA symbol is written on page 7 of the program sheet? (you may enter the symbol itself or describe it)",
  "q3.field2.placeholder": "Enter symbol or description",
  "review.title": "Review Submission",
  "review.description": "Final check before you submit. You cannot edit previous pages.",
  "review.headerNote": "Your raffle-entry total appears on the next page after submit.",

  "form.submitButton": "Submit Final Answers",
  "form.feedback.missingName": "Please enter your name before continuing.",
  "form.feedback.completeGuess": "Submit your map guess and answer \"What language is it?\" before continuing.",
  "form.feedback.submitMapGuess": "Submit your map guess before continuing.",
  "form.feedback.saved": "Saved. You earned {entries} raffle entrie(s).",
  "form.feedback.saveFailed": "Could not save submission. Configure storage-config.txt for Supabase or use local fallback.",
  "history.title": "Recent LanguaGeo Answers",
  "history.description": "Last 10 submissions are shown below.",
  "history.noRecords": "No saved records yet.",
  "history.loadFailed": "Could not load recent records.",
};
const DEFAULT_ANSWER_KEY = {
  mapCountrySelection: ["india", "republic of india"],
  mapLanguageAnswer: ["kannada"],
  q1Field1: ["canada", "alaska", "usa", "us", "america"],
  q1Field2: ["tlingit", "klingkit", "lingit"],
  q1Field3: ["na-dene", "athabaskan"],
  q2Field1: ["usa", "hawaii", "hawai'i", "us", "america"],
  q2Field2: ["olelo hawai'i", "olelo hawaii", "'olelo hawai'i", "hawaiian"],
  q2Field3: ["austronesian", "oceanic", "polynesian"],
  q3Field1: ["alba"],
  q3Field2: ["\u014B", "nasal"],
};
const DEFAULT_STORAGE_CONFIG = {
  mode: "local",
  supabaseUrl: "",
  supabaseAnonKey: "",
  supabaseTable: "wisslr_submissions",
};

const HISTORY_COLORS = [
  "#8d42f5",
  "#a758ff",
  "#6f29ca",
  "#b679ff",
  "#5730ad",
  "#cf7cff",
  "#8441de",
  "#d95ad0",
  "#6d55ff",
  "#ec7ab0",
];

const state = {
  mapCountrySubmitted: false,
  mapGuessSubmitted: false,
  guessOutcome: "not_submitted",
  guessCountry: "",
  pendingCountryFeature: null,
  selectedCountryLayer: null,
  map: null,
  countryLayer: null,
  historyMap: null,
  historyLayer: null,
  clueAudio: null,
  geojsonData: null,
  copy: { ...DEFAULT_COPY },
  answerKey: { ...DEFAULT_ANSWER_KEY },
  currentStepIndex: 0,
  pendingSubmission: null,
  storageConfig: { ...DEFAULT_STORAGE_CONFIG },
};
const elements = {
  eventForm: document.getElementById("eventForm"),
  wizardSteps: Array.from(document.querySelectorAll(".form-step")),
  stepCounter: document.getElementById("stepCounter"),
  nextStepButton: document.getElementById("nextStepButton"),
  submitFormButton: document.getElementById("submitFormButton"),
  participantNameInput: document.getElementById("participantName"),
  playClueButton: document.getElementById("playClueButton"),
  submitMapGuessButton: document.getElementById("submitMapGuessButton"),
  mapLanguageAnswerInput: document.getElementById("mapLanguageAnswer"),
  statusText: document.getElementById("statusText"),
  feedbackText: document.getElementById("feedbackText"),
  formFeedback: document.getElementById("formFeedback"),
  mapCountrySelectionInput: document.getElementById("mapCountrySelection"),
  languageGuessOutcomeInput: document.getElementById("languageGuessOutcome"),
  reviewScoreCard: document.getElementById("reviewScoreCard"),
  reviewSummary: document.getElementById("reviewSummary"),
  historyLegend: document.getElementById("historyLegend"),
};
const REQUIRED_ELEMENT_KEYS = [
  "eventForm",
  "stepCounter",
  "nextStepButton",
  "submitFormButton",
  "participantNameInput",
  "playClueButton",
  "submitMapGuessButton",
  "mapLanguageAnswerInput",
  "statusText",
  "feedbackText",
  "formFeedback",
  "mapCountrySelectionInput",
  "languageGuessOutcomeInput",
  "reviewScoreCard",
  "reviewSummary",
  "historyLegend",
];
function hasRequiredElements() {
  const missing = REQUIRED_ELEMENT_KEYS.filter((key) => !elements[key]);
  if (missing.length === 0 && elements.wizardSteps.length === 7) {
    return true;
  }

  const missingMessage = missing.length > 0 ? `Missing expected elements: ${missing.join(", ")}. ` : "";
  const stepsMessage = elements.wizardSteps.length === 7 ? "" : "Expected 7 wizard steps. ";

  console.error(
    `Wisslr UI failed to initialize. ${missingMessage}${stepsMessage}` +
      "Hard-refresh the page and reload the app to clear stale assets."
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

async function loadStorageConfig() {
  try {
    const response = await fetch(STORAGE_CONFIG_FILE_PATH);
    if (!response.ok) {
      throw new Error(`Storage config load failed (${response.status}).`);
    }

    const rawText = await response.text();
    const parsed = parseCopyFile(rawText);

    state.storageConfig = {
      ...DEFAULT_STORAGE_CONFIG,
      ...parsed,
    };

    state.storageConfig.mode = String(state.storageConfig.mode || "local").trim().toLowerCase();
  } catch (error) {
    state.storageConfig = { ...DEFAULT_STORAGE_CONFIG };
    console.warn("Using fallback storage config.", error);
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

  document.querySelectorAll("[data-copy-alt]").forEach((node) => {
    const key = node.getAttribute("data-copy-alt");
    if (key) {
      node.setAttribute("alt", copyText(key));
    }
  });
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

function setGameFeedback(text, tone = "") {
  elements.feedbackText.textContent = text;
  elements.feedbackText.classList.remove("win", "lose");
  if (tone) {
    elements.feedbackText.classList.add(tone);
  }
}

function setGameFeedbackByKey(key, tone = "", variables = {}) {
  setGameFeedback(copyText(key, variables), tone);
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

function syncMapGuessFields() {
  elements.mapCountrySelectionInput.value = state.mapCountrySubmitted ? state.guessCountry : "";

  if (state.mapGuessSubmitted) {
    elements.languageGuessOutcomeInput.value = state.guessOutcome;
    return;
  }

  elements.languageGuessOutcomeInput.value = state.mapCountrySubmitted ? "country_submitted" : "not_submitted";
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

function updateGameButtons() {
  elements.playClueButton.disabled = false;
}

function initializeAudio() {
  state.clueAudio = new Audio(CLUE_AUDIO_SRC);
  state.clueAudio.preload = "auto";
  state.clueAudio.addEventListener("error", () => {
    setGameFeedbackByKey("game.feedback.audioError", "lose");
  });
}

function playClueAudio() {
  if (!state.clueAudio) {
    setGameFeedbackByKey("game.feedback.audioError", "lose");
    return;
  }

  state.clueAudio.pause();
  state.clueAudio.currentTime = 0;

  const playPromise = state.clueAudio.play();
  if (playPromise && typeof playPromise.catch === "function") {
    playPromise.catch((error) => {
      setGameFeedbackByKey("game.feedback.audioBlocked", "lose");
      console.error(error);
    });
  }
}

function handleCountrySelection(feature, layer) {
  if (state.selectedCountryLayer && state.countryLayer) {
    state.countryLayer.resetStyle(state.selectedCountryLayer);
  }

  state.selectedCountryLayer = layer;
  state.pendingCountryFeature = feature;
  state.mapCountrySubmitted = false;
  state.mapGuessSubmitted = false;
  state.guessOutcome = "not_submitted";

  layer.setStyle({ fillColor: "#8d42f5", fillOpacity: 0.82, color: "#3f1a77", weight: 1.5 });

  const countryName = getCountryName(feature);
  setStatusByKey("game.status.countrySelected", { countryName });
  setGameFeedbackByKey("game.feedback.countrySelected", "", { countryName });
  syncMapGuessFields();
}

function submitMapGuess() {
  if (!state.pendingCountryFeature) {
    setGameFeedbackByKey("game.feedback.selectCountryFirst", "lose");
    return;
  }

  state.guessCountry = getCountryName(state.pendingCountryFeature);
  state.mapCountrySubmitted = true;
  state.mapGuessSubmitted = false;
  state.guessOutcome = "country_submitted";
  syncMapGuessFields();

  setStatusByKey("game.status.mapSubmitted", { countryName: state.guessCountry });
  setGameFeedbackByKey("game.feedback.guessSaved", "");
}
async function ensureGeojsonData() {
  if (state.geojsonData) {
    return state.geojsonData;
  }

  const response = await fetch(GEOJSON_URL);
  if (!response.ok) {
    throw new Error(`GeoJSON load failed (${response.status}).`);
  }

  state.geojsonData = await response.json();
  return state.geojsonData;
}

async function ensureGameMapInitialized() {
  if (!state.map) {
    state.map = L.map("map", {
      minZoom: 2,
      worldCopyJump: true,
    }).setView([20, 0], 2);

    L.tileLayer("https://{s}.basemaps.cartocdn.com/light_nolabels/{z}/{x}/{y}{r}.png", {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
      maxZoom: 7,
    }).addTo(state.map);

    setGameFeedbackByKey("game.feedback.mapLoading", "");

    try {
      const geojson = await ensureGeojsonData();
      state.countryLayer = L.geoJSON(geojson, {
        style: {
          color: "#4d2c86",
          weight: 1,
          fillColor: "#d6c5f5",
          fillOpacity: 0.58,
        },
        onEachFeature: (feature, layer) => {
          layer.bindTooltip(getCountryName(feature), {
            permanent: true,
            direction: "center",
            interactive: false,
            className: "country-name-label",
          });

          layer.on("click", () => {
            handleCountrySelection(feature, layer);
          });
        },
      }).addTo(state.map);

      state.map.fitBounds(state.countryLayer.getBounds(), { padding: [12, 12] });
      setGameFeedbackByKey("game.feedback.mapReady", "");
    } catch (error) {
      setGameFeedbackByKey("game.feedback.mapError", "lose");
      setStatusByKey("game.status.mapFailed");
      console.error(error);
    }
  }

  window.setTimeout(() => {
    if (state.map) {
      state.map.invalidateSize();
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
  if (state.currentStepIndex <= 4) {
    elements.nextStepButton.hidden = false;
    elements.submitFormButton.hidden = true;
    return;
  }

  if (state.currentStepIndex === 5) {
    elements.nextStepButton.hidden = true;
    elements.submitFormButton.hidden = false;
    return;
  }

  elements.nextStepButton.hidden = true;
  elements.submitFormButton.hidden = true;
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

function finalizeMapStep() {
  if (state.mapGuessSubmitted) {
    return true;
  }

  if (!state.mapCountrySubmitted) {
    setFormFeedbackByKey("form.feedback.submitMapGuess", "lose");
    return false;
  }

  if (!elements.mapLanguageAnswerInput.value.trim()) {
    setFormFeedbackByKey("game.feedback.languageRequired", "lose");
    elements.mapLanguageAnswerInput.focus();
    return false;
  }

  state.mapGuessSubmitted = true;
  state.guessOutcome = "submitted";
  syncMapGuessFields();

  setStatusByKey("game.status.guessSubmitted");
  setGameFeedbackByKey("game.feedback.languageSaved", "");

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
    return finalizeMapStep();
  }

  return validateRequiredFields(getStepFieldIds(stepIndex));
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

function buildSubmissionPayload() {
  const formData = new FormData(elements.eventForm);
  const answerCheck = evaluateAnswers(formData);
  const payload = Object.fromEntries(formData.entries());

  payload.languageGuessTarget = TARGET_COUNTRY;
  payload.submittedAt = new Date().toISOString();
  payload.answerScore = `${answerCheck.correct}/${answerCheck.total}`;
  payload.answersAllCorrect = answerCheck.allCorrect;
  payload.raffleEntries = answerCheck.correct;
  payload.answerCheck = answerCheck.results;

  return payload;
}

function renderReviewPage() {
  state.pendingSubmission = buildSubmissionPayload();
  const payload = state.pendingSubmission;

  elements.reviewScoreCard.innerHTML = "";
  const scoreNote = document.createElement("div");
  scoreNote.className = "review-score-sub";
  scoreNote.textContent = copyText("review.headerNote");

  elements.reviewScoreCard.append(scoreNote);

  const rows = [
    { label: copyText("form.name.label"), value: payload.participantName, result: null },
    {
      label: copyText("game.mapCountryLabel"),
      value: payload.mapCountrySelection,
      result: payload.answerCheck.mapCountrySelection?.correct,
    },
    {
      label: copyText("game.languageQuestionLabel"),
      value: payload.mapLanguageAnswer,
      result: payload.answerCheck.mapLanguageAnswer?.correct,
    },
    { label: copyText("q1.field1.label"), value: payload.q1Field1, result: payload.answerCheck.q1Field1?.correct },
    { label: copyText("q1.field2.label"), value: payload.q1Field2, result: payload.answerCheck.q1Field2?.correct },
    { label: copyText("q1.field3.label"), value: payload.q1Field3, result: payload.answerCheck.q1Field3?.correct },
    { label: copyText("q2.field1.label"), value: payload.q2Field1, result: payload.answerCheck.q2Field1?.correct },
    { label: copyText("q2.field2.label"), value: payload.q2Field2, result: payload.answerCheck.q2Field2?.correct },
    { label: copyText("q2.field3.label"), value: payload.q2Field3, result: payload.answerCheck.q2Field3?.correct },
    { label: copyText("q3.field1.label"), value: payload.q3Field1, result: payload.answerCheck.q3Field1?.correct },
    { label: copyText("q3.field2.label"), value: payload.q3Field2, result: payload.answerCheck.q3Field2?.correct },
  ];

  elements.reviewSummary.innerHTML = "";
  rows.forEach((row) => {
    const item = document.createElement("div");
    item.className = "review-row";

    if (row.result === true) {
      item.classList.add("correct");
    }
    if (row.result === false) {
      item.classList.add("incorrect");
    }

    const label = document.createElement("div");
    label.className = "review-label";
    label.textContent = row.label;

    const value = document.createElement("div");
    value.className = "review-value";
    value.textContent = row.value || "-";

    item.append(label, value);
    elements.reviewSummary.appendChild(item);
  });
}

function buildStoredRecord(payload) {
  return {
    participantName: payload.participantName || "Unknown",
    mapCountrySelection: payload.mapCountrySelection || "",
    raffleEntries: Number(payload.raffleEntries || 0),
    submittedAt: payload.submittedAt || new Date().toISOString(),
    payload,
  };
}

function saveRecordToLocal(record) {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
    const existing = raw ? JSON.parse(raw) : [];
    existing.push(record);
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(existing));
    return true;
  } catch (error) {
    console.error(error);
    return false;
  }
}

function getLocalRecords(limit = HISTORY_LIMIT) {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
    const existing = raw ? JSON.parse(raw) : [];
    return existing.slice(-limit).reverse();
  } catch (error) {
    console.error(error);
    return [];
  }
}

async function saveSubmissionRecord(payload) {
  const record = buildStoredRecord(payload);

  if (
    state.storageConfig.mode === "supabase" &&
    state.storageConfig.supabaseUrl &&
    state.storageConfig.supabaseAnonKey
  ) {
    try {
      const response = await fetch(
        `${state.storageConfig.supabaseUrl.replace(/\/$/, "")}/rest/v1/${state.storageConfig.supabaseTable}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            apikey: state.storageConfig.supabaseAnonKey,
            Authorization: `Bearer ${state.storageConfig.supabaseAnonKey}`,
            Prefer: "return=minimal",
          },
          body: JSON.stringify([record]),
        }
      );

      if (!response.ok) {
        throw new Error(`Supabase save failed (${response.status})`);
      }

      return true;
    } catch (error) {
      console.error(error);
      return false;
    }
  }

  return saveRecordToLocal(record);
}

async function fetchRecentMapGuesses(limit = HISTORY_LIMIT) {
  if (
    state.storageConfig.mode === "supabase" &&
    state.storageConfig.supabaseUrl &&
    state.storageConfig.supabaseAnonKey
  ) {
    try {
      const baseUrl = `${state.storageConfig.supabaseUrl.replace(/\/$/, "")}/rest/v1/${state.storageConfig.supabaseTable}`;
      const query = `?select=participantName,mapCountrySelection,raffleEntries,submittedAt&order=submittedAt.desc&limit=${limit}`;
      const response = await fetch(`${baseUrl}${query}`, {
        headers: {
          apikey: state.storageConfig.supabaseAnonKey,
          Authorization: `Bearer ${state.storageConfig.supabaseAnonKey}`,
        },
      });

      if (!response.ok) {
        throw new Error(`Supabase read failed (${response.status})`);
      }

      const data = await response.json();
      return Array.isArray(data) ? data : [];
    } catch (error) {
      console.warn(error);
      setFormFeedbackByKey("history.loadFailed", "lose");
      return [];
    }
  }

  return getLocalRecords(limit);
}
function renderHistoryLegend(records) {
  elements.historyLegend.innerHTML = "";

  if (!records.length) {
    const item = document.createElement("li");
    item.textContent = copyText("history.noRecords");
    elements.historyLegend.appendChild(item);
    return;
  }

  records.forEach((record, index) => {
    const color = HISTORY_COLORS[index % HISTORY_COLORS.length];
    const item = document.createElement("li");

    const swatch = document.createElement("span");
    swatch.className = "legend-swatch";
    swatch.style.backgroundColor = color;

    const text = document.createElement("span");
    text.textContent = `${record.participantName || "Unknown"} - ${record.mapCountrySelection || "Unknown"}`;

    item.append(swatch, text);
    elements.historyLegend.appendChild(item);
  });
}

async function ensureHistoryMapInitialized() {
  if (!state.historyMap) {
    state.historyMap = L.map("historyMap", {
      minZoom: 2,
      worldCopyJump: true,
    }).setView([20, 0], 2);

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      maxZoom: 7,
    }).addTo(state.historyMap);
  }

  window.setTimeout(() => {
    if (state.historyMap) {
      state.historyMap.invalidateSize();
    }
  }, 140);

  return state.historyMap;
}

async function renderHistoryMap(records) {
  await ensureHistoryMapInitialized();

  try {
    const geojson = await ensureGeojsonData();
    const countryColorMap = new Map();

    records.forEach((record, index) => {
      const countryName = normalizeValue(record.mapCountrySelection || "");
      if (!countryName) {
        return;
      }

      if (!countryColorMap.has(countryName)) {
        countryColorMap.set(countryName, HISTORY_COLORS[index % HISTORY_COLORS.length]);
      }
    });

    if (state.historyLayer) {
      state.historyMap.removeLayer(state.historyLayer);
      state.historyLayer = null;
    }

    const boundsToFit = [];
    state.historyLayer = L.geoJSON(geojson, {
      style: (feature) => {
        const name = normalizeValue(getCountryName(feature));
        const color = countryColorMap.get(name);

        if (color) {
          return {
            color: "#2c174f",
            weight: 1,
            fillColor: color,
            fillOpacity: 0.72,
          };
        }

        return {
          color: "#6a5895",
          weight: 0.8,
          fillColor: "#ddd2f8",
          fillOpacity: 0.46,
        };
      },
      onEachFeature: (feature, layer) => {
        const name = normalizeValue(getCountryName(feature));
        if (countryColorMap.has(name)) {
          boundsToFit.push(layer.getBounds());
        }
      },
    }).addTo(state.historyMap);

    if (boundsToFit.length > 0) {
      const merged = L.latLngBounds(boundsToFit[0]);
      for (let index = 1; index < boundsToFit.length; index += 1) {
        merged.extend(boundsToFit[index]);
      }
      state.historyMap.fitBounds(merged, { padding: [16, 16] });
    } else {
      state.historyMap.setView([20, 0], 2);
    }
  } catch (error) {
    console.error(error);
    setFormFeedbackByKey("history.loadFailed", "lose");
  }
}

async function loadHistoryPage() {
  const records = await fetchRecentMapGuesses(HISTORY_LIMIT);
  renderHistoryLegend(records);
  await renderHistoryMap(records);
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
    ensureGameMapInitialized();
  }

  if (state.currentStepIndex === 5) {
    renderReviewPage();
  }

  if (state.currentStepIndex === 6) {
    loadHistoryPage();
  }

  if (state.currentStepIndex === 0) {
    elements.participantNameInput.focus();
  }

  if (state.currentStepIndex >= 2 && state.currentStepIndex <= 4) {
    const firstInput = elements.wizardSteps[state.currentStepIndex].querySelector("input:not([type='hidden'])");
    if (firstInput) {
      firstInput.focus();
    }
  }
}

function nextStep() {
  if (!validateStep(state.currentStepIndex)) {
    return;
  }

  showStep(state.currentStepIndex + 1);
}

function validateAllCoreSteps() {
  for (let stepIndex = 0; stepIndex <= 4; stepIndex += 1) {
    if (!validateStep(stepIndex)) {
      return false;
    }
  }

  return true;
}

async function handleSubmit(event) {
  event.preventDefault();

  if (state.currentStepIndex !== 5) {
    return;
  }

  if (!validateAllCoreSteps()) {
    return;
  }

  const payload = state.pendingSubmission || buildSubmissionPayload();
  const saved = await saveSubmissionRecord(payload);

  if (!saved) {
    setFormFeedbackByKey("form.feedback.saveFailed", "lose");
    return;
  }

  showStep(6);
  setFormFeedbackByKey("form.feedback.saved", "win", { entries: payload.raffleEntries });
}

function bindEvents() {
  elements.playClueButton.addEventListener("click", playClueAudio);
  elements.submitMapGuessButton.addEventListener("click", submitMapGuess);
  elements.nextStepButton.addEventListener("click", nextStep);
  elements.eventForm.addEventListener("submit", handleSubmit);

  elements.eventForm.addEventListener("keydown", (event) => {
    if (event.key !== "Enter" || state.currentStepIndex >= 5) {
      return;
    }

    const target = event.target;
    if (!(target instanceof HTMLElement) || target.tagName === "TEXTAREA") {
      return;
    }

    event.preventDefault();
    nextStep();
  });
}
async function initialize() {
  if (!hasRequiredElements()) {
    return;
  }

  await loadCopy();
  await loadAnswerKey();
  await loadStorageConfig();
  applyCopyToDom();
  initializeAudio();
  bindEvents();
  updateGameButtons();
  syncMapGuessFields();
  setStatusByKey("game.status.waitingToStart");
  setGameFeedback("");
  showStep(0);
}

initialize();

